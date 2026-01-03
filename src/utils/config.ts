import { Config, Env } from '../types';
import { generateRandomSecret } from './auth';

export async function getRawConfig(env: Env): Promise<any> {
  if (!env.SUBSCRIPTIONS_KV) {
    console.error('[配置] KV存储未绑定');
    return {};
  }
  const data = await env.SUBSCRIPTIONS_KV.get('config');
  return data ? JSON.parse(data) : {};
}

export async function getConfig(env: Env): Promise<Config> {
  try {
    const config = await getRawConfig(env);
    console.log('[配置] 从KV读取配置:', Object.keys(config).length > 0 ? '成功' : '空配置');

    // 确保JWT_SECRET的一致性
    let jwtSecret = config.JWT_SECRET;
    if (!jwtSecret || jwtSecret === 'your-secret-key') {
      jwtSecret = generateRandomSecret();
      console.log('[配置] 生成新的JWT密钥');

      // 保存新的JWT密钥
      config.JWT_SECRET = jwtSecret;
      if (env.SUBSCRIPTIONS_KV) {
        await env.SUBSCRIPTIONS_KV.put('config', JSON.stringify(config));
      }
    }

    const finalConfig: Config = {
      adminUsername: config.ADMIN_USERNAME || 'admin',
      adminPassword: config.ADMIN_PASSWORD || 'password',
      jwtSecret: jwtSecret,
      timezone: config.TIMEZONE || 'UTC',
      reminderTimes: (config.REMINDER_TIMES || '')
        .toString()
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0),
      showLunarGlobal: config.SHOW_LUNAR === true,
      enabledNotifiers: config.ENABLED_NOTIFIERS || ['notifyx'],
      
      telegram: {
        botToken: config.TG_BOT_TOKEN || '',
        chatId: config.TG_CHAT_ID || ''
      },
      
      notifyx: {
        apiKey: config.NOTIFYX_API_KEY || ''
      },
      
      wenotify: {
        url: config.WENOTIFY_URL || '',
        token: config.WENOTIFY_TOKEN || '',
        userid: config.WENOTIFY_USERID || '',
        templateId: config.WENOTIFY_TEMPLATE_ID || '',
        path: config.WENOTIFY_PATH || '/wxsend'
      },
      
      wechatBot: {
        webhook: config.WECHATBOT_WEBHOOK || '',
        msgType: config.WECHATBOT_MSG_TYPE || 'text',
        atMobiles: config.WECHATBOT_AT_MOBILES || '',
        atAll: config.WECHATBOT_AT_ALL || 'false'
      },

      wechatOfficialAccount: {
        appId: config.WECHAT_OA_APPID || '',
        appSecret: config.WECHAT_OA_APPSECRET || '',
        templateId: config.WECHAT_OA_TEMPLATE_ID || '',
        userIds: config.WECHAT_OA_USERIDS || ''
      },
      
      webhook: {
        url: config.WEBHOOK_URL || '',
        method: config.WEBHOOK_METHOD || 'POST',
        headers: config.WEBHOOK_HEADERS || '',
        template: config.WEBHOOK_TEMPLATE || ''
      },
      
      email: {
        resendApiKey: config.RESEND_API_KEY || '',
        fromEmail: config.EMAIL_FROM || '',
        toEmail: config.EMAIL_TO || ''
      },
      
      bark: {
        server: config.BARK_SERVER || 'https://api.day.app',
        deviceKey: config.BARK_DEVICE_KEY || '',
        isArchive: config.BARK_IS_ARCHIVE || 'false'
      }
    };

    return finalConfig;
  } catch (error) {
    console.error('[配置] 获取配置失败:', error);
    const defaultJwtSecret = generateRandomSecret();

    return {
      adminUsername: 'admin',
      adminPassword: 'password',
      jwtSecret: defaultJwtSecret,
      timezone: 'UTC',
      showLunarGlobal: true,
      enabledNotifiers: ['notifyx'],
      telegram: { botToken: '', chatId: '' },
      notifyx: { apiKey: '' },
      wenotify: { url: '', token: '', userid: '', templateId: '' },
      wechatBot: { webhook: '', msgType: 'text', atMobiles: '', atAll: 'false' },
      wechatOfficialAccount: { appId: '', appSecret: '', templateId: '', userIds: '' },
      webhook: { url: '', method: 'POST', headers: '', template: '' },
      email: { resendApiKey: '', fromEmail: '', toEmail: '' },
      bark: { server: 'https://api.day.app', deviceKey: '', isArchive: 'false' }
    };
  }
}
