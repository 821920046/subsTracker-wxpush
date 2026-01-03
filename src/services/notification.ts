
import { Env, ChannelConfig, Subscription, Config, WeChatOfficialAccountConfig } from '../types';
import { formatTimeInTimezone, formatTimezoneDisplay } from '../utils/date';
import { lunarCalendar } from '../utils/lunar';
import { requestWithRetry } from '../utils/http';

/**
 * 获取微信公众号 Access Token
 */
async function getWeChatAccessToken(env: Env, config: WeChatOfficialAccountConfig): Promise<string | null> {
  const key = 'wx_oa_access_token';
  const cached = await env.SUBSCRIPTIONS_KV.get(key);
  if (cached) return cached;

  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appId}&secret=${config.appSecret}`;
  try {
    const resp = await requestWithRetry(url, { method: 'GET' }, 2, 5000);
    const data: any = await resp.json();
    if (data.access_token) {
      // 缓存 Token，有效期 7200 秒，这里设置 7000 秒
      await env.SUBSCRIPTIONS_KV.put(key, data.access_token, { expirationTtl: 7000 });
      return data.access_token;
    }
    console.error('[WeChat Official Account] 获取 Access Token 失败:', data);
    return null;
  } catch (e) {
    console.error('[WeChat Official Account] 获取 Access Token 错误:', e);
    return null;
  }
}

/**
 * 格式化通知内容
 */
export function formatNotificationContent(subscriptions: Subscription[], config: Config): string {
  const showLunar = config.showLunarGlobal === true;
  const timezone = config.timezone || 'UTC';
  let content = '';

  for (const sub of subscriptions) {
    const typeText = sub.customType || '其他';
    const periodText = (sub.periodValue && sub.periodUnit) ? `(周期: ${sub.periodValue} ${ { day: '天', month: '月', year: '年' }[sub.periodUnit] || sub.periodUnit})` : '';

    // 格式化到期日期（使用所选时区）
    const expiryDateObj = new Date(sub.expiryDate);
    const formattedExpiryDate = formatTimeInTimezone(expiryDateObj, timezone, 'date');
    
    // 农历日期
    let lunarExpiryText = '';
    if (showLunar) {
      const lunarExpiry = lunarCalendar.solar2lunar(expiryDateObj.getFullYear(), expiryDateObj.getMonth() + 1, expiryDateObj.getDate());
      lunarExpiryText = lunarExpiry ? `\n农历日期: ${lunarExpiry.fullStr}` : '';
    }

    // 状态和到期时间
    let statusText = '';
    let statusEmoji = '';
    
    // 计算剩余天数（需要根据时区重新计算，确保准确）
    // 这里简单使用 sub.daysRemaining，假设调用前已更新
    if (sub.daysRemaining === 0) {
      statusEmoji = '⚠️';
      statusText = '今天到期！';
    } else if (sub.daysRemaining !== undefined && sub.daysRemaining < 0) {
      statusEmoji = '🚨';
      statusText = `已过期 ${Math.abs(sub.daysRemaining)} 天`;
    } else {
      statusEmoji = '📅';
      statusText = `将在 ${sub.daysRemaining} 天后到期`;
    }

    // 获取日历类型和自动续期状态
    const calendarType = sub.useLunar ? '农历' : '公历';
    const autoRenewText = sub.autoRenew ? '是' : '否';
    
    // 构建格式化的通知内容
    const subscriptionContent = `${statusEmoji} **${sub.name}**
