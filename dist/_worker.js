function json(data, init) {
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
    ...init
  });
}
function unauthorized() {
  return json({ error: "unauthorized" }, { status: 401 });
}
function html(data, init) {
  return new Response(data, {
    headers: { "content-type": "text/html; charset=utf-8" },
    ...init
  });
}
async function parseJson(request) {
  const text = await request.text();
  if (!text) return {};
  return JSON.parse(text);
}
function getBearerToken(request) {
  const h = request.headers.get("authorization") || "";
  if (h.toLowerCase().startsWith("bearer ")) return h.slice(7).trim();
  return null;
}
async function requireAuth(request, env) {
  const url = new URL(request.url);
  const bearer = getBearerToken(request);
  const token = bearer || url.searchParams.get("token");
  if (!token) return false;
  return token === env.API_TOKEN;
}
async function getSubs(env) {
  const raw = await env.SUBSCRIPTIONS_KV.get("subs:list");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
async function saveSubs(env, subs) {
  await env.SUBSCRIPTIONS_KV.put("subs:list", JSON.stringify(subs));
}
function daysUntil(dateStr) {
  const now = new Date();
  const d = new Date(dateStr + "T00:00:00Z");
  const ms = d.getTime() - Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor(ms / 86400000);
}
async function getAccessToken(env, appid, secret) {
  const useKV = env.WXPUSH_KV;
  if (useKV) {
    const cached = await useKV.get("wx_access_token");
    if (cached) return cached;
  }
  const a = appid || env.WX_APPID;
  const s = secret || env.WX_SECRET;
  const r = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${encodeURIComponent(a)}&secret=${encodeURIComponent(s)}`);
  const j = await r.json();
  const token = j.access_token;
  const ttl = typeof j.expires_in === "number" ? Math.max(1, j.expires_in - 300) : 7000;
  if (env.WXPUSH_KV && token) {
    await env.WXPUSH_KV.put("wx_access_token", token, { expirationTtl: ttl });
  }
  return token;
}
async function sendWeChat(env, title, content, opts) {
  const token = await getAccessToken(env, opts && opts.appid, opts && opts.secret);
  const users = ((opts && opts.userid) || env.WX_USERID).split("|").map((s) => s.trim()).filter(Boolean);
  const templateId = (opts && opts.template_id) || env.WX_TEMPLATE_ID;
  const results = [];
  for (const u of users) {
    const payload = {
      touser: u,
      template_id: templateId,
      url: (opts && opts.url) || "",
      data: {
        first: { value: title },
        remark: { value: content }
      }
    };
    const res = await fetch(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const body = await res.json().catch(() => ({}));
    const ok = res.ok && (body.errcode === 0 || body.errmsg === "ok");
    results.push({ user: u, ok, status: res.status, body });
  }
  return results;
}
async function handleWxSend(request, env) {
  const authed = await requireAuth(request, env);
  if (!authed) return unauthorized();
  const body = await parseJson(request);
  if (!body.title || !body.content) return json({ error: "missing title or content" }, { status: 400 });
  const results = await sendWeChat(env, body.title, body.content, {
    userid: body.userid,
    template_id: body.template_id,
    url: body.url,
    appid: body.appid,
    secret: body.secret
  });
  return json({ results });
}
async function handleSubs(request, env) {
  const authed = await requireAuth(request, env);
  if (!authed) return unauthorized();
  const url = new URL(request.url);
  if (url.pathname === "/subs/bulk" && request.method === "POST") {
    const bodyText = await request.text();
    const parsed = bodyText ? JSON.parse(bodyText) : [];
    const items = Array.isArray(parsed) ? parsed : (parsed.items || []);
    const list = await getSubs(env);
    for (const it of items) {
      if (it.id) {
        const idx = list.findIndex((s) => s.id === it.id);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...it };
        } else {
          list.push({
            id: it.id,
            name: it.name || "",
            expireDate: it.expireDate || "",
            remindDays: it.remindDays ?? 0,
            enabled: it.enabled ?? true,
            remark: it.remark
          });
        }
      } else {
        list.push({
          id: crypto.randomUUID(),
          name: it.name || "",
          expireDate: it.expireDate || "",
          remindDays: it.remindDays ?? 0,
          enabled: it.enabled ?? true,
          remark: it.remark
        });
      }
    }
    await saveSubs(env, list);
    return json({ ok: true, count: items.length });
  }
  if (request.method === "GET") {
    const list = await getSubs(env);
    return json({ list });
  }
  if (request.method === "POST") {
    const payload = await parseJson(request);
    const list = await getSubs(env);
    if (payload.id) {
      const idx = list.findIndex((s) => s.id === payload.id);
      if (idx >= 0) {
        const updated = { ...list[idx], ...payload };
        list[idx] = updated;
      } else {
        const created = {
          id: payload.id,
          name: payload.name || "",
          expireDate: payload.expireDate || "",
          remindDays: payload.remindDays ?? 0,
          enabled: payload.enabled ?? true,
          remark: payload.remark
        };
        list.push(created);
      }
    } else {
      const created = {
        id: crypto.randomUUID(),
        name: payload.name || "",
        expireDate: payload.expireDate || "",
        remindDays: payload.remindDays ?? 0,
        enabled: payload.enabled ?? true,
        remark: payload.remark
      };
      list.push(created);
    }
    await saveSubs(env, list);
    return json({ ok: true });
  }
  if (request.method === "DELETE") {
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts[parts.length - 1];
    if (!id) return json({ error: "missing id" }, { status: 400 });
    const list = await getSubs(env);
    const next = list.filter((s) => s.id !== id);
    await saveSubs(env, next);
    return json({ ok: true });
  }
  return json({ error: "method not allowed" }, { status: 405 });
}
async function handleCheck(env) {
  const list = await getSubs(env);
  const due = list.filter((s) => s.enabled).filter((s) => {
    const d = daysUntil(s.expireDate);
    return d >= 0 && d <= s.remindDays;
  });
  const results = [];
  for (const s of due) {
    const title = "订阅到期提醒";
    const content = `名称: ${s.name}\n到期日期: ${s.expireDate}\n剩余天数: ${daysUntil(s.expireDate)}\n备注: ${s.remark || ""}`;
    const r = await sendWeChat(env, title, content);
    results.push({ id: s.id, name: s.name, notify: r });
  }
  return { count: due.length, results };
}
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/") {
      const page = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>订阅管理</title><style>body{font-family:system-ui,Arial,sans-serif;margin:0;background:#f5f7ff}h1{font-size:20px}input,select,textarea,button{font-size:14px;margin:4px}table{border-collapse:collapse;width:100%;margin-top:10px}th,td{border:1px solid #ddd;padding:8px;text-align:left}tr:nth-child(even){background:#f6f6f6}#status{margin:6px 0;color:#666}.container{max-width:960px;margin:24px auto;padding:16px}.card{background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.08);padding:16px}.hidden{display:none}.login-wrap{display:flex;align-items:center;justify-content:center;height:100vh}.login-card{width:360px;background:#fff;border-radius:16px;box-shadow:0 12px 32px rgba(0,0,0,0.12);padding:24px;text-align:center}.brand{font-size:24px;font-weight:700;color:#5b6bff;margin-bottom:6px}.sub{color:#9aa0a6;margin-bottom:16px}.token-input{width:100%;padding:10px;border:1px solid #ddd;border-radius:8px}.primary{width:100%;padding:10px;background:#7a58ff;color:#fff;border:none;border-radius:8px;margin-top:12px;cursor:pointer}.topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}</style></head><body><div id="login" class="login-wrap"><div class="login-card"><div class="brand">SubsTracker-wxpush</div><div class="sub">轻订阅系统管理</div><input id="loginToken" class="token-input" placeholder="请输入 Access Token"><button id="loginBtn" class="primary">进入系统</button><div id="loginStatus" style="margin-top:8px;color:#666"></div></div></div><div id="app" class="container hidden"><div class="card"><div class="topbar"><h1>订阅管理</h1><div><button id="logoutBtn">退出登录</button><span id="status" style="margin-left:8px"></span></div></div><div><h2>新增/更新订阅</h2><div><input id="id" placeholder="可选ID"><input id="name" placeholder="名称"><input id="expireDate" type="date"><input id="remindDays" type="number" placeholder="提前提醒天数"><label><input id="enabled" type="checkbox" checked>启用</label><input id="remark" placeholder="备注"><button id="addBtn">提交</button></div></div><div><h2>批量导入</h2><textarea id="bulk" rows="6" style="width:100%" placeholder='JSON数组或{ \"items\": [...] }'></textarea><button id="bulkBtn">批量提交</button></div><div><h2>订阅列表</h2><button id="refreshBtn">刷新</button><button id="checkBtn">到期检查并推送</button><table><thead><tr><th>ID</th><th>名称</th><th>到期</th><th>提前天数</th><th>启用</th><th>备注</th><th>操作</th></tr></thead><tbody id="tbody"></tbody></table></div></div></div><script>const login=document.getElementById("login");const app=document.getElementById("app");const loginInput=document.getElementById("loginToken");const loginBtn=document.getElementById("loginBtn");const loginStatus=document.getElementById("loginStatus");const sEl=document.getElementById("status");function getToken(){return localStorage.getItem("api_token")||""}function setToken(v){localStorage.setItem("api_token",v)}function showApp(){login.classList.add("hidden");app.classList.remove("hidden")}function showLogin(){app.classList.add("hidden");login.classList.remove("hidden")}async function api(path,options){const token=getToken();const headers=Object.assign({},options&&options.headers||{},token?{Authorization:"Bearer "+token}:{}) ;const res=await fetch(path,Object.assign({},options,{headers}));const ct=res.headers.get("content-type")||"";if(ct.includes("application/json")){const j=await res.json();return {ok:res.ok,data:j}}else{const txt=await res.text();return {ok:res.ok,data:txt}}}async function tryLogin(v){if(!v){loginStatus.textContent="请输入 Token";return}setToken(v.trim());const r=await api("/health");if(r.ok&&r.data&&r.data.env&&r.data.env.API_TOKEN){loginStatus.textContent="登录成功";showApp();refresh()}else{loginStatus.textContent="Token 无效"}}loginBtn.onclick=()=>tryLogin(loginInput.value);document.getElementById("logoutBtn").onclick=()=>{localStorage.removeItem("api_token");location.reload()};if(getToken()){showApp()}else{showLogin()}async function refresh(){const r=await api("/subs");const tb=document.getElementById("tbody");tb.innerHTML="";if(!r.ok){sEl.textContent="列表失败";return}for(const it of r.data.list){const tr=document.createElement("tr");tr.innerHTML="<td>"+it.id+"</td><td>"+it.name+"</td><td>"+it.expireDate+"</td><td>"+it.remindDays+"</td><td>"+(it.enabled?"是":"否")+"</td><td>"+(it.remark||"")+"</td><td><button data-id='"+it.id+"' class='del'>删除</button><button data-id='"+it.id+"' class='toggle'>切换启用</button></td>";tb.appendChild(tr)}tb.querySelectorAll(".del").forEach(b=>b.onclick=async(e)=>{const id=e.target.getAttribute("data-id");const r=await api("/subs/"+id,{method:"DELETE"});if(r.ok)refresh()});tb.querySelectorAll(".toggle").forEach(b=>b.onclick=async(e)=>{const id=e.target.getAttribute("data-id");const r0=await api("/subs");const it=r0.ok?r0.data.list.find((x)=>x.id===id):null;if(!it)return;it.enabled=!it.enabled;await api("/subs",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(it)});refresh()})}document.getElementById("refreshBtn").onclick=refresh;document.getElementById("addBtn").onclick=async()=>{const payload={id:document.getElementById("id").value.trim()||void 0,name:document.getElementById("name").value.trim(),expireDate:document.getElementById("expireDate").value,remindDays:parseInt(document.getElementById("remindDays").value||"0"),enabled:document.getElementById("enabled").checked,remark:document.getElementById("remark").value.trim()};const r=await api("/subs",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});sEl.textContent=r.ok?"提交成功":"提交失败";refresh()};document.getElementById("bulkBtn").onclick=async()=>{try{const text=document.getElementById("bulk").value;const parsed=text?JSON.parse(text):[];const r=await api("/subs/bulk",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(parsed)});sEl.textContent=r.ok?"批量成功":"批量失败";refresh()}catch(e){sEl.textContent="JSON 解析失败"}};document.getElementById("checkBtn").onclick=async()=>{const r=await api("/check",{method:"POST"});sEl.textContent=r.ok?"已触发到期检查":"触发失败"};if(getToken())refresh();</script></body></html>`;
      return html(page);
    }
    if (url.pathname === "/health") {
      return json({
        ok: true,
        env: {
          API_TOKEN: !!env.API_TOKEN,
          WX_APPID: !!env.WX_APPID,
          WX_SECRET: !!env.WX_SECRET,
          WX_USERID: !!env.WX_USERID,
          WX_TEMPLATE_ID: !!env.WX_TEMPLATE_ID,
          SUBSCRIPTIONS_KV: !!env.SUBSCRIPTIONS_KV,
          WXPUSH_KV: !!env.WXPUSH_KV
        }
      });
    }
    if (url.pathname.startsWith("/wxsend")) {
      if (request.method === "GET") {
        const authed = await requireAuth(request, env);
        if (!authed) return unauthorized();
        const title = url.searchParams.get("title") || "";
        const content = url.searchParams.get("content") || "";
        const userid = url.searchParams.get("userid") || void 0;
        if (!title || !content) return json({ error: "missing title or content" }, { status: 400 });
        const results = await sendWeChat(env, title, content, { userid });
        return json({ results });
      }
      return handleWxSend(request, env);
    }
    if (url.pathname.startsWith("/subs")) {
      return handleSubs(request, env);
    }
    if (url.pathname.startsWith("/check")) {
      const authed = await requireAuth(request, env);
      if (!authed) return unauthorized();
      const r = await handleCheck(env);
      return json(r);
    }
    return json({ error: "not found" }, { status: 404 });
  },
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(handleCheck(env));
  }
};
export {
  worker_default as default
};
