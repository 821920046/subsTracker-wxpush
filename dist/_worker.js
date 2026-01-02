function json(data, init) {
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
    ...init
  });
}
function unauthorized() {
  return json({ error: "unauthorized" }, { status: 401 });
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
      return new Response("subs-wxpush");
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