类型: ${typeText} ${periodText}
日历类型: ${calendarType}
到期日期: ${formattedExpiryDate}${lunarExpiryText}
自动续期: ${autoRenewText}
到期状态: ${statusText}`;

    // 添加备注
    let finalContent = sub.notes ? 
      subscriptionContent + `\n备注: ${sub.notes}` : 
      subscriptionContent;

    content += finalContent + '\n\n';
  }

  // 添加发送时间和时区信息
  const currentTime = formatTimeInTimezone(new Date(), timezone, 'datetime');
  content += `发送时间: ${currentTime}\n当前时区: ${formatTimezoneDisplay(timezone)}`;

  return content;
}

/**
 * 发送通知到所有启用的渠道
 */
export async function sendNotificationToAllChannels(title: string, commonContent: string, config: Config, env: Env | null = null, logPrefix = '[定时任务]'): Promise<void> {
    if (!config.enabledNotifiers || config.enabledNotifiers.length === 0) {
        console.log(`${logPrefix} 未启用任何通知渠道。`);
        return;
    }

    if (config.enabledNotifiers.includes('notifyx')) {
        const notifyxContent = `## ${title}\n\n${commonContent}`;
        const success = await sendNotifyXNotification(title, notifyxContent, `订阅提醒`, config);
        console.log(`${logPrefix} 发送NotifyX通知 ${success ? '成功' : '失败'}`);
    }
    if (config.enabledNotifiers.includes('wenotify')) {
        const wenotifyContent = commonContent.replace(/(\**|\*|##|#|`)/g, '');
        const success = await sendWeNotifyEdgeNotification(title, wenotifyContent, config);
        console.log(`${logPrefix} 发送WeNotify Edge通知 ${success ? '成功' : '失败'}`);
    }
    if (config.enabledNotifiers.includes('wechatOfficialAccount')) {
        const content = commonContent.replace(/(\**|\*|##|#|`)/g, '');
        const success = await sendWeChatOfficialAccountNotification(title, content, config, env);
        console.log(`${logPrefix} 发送微信公众号通知 ${success ? '成功' : '失败'}`);
    }
    if (config.enabledNotifiers.includes('telegram')) {
        const telegramContent = `*${title}*\n\n${commonContent}`;
        const success = await sendTelegramNotification(telegramContent, config);
        console.log(`${logPrefix} 发送Telegram通知 ${success ? '成功' : '失败'}`);
    }
    if (config.enabledNotifiers.includes('webhook')) {
        const webhookContent = commonContent.replace(/(\**|\*|##|#|`)/g, '');
        const success = await sendWebhookNotification(title, webhookContent, config);
        console.log(`${logPrefix} 发送企业微信应用通知 ${success ? '成功' : '失败'}`);
    }
    if (config.enabledNotifiers.includes('wechatbot')) {
        const wechatbotContent = commonContent.replace(/(\**|\*|##|#|`)/g, '');
        const success = await sendWechatBotNotification(title, wechatbotContent, config);
        console.log(`${logPrefix} 发送企业微信机器人通知 ${success ? '成功' : '失败'}`);
    }
    if (config.enabledNotifiers.includes('email')) {
        const emailContent = commonContent.replace(/(\**|\*|##|#|`)/g, '');
        const success = await sendEmailNotification(title, emailContent, config);
        console.log(`${logPrefix} 发送邮件通知 ${success ? '成功' : '失败'}`);
    }
    if (config.enabledNotifiers.includes('bark')) {
        const barkContent = commonContent.replace(/(\**|\*|##|#|`)/g, '');
        const success = await sendBarkNotification(title, barkContent, config);
        console.log(`${logPrefix} 发送Bark通知 ${success ? '成功' : '失败'}`);
    }
}

// Telegram
export async function sendTelegramNotification(message: string, config: Config): Promise<boolean> {
  try {
    if (!config.telegram?.botToken || !config.telegram?.chatId) {
      console.error('[Telegram] 通知未配置，缺少Bot Token或Chat ID');
      return false;
    }

    const url = 'https://api.telegram.org/bot' + config.telegram.botToken + '/sendMessage';
    const response = await requestWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.telegram.chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    }, 2, 8000);

    const result = await response.json() as any;
    return result.ok;
  } catch (error) {
    console.error('[Telegram] 发送通知失败:', error);
    return false;
  }
}

// NotifyX
export async function sendNotifyXNotification(title: string, content: string, description: string, config: Config): Promise<boolean> {
  try {
    if (!config.notifyx?.apiKey) {
      console.error('[NotifyX] 通知未配置，缺少API Key');
      return false;
    }

    const url = 'https://www.notifyx.cn/api/v1/send/' + config.notifyx.apiKey;
    const response = await requestWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        content: content,
        description: description || ''
      })
    }, 2, 8000);

    const result = await response.json() as any;
    return result.status === 'queued';
  } catch (error) {
    console.error('[NotifyX] 发送通知失败:', error);
    return false;
  }
}

// WeNotify Edge
export async function sendWeNotifyEdgeNotification(title: string, content: string, config: Config, throwOnError = false): Promise<boolean> {
  try {
    if (!config.wenotify?.url || !config.wenotify?.token) {
      const msg = '[WeNotify Edge] 通知未配置，缺少服务地址或Token';
      console.error(msg);
      if (throwOnError) throw new Error(msg);
      return false;
    }
    let base = config.wenotify.url.trim().replace(/\/+$/, '');
    let url = base;
    
    // 智能 URL 处理：如果用户只提供了域名（根路径），则自动追加 /wxsend
    // 如果用户提供了具体路径（如 /api/send），则保留原样
    try {
      const urlObj = new URL(base);
      if (urlObj.pathname === '/' || urlObj.pathname === '') {
        url = base + '/wxsend';
      }
    } catch (e) {
      url = base.endsWith('/wxsend') ? base : base + '/wxsend';
    }

    const tokenStr = config.wenotify.token.trim();
    const addToken = (u: string) => u + (u.includes('?') ? '&' : '?') + 'token=' + encodeURIComponent(tokenStr);
    const primaryUrl = addToken(url);
    const altUrl = addToken(base + '/api/wxsend');

    const body: any = {
      title: title,
      content: content,
      token: tokenStr
    };
    if (config.wenotify.userid) {
      body.userid = config.wenotify.userid;
    }
    if (config.wenotify.templateId) {
      body.template_id = config.wenotify.templateId;
    }
    let response = await requestWithRetry(primaryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': tokenStr
      },
      body: JSON.stringify(body)
    }, 2, 8000);
    
    if (!response.ok) {
      const firstText = await response.text();
      response = await requestWithRetry(altUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': tokenStr
        },
        body: JSON.stringify(body)
      }, 2, 8000);
      if (!response.ok) {
        const secondText = await response.text();
        const msg = `primary HTTP ${response.status}: ${firstText}; alt HTTP ${response.status}: ${secondText}`;
        if (throwOnError) throw new Error(msg);
        return false;
      }
    }
    return true;
  } catch (error: any) {
    console.error('[WeNotify Edge] 发送通知失败:', error);
    if (throwOnError) throw error;
    return false;
  }
}

// Bark
export async function sendBarkNotification(title: string, content: string, config: Config): Promise<boolean> {
  try {
    if (!config.bark?.deviceKey) {
      console.error('[Bark] 通知未配置，缺少设备Key');
      return false;
    }

    const serverUrl = config.bark.server || 'https://api.day.app';
    const url = serverUrl + '/push';
    const payload: any = {
      title: title,
      body: content,
      device_key: config.bark.deviceKey
    };

    if (config.bark.isArchive === 'true') {
      payload.isArchive = 1;
    }

    const response = await requestWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    }, 2, 8000);

    const result = await response.json() as any;
    return result.code === 200;
  } catch (error) {
    console.error('[Bark] 发送通知失败:', error);
    return false;
  }
}

