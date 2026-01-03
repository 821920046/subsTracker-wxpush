import { Env } from './types';
import { adminPage } from './templates/admin';
import { configPage } from './templates/config';
import { loginPage } from './templates/login';
import { handleDebugRequest } from './templates/debug';
import { SubscriptionService } from './services/subscription';
import { 
  sendNotificationToAllChannels, 
  sendTelegramNotification, 
  sendNotifyXNotification, 
  sendWeNotifyEdgeNotification,
  sendWebhookNotification,
  sendWechatBotNotification,
  sendWeChatOfficialAccountNotification,
  sendEmailNotification,
  sendBarkNotification,
  formatNotificationContent
} from './services/notification';
import { getConfig, getRawConfig } from './utils/config';
import { generateJWT, verifyJWT, generateRandomSecret } from './utils/auth';
import { getCurrentTimeInTimezone, formatTimeInTimezone } from './utils/date';
import { getCookieValue } from './utils/http';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Debug page
    if (url.pathname === '/debug') {
      return handleDebugRequest(request, env);
    }

    // API Routes
    if (url.pathname.startsWith('/api')) {
      return handleApiRequest(request, env);
    }

    // Admin Routes
    if (url.pathname.startsWith('/admin')) {
      return handleAdminRequest(request, env);
    }

    // Default: Login or Redirect to Admin
    return handleMainRequest(request, env);
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const config = await getConfig(env);
    const timezone = config.timezone || 'UTC';
    const now = new Date();
    const dtf = new Intl.DateTimeFormat('zh-CN', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    const parts = dtf.formatToParts(now);
    const get = (type: string) => parts.find(x => x.type === type)?.value || '00';
    const hhmm = `${get('hour')}:${get('minute')}`;
    const times = (config.reminderTimes && config.reminderTimes.length > 0) ? config.reminderTimes : ['08:00'];
    if (!times.includes(hhmm)) {
      return;
    }
    
    const subscriptionService = new SubscriptionService(env);
    const { notifications } = await subscriptionService.checkExpiringSubscriptions();
    
    if (notifications.length > 0) {
      // 按到期时间排序
      notifications.sort((a, b) => a.daysUntil - b.daysUntil);
      
      const subscriptions = notifications.map(n => ({
        ...n.subscription,
        daysRemaining: n.daysUntil
      }));

      const commonContent = formatNotificationContent(subscriptions, config);
      const title = '订阅到期提醒';
      await sendNotificationToAllChannels(title, commonContent, config, env, '[定时任务]');
    }
  }
};