// Email
export async function sendEmailNotification(title: string, content: string, config: Config): Promise<boolean> {
  try {
    if (!config.email?.resendApiKey || !config.email?.fromEmail || !config.email?.toEmail) {
      console.error('[邮件通知] 通知未配置，缺少必要参数');
      return false;
    }

    // 生成HTML邮件内容
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; }
        .content h2 { color: #333; margin-top: 0; }
        .content p { color: #666; line-height: 1.6; margin: 16px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        .highlight { background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 ${title}</h1>
        </div>
        <div class="content">
            <div class="highlight">
                ${content.replace(/\n/g, '<br>')}
            </div>
            <p>此邮件由订阅管理系统自动发送，请及时处理相关订阅事务。</p>
        </div>
        <div class="footer">
            <p>订阅管理系统 | 发送时间: ${formatTimeInTimezone(new Date(), config.timezone || 'UTC', 'datetime')}</p>
        </div>
    </div>
</body>
</html>`;

    const fromEmail = config.email.fromEmail.includes('<') ? 
      config.email.fromEmail :
      (config.email.fromEmail ? `Notification <${config.email.fromEmail}>` : '');

    const response = await requestWithRetry('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.email.resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: config.email.toEmail,
        subject: title,
        html: htmlContent,
        text: content
      })
    }, 1, 10000);

    const result = await response.json() as any;
    return response.ok && result.id;
  } catch (error) {
    console.error('[邮件通知] 发送邮件失败:', error);
    return false;
  }
}

// 企业微信应用通知 (Webhook)
export async function sendWebhookNotification(title: string, content: string, config: Config): Promise<boolean> {
  try {
    if (!config.webhook?.url) {
      console.error('[企业微信应用通知] 未配置 Webhook URL');
      return false;
    }

    const method = config.webhook.method || 'POST';
    const headers = config.webhook.headers ? JSON.parse(config.webhook.headers) : { 'Content-Type': 'application/json' };
    const template = config.webhook.template ? JSON.parse(config.webhook.template) : null;

    let body;
    if (template) {
      // 使用模板替换变量
      const templateStr = JSON.stringify(template);
      const replacedStr = templateStr
        .replace(/{{title}}/g, title)
        .replace(/{{content}}/g, content)
        .replace(/{{timestamp}}/g, new Date().toISOString());
      body = replacedStr;
    } else {
      // 默认格式
      body = JSON.stringify({
        msgtype: 'text',
        text: {
          content: `${title}\n\n${content}`
        }
      });
    }

    const response = await requestWithRetry(config.webhook.url, {
      method: method,
      headers: headers,
      body: method !== 'GET' ? body : undefined
    }, 2, 8000);

    return response.ok;
  } catch (error) {
    console.error('[企业微信应用通知] 发送失败:', error);
    return false;
  }
}

// 企业微信机器人
export async function sendWechatBotNotification(title: string, content: string, config: Config): Promise<boolean> {
  try {
    if (!config.wechatBot?.webhook) {
      console.error('[企业微信机器人] 未配置 Webhook URL');
      return false;
    }

    const msgType = config.wechatBot.msgType || 'text';
    let messageData: any;

    if (msgType === 'markdown') {
      const markdownContent = `### ${title}\n\n${content}`;
      messageData = {
        msgtype: 'markdown',
        markdown: {
          content: markdownContent
        }
      };
    } else {
      const textContent = `${title}\n\n${content}`;
      messageData = {
        msgtype: 'text',
        text: {
          content: textContent
        }
      };
    }

    if (config.wechatBot.atAll === 'true') {
      if (msgType === 'text') {
        messageData.text.mentioned_list = ['@all'];
      }
    } else if (config.wechatBot.atMobiles) {
      const mobiles = config.wechatBot.atMobiles.split(',').map((m: string) => m.trim()).filter((m: string) => m);
      if (mobiles.length > 0) {
        if (msgType === 'text') {
          messageData.text.mentioned_mobile_list = mobiles;
        }
      }
    }

    const response = await requestWithRetry(config.wechatBot.webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    }, 2, 8000);

    const responseText = await response.text();
    if (response.ok) {
      try {
        const result = JSON.parse(responseText);
        return result.errcode === 0;
      } catch (parseError) {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    console.error('[企业微信机器人] 发送通知失败:', error);
    return false;
  }
}

// 微信公众号（服务号）通知
export async function sendWeChatOfficialAccountNotification(title: string, content: string, config: Config, env: Env | null): Promise<boolean> {
  try {
    if (!env) {
      console.error('[WeChat Official Account] 缺少 Env 环境，无法使用 KV 缓存 Token');
      return false;
    }
    const oaConfig = config.wechatOfficialAccount;
    if (!oaConfig?.appId || !oaConfig?.appSecret || !oaConfig?.templateId || !oaConfig?.userIds) {
      console.error('[WeChat Official Account] 通知未配置，缺少必要参数');
      return false;
    }

    const token = await getWeChatAccessToken(env, oaConfig);
    if (!token) return false;

    const userIds = oaConfig.userIds.split('|').map(id => id.trim()).filter(id => id);
    let successCount = 0;

    for (const userId of userIds) {
      // 构造符合微信模板消息的数据
      // 这里采用一种比较通用的映射方式，兼容 Plan 中提到的 thing01, time01, number01, thing02
      // 注意：微信对字段长度有限制，尤其是 thing 类型
      
      const payloadData: any = {
        thing01: { value: title.substring(0, 20) }, // 标题，截断到20字
        time01: { value: new Date().toISOString().split('T')[0] }, // 当前日期
        number01: { value: '1' }, // 这里的语义不太明确，暂时填1或者由外部传入
        thing02: { value: content.substring(0, 20) + (content.length > 20 ? '...' : '') } // 内容，截断
      };

      // 尝试发送
      const resp = await requestWithRetry(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touser: userId,
          template_id: oaConfig.templateId,
          data: payloadData
        })
      }, 2, 5000);

      if (resp.ok) {
        const resJson: any = await resp.json();
        if (resJson.errcode === 0) {
          successCount++;
        } else {
          console.error(`[WeChat Official Account] 发送给 ${userId} 失败:`, resJson);
        }
      }
    }
    
    return successCount > 0;
  } catch (error) {
    console.error('[WeChat Official Account] 发送通知失败:', error);
    return false;
  }
}