async function handleMainRequest(request: Request, env: Env): Promise<Response> {
  return new Response(loginPage, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

async function handleAdminRequest(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const token = getCookieValue(request.headers.get('Cookie'), 'token');
    const config = await getConfig(env);
    const user = token ? await verifyJWT(token, config.jwtSecret!) : null;

    if (!user) {
      return new Response('', {
        status: 302,
        headers: { 'Location': '/' }
      });
    }

    if (url.pathname === '/admin/config') {
      return new Response(configPage, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    return new Response(adminPage, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error) {
    console.error('[Admin] Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

async function handleApiRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.slice(4); // Remove '/api'
  const method = request.method;
  const config = await getConfig(env);
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';

  async function isRateLimited(base: string, limit: number): Promise<boolean> {
    const bucket = Math.floor(Date.now() / 60000);
    const key = `rate:${base}:${ip}:${bucket}`;
    const val = await env.SUBSCRIPTIONS_KV.get(key);
    let count = 0;
    if (val) count = parseInt(val) || 0;
    count++;
    await env.SUBSCRIPTIONS_KV.put(key, String(count));
    return count > limit;
  }

  if (path === '/dev/reset-login' && method === 'POST') {
    try {
      const url = new URL(request.url);
      const isLocal = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
      if (!isLocal) {
        return new Response(JSON.stringify({ success: false, message: '仅限本地开发使用' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
      }
      const raw = await getRawConfig(env);
      raw.ADMIN_USERNAME = 'admin';
      raw.ADMIN_PASSWORD = 'password';
      if (!raw.JWT_SECRET) {
        raw.JWT_SECRET = generateRandomSecret();
      }
      await env.SUBSCRIPTIONS_KV.put('config', JSON.stringify(raw));
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    } catch (e: any) {
      return new Response(JSON.stringify({ success: false, message: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // Public API: Login
  if (path === '/login' && method === 'POST') {
    try {
      if (await isRateLimited('login', 10)) {
        return new Response(JSON.stringify({ success: false, message: '请求过于频繁' }), { status: 429, headers: { 'Content-Type': 'application/json' } });
      }
      const body: any = await request.json();
      const expectedUser = config.adminUsername || 'admin';
      const expectedPass = config.adminPassword || 'password';
      const inputUser = (body.username || '').toString();
      const inputPass = (body.password || '').toString();
      const ok = inputUser === expectedUser && inputPass === expectedPass;
      if (ok) {
        const token = await generateJWT(body.username, config.jwtSecret!);
        const isLocal = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
        const secureFlag = isLocal ? '' : '; Secure';
        return new Response(JSON.stringify({ success: true }), {
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400${secureFlag}`
          }
        });
      } else {
        return new Response(JSON.stringify({ success: false, message: '用户名或密码错误' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (e) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid request' }), { status: 400 });
    }
  }

  // Public API: Logout
  if (path === '/logout' && (method === 'GET' || method === 'POST')) {
    const isLocal = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
    const secureFlag = isLocal ? '' : '; Secure';
    return new Response('', {
      status: 302,
      headers: {
        'Location': '/',
        'Set-Cookie': `token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secureFlag}`
      }
    });
  }
  
  // Third-party Notification API (Public)
  if (path.startsWith('/notify/')) {
      // ... implementation ...
      // reusing existing logic structure
      if (method === 'POST') {
        try {
          if (await isRateLimited('notify', 20)) {
            return new Response(JSON.stringify({ message: '请求过于频繁' }), { status: 429, headers: { 'Content-Type': 'application/json' } });
          }
          const tokenHeader = request.headers.get('X-Notify-Token') || '';
          const tokenQuery = url.searchParams.get('token') || '';
          const providedToken = tokenHeader || tokenQuery;
          if (!providedToken || providedToken !== (config.jwtSecret || '')) {
            return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
          }
          const body: any = await request.json();
          const title = body.title || '第三方通知';
          const content = body.content || '';

          if (!content) {
            return new Response(JSON.stringify({ message: '缺少必填参数 content' }), { status: 400 });
          }

          await sendNotificationToAllChannels(title, content, config, env, '[第三方API]');

          return new Response(JSON.stringify({
              message: '发送成功',
              response: { errcode: 0, errmsg: 'ok', msgid: 'MSGID' + Date.now() }
            }), { headers: { 'Content-Type': 'application/json' } });
        } catch (error: any) {
          return new Response(JSON.stringify({
              message: '发送失败',
              response: { errcode: 1, errmsg: error.message }
            }), { status: 500 });
        }
      }
  }

  // Auth Check for other APIs
  const token = getCookieValue(request.headers.get('Cookie'), 'token');
  const user = token ? await verifyJWT(token, config.jwtSecret!) : null;

  if (!user) {
    return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Config API
  if (path === '/config') {
    if (method === 'GET') {
      const rawConfig = await getRawConfig(env);
      const { JWT_SECRET, ADMIN_PASSWORD, ...safeConfig } = rawConfig;
      return new Response(JSON.stringify(safeConfig), { headers: { 'Content-Type': 'application/json' } });
    }
    if (method === 'POST') {
      try {
        const newConfig: any = await request.json();
        const currentRawConfig = await getRawConfig(env);
        
        const updatedConfig = {
            ...currentRawConfig,
            ADMIN_USERNAME: newConfig.ADMIN_USERNAME || currentRawConfig.ADMIN_USERNAME,
            TG_BOT_TOKEN: newConfig.TG_BOT_TOKEN || '',
            TG_CHAT_ID: newConfig.TG_CHAT_ID || '',
            NOTIFYX_API_KEY: newConfig.NOTIFYX_API_KEY || '',
            WENOTIFY_URL: newConfig.WENOTIFY_URL || '',
            WENOTIFY_TOKEN: newConfig.WENOTIFY_TOKEN || '',
            WENOTIFY_USERID: newConfig.WENOTIFY_USERID || '',
            WENOTIFY_TEMPLATE_ID: newConfig.WENOTIFY_TEMPLATE_ID || '',
            WENOTIFY_PATH: newConfig.WENOTIFY_PATH || currentRawConfig.WENOTIFY_PATH || '/wxsend',
            WEBHOOK_URL: newConfig.WEBHOOK_URL || '',
            WEBHOOK_METHOD: newConfig.WEBHOOK_METHOD || 'POST',
            WEBHOOK_HEADERS: newConfig.WEBHOOK_HEADERS || '',
            WEBHOOK_TEMPLATE: newConfig.WEBHOOK_TEMPLATE || '',
            SHOW_LUNAR: newConfig.SHOW_LUNAR === true,
            WECHATBOT_WEBHOOK: newConfig.WECHATBOT_WEBHOOK || '',
            WECHATBOT_MSG_TYPE: newConfig.WECHATBOT_MSG_TYPE || 'text',
            WECHATBOT_AT_MOBILES: newConfig.WECHATBOT_AT_MOBILES || '',
            WECHATBOT_AT_ALL: newConfig.WECHATBOT_AT_ALL || 'false',
            WECHAT_OA_APPID: newConfig.WECHAT_OA_APPID || '',
            WECHAT_OA_APPSECRET: newConfig.WECHAT_OA_APPSECRET || '',
            WECHAT_OA_TEMPLATE_ID: newConfig.WECHAT_OA_TEMPLATE_ID || '',
            WECHAT_OA_USERIDS: newConfig.WECHAT_OA_USERIDS || '',
            RESEND_API_KEY: newConfig.RESEND_API_KEY || '',
            EMAIL_FROM: newConfig.EMAIL_FROM || '',
            EMAIL_FROM_NAME: newConfig.EMAIL_FROM_NAME || '',
        EMAIL_TO: newConfig.EMAIL_TO || '',
        BARK_DEVICE_KEY: newConfig.BARK_DEVICE_KEY || '',
        BARK_SERVER: newConfig.BARK_SERVER || 'https://api.day.app',
        BARK_IS_ARCHIVE: newConfig.BARK_IS_ARCHIVE || 'false',
        ENABLED_NOTIFIERS: newConfig.ENABLED_NOTIFIERS || ['notifyx'],
        TIMEZONE: newConfig.TIMEZONE || currentRawConfig.TIMEZONE || 'UTC',
        REMINDER_TIMES: newConfig.REMINDER_TIMES || currentRawConfig.REMINDER_TIMES || ''
      };
        
        if (newConfig.ADMIN_PASSWORD) {
            updatedConfig.ADMIN_PASSWORD = newConfig.ADMIN_PASSWORD;
        }

        if (!updatedConfig.JWT_SECRET || updatedConfig.JWT_SECRET === 'your-secret-key') {
            updatedConfig.JWT_SECRET = generateRandomSecret();
        }

        await env.SUBSCRIPTIONS_KV.put('config', JSON.stringify(updatedConfig));
        return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
      } catch (error: any) {
        return new Response(JSON.stringify({ success: false, message: error.message }), { status: 400 });
      }
    }
  }

  // Test Notification API
  if (path === '/test-notification' && method === 'POST') {
    try {
        const body: any = await request.json();
        let success = false;
        
        // Create temporary config for test with overrides
        const tempConfig = { ...config };
        
        if (body.type === 'telegram') {
            tempConfig.telegram = {
                botToken: body.TG_BOT_TOKEN || config.telegram?.botToken || '',
                chatId: body.TG_CHAT_ID || config.telegram?.chatId || ''
            };
            const content = '*测试通知*\n\n这是一条测试通知...';
            success = await sendTelegramNotification(content, tempConfig);
        } else if (body.type === 'notifyx') {
            tempConfig.notifyx = {
                apiKey: body.NOTIFYX_API_KEY || config.notifyx?.apiKey || ''
            };
            success = await sendNotifyXNotification('测试通知', '## 测试通知...', '测试描述', tempConfig);
        } else if (body.type === 'wenotify') {
            tempConfig.wenotify = {
                url: body.WENOTIFY_URL || config.wenotify?.url || '',
                token: body.WENOTIFY_TOKEN || config.wenotify?.token || '',
                userid: body.WENOTIFY_USERID || config.wenotify?.userid || '',
                templateId: body.WENOTIFY_TEMPLATE_ID || config.wenotify?.templateId || ''
            };
            success = await sendWeNotifyEdgeNotification('测试通知', '测试通知...', tempConfig, true);
        } else if (body.type === 'webhook') {
            tempConfig.webhook = {
                url: body.WEBHOOK_URL || config.webhook?.url || '',
                method: body.WEBHOOK_METHOD || config.webhook?.method || 'POST',
                headers: body.WEBHOOK_HEADERS || config.webhook?.headers || '',
                template: body.WEBHOOK_TEMPLATE || config.webhook?.template || ''
            };
            success = await sendWebhookNotification('测试通知', '测试通知...', tempConfig);
        } else if (body.type === 'wechatbot') {
            tempConfig.wechatBot = {
                webhook: body.WECHATBOT_WEBHOOK || config.wechatBot?.webhook || '',
                msgType: body.WECHATBOT_MSG_TYPE || config.wechatBot?.msgType || 'text',
                atMobiles: body.WECHATBOT_AT_MOBILES || config.wechatBot?.atMobiles || '',
                atAll: body.WECHATBOT_AT_ALL || config.wechatBot?.atAll || 'false'
            };
            success = await sendWechatBotNotification('测试通知', '测试通知...', tempConfig);
        } else if (body.type === 'wechatOfficialAccount') {
            tempConfig.wechatOfficialAccount = {
                appId: body.WECHAT_OA_APPID || config.wechatOfficialAccount?.appId || '',
                appSecret: body.WECHAT_OA_APPSECRET || config.wechatOfficialAccount?.appSecret || '',
                templateId: body.WECHAT_OA_TEMPLATE_ID || config.wechatOfficialAccount?.templateId || '',
                userIds: body.WECHAT_OA_USERIDS || config.wechatOfficialAccount?.userIds || ''
            };
            success = await sendWeChatOfficialAccountNotification('测试通知', '这是一条测试通知', tempConfig, env);
        } else if (body.type === 'email') {
            tempConfig.email = {
                resendApiKey: body.RESEND_API_KEY || config.email?.resendApiKey || '',
                fromEmail: body.EMAIL_FROM || config.email?.fromEmail || '',
                toEmail: body.EMAIL_TO || config.email?.toEmail || ''
            };
            success = await sendEmailNotification('测试通知', '测试通知...', tempConfig);
        } else if (body.type === 'bark') {
            tempConfig.bark = {
                server: body.BARK_SERVER || config.bark?.server || '',
                deviceKey: body.BARK_DEVICE_KEY || config.bark?.deviceKey || '',
                isArchive: body.BARK_IS_ARCHIVE || config.bark?.isArchive || 'false'
            };
            success = await sendBarkNotification('测试通知', '测试通知...', tempConfig);
        }
        
        return new Response(JSON.stringify({ success, message: success ? '发送成功' : '发送失败' }), { headers: { 'Content-Type': 'application/json' } });
    } catch (error: any) {
        return new Response(JSON.stringify({ success: false, message: error?.message || '未知错误' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // Subscriptions API
  const subscriptionService = new SubscriptionService(env);
  
  if (path === '/subscriptions') {
    if (method === 'GET') {
      const subscriptions = await subscriptionService.getAllSubscriptions();
      return new Response(JSON.stringify(subscriptions), { headers: { 'Content-Type': 'application/json' } });
    }
    if (method === 'POST') {
      const sub = await request.json();
      const result = await subscriptionService.createSubscription(sub as any);
      return new Response(JSON.stringify(result), { status: result.success ? 201 : 400, headers: { 'Content-Type': 'application/json' } });
    }
  }

  if (path.startsWith('/subscriptions/')) {
    const parts = path.split('/');
    const id = parts[2];

    if (parts[3] === 'toggle-status' && method === 'POST') {
      const body: any = await request.json();
      const result = await subscriptionService.toggleSubscriptionStatus(id, body.isActive);
      return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (parts[3] === 'test-notify' && method === 'POST') {
      // Implement test notify for single subscription
      try {
        const sub = await subscriptionService.getSubscription(id);
        if (!sub) return new Response(JSON.stringify({ success: false, message: 'Subscription not found' }), { status: 404 });
        
        // Calculate days remaining roughly
        const now = new Date();
        const expiry = new Date(sub.expiryDate);
        // Note: exact calculation logic is in checkExpiringSubscriptions but we can approximate or duplicate for display
        sub.daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        const content = formatNotificationContent([sub], config);
        await sendNotificationToAllChannels('订阅提醒测试', content, config, env, '[手动测试]');
        return new Response(JSON.stringify({ success: true, message: '已发送' }), { headers: { 'Content-Type': 'application/json' } });
      } catch (e: any) {
        return new Response(JSON.stringify({ success: false, message: e.message }), { status: 500 });
      }
    }

    if (method === 'GET') {
      const sub = await subscriptionService.getSubscription(id);
      return new Response(JSON.stringify(sub), { headers: { 'Content-Type': 'application/json' } });
    }

    if (method === 'PUT') {
      const sub = await request.json();
      const result = await subscriptionService.updateSubscription(id, sub as any);
      return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }

    if (method === 'DELETE') {
      const result = await subscriptionService.deleteSubscription(id);
      return new Response(JSON.stringify(result), { status: result.success ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
    }
  }

  return new Response(JSON.stringify({ success: false, message: 'Not Found' }), { status: 404 });
}
