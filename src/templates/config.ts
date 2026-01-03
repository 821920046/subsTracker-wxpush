export const configPage = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>系统配置 - 订阅管理系统</title>
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet" media="print" onload="this.media='all'">
  <style>
    .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); transition: all 0.3s; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); }
    .btn-secondary { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); transition: all 0.3s; }
    .btn-secondary:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); }
    
    .toast {
      position: fixed; top: 20px; right: 20px; padding: 12px 20px; border-radius: 8px;
      color: white; font-weight: 500; z-index: 1000; transform: translateX(400px);
      transition: all 0.3s ease-in-out; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .toast.show { transform: translateX(0); }
    .toast.success { background-color: #10b981; }
    .toast.error { background-color: #ef4444; }
    .toast.info { background-color: #3b82f6; }
    .toast.warning { background-color: #f59e0b; }
    
    .config-section { 
      border: 1px solid #e5e7eb; 
      border-radius: 8px; 
      padding: 16px; 
      margin-bottom: 24px; 
    }
    .config-section.active { 
      background-color: #f8fafc; 
      border-color: #6366f1; 
    }
    .config-section.inactive { display: none; }
  </style>
</head>
<body class="bg-gray-100 min-h-screen">
  <div id="toast-container"></div>

  <nav class="bg-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <i class="fas fa-calendar-check text-indigo-600 text-2xl mr-2"></i>
          <span class="font-bold text-xl text-gray-800">订阅管理系统</span>
          <span id="systemTimeDisplay" class="ml-4 text-base text-indigo-600 font-normal"></span>
        </div>
        <div class="flex items-center space-x-4">
          <a href="/admin" class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
            <i class="fas fa-list mr-1"></i>订阅列表
          </a>
          <a href="/admin/config" class="text-indigo-600 border-b-2 border-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
            <i class="fas fa-cog mr-1"></i>系统配置
          </a>
          <a href="/api/logout" class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
            <i class="fas fa-sign-out-alt mr-1"></i>退出登录
          </a>
        </div>
        </div>
      </div>
    </nav>
    
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">系统配置</h2>
      
      <form id="configForm" class="space-y-8">
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">管理员账户</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="adminUsername" class="block text-sm font-medium text-gray-700">用户名</label>
              <input type="text" id="adminUsername" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div>
              <label for="adminPassword" class="block text-sm font-medium text-gray-700">密码</label>
              <input type="password" id="adminPassword" placeholder="如不修改密码，请留空" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <p class="mt-1 text-sm text-gray-500">留空表示不修改当前密码</p>
            </div>
          </div>
        </div>
        
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">显示设置</h3>
          
          
          <div class="mb-6">
            <label class="inline-flex items-center">
              <input type="checkbox" id="showLunarGlobal" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" checked>
              <span class="ml-2 text-sm text-gray-700">在通知中显示农历日期</span>
            </label>
            <p class="mt-1 text-sm text-gray-500">控制是否在通知消息中包含农历日期信息</p>
          </div>
        </div>


        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">时区设置</h3>
          <div class="mb-6">
          <label for="timezone" class="block text-sm font-medium text-gray-700 mb-1">时区选择</label>
          <select id="timezone" name="timezone" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white">
            <option value="UTC">世界标准时间（UTC+0）</option>
            <option value="Asia/Shanghai">中国标准时间（UTC+8）</option>
            <option value="Asia/Hong_Kong">香港时间（UTC+8）</option>
            <option value="Asia/Taipei">台北时间（UTC+8）</option>
            <option value="Asia/Singapore">新加坡时间（UTC+8）</option>
            <option value="Asia/Tokyo">日本时间（UTC+9）</option>
            <option value="Asia/Seoul">韩国时间（UTC+9）</option>
            <option value="America/New_York">美国东部时间（UTC-5）</option>
            <option value="America/Chicago">美国中部时间（UTC-6）</option>
            <option value="America/Denver">美国山地时间（UTC-7）</option>
            <option value="America/Los_Angeles">美国太平洋时间（UTC-8）</option>
            <option value="Europe/London">英国时间（UTC+0）</option>
            <option value="Europe/Paris">巴黎时间（UTC+1）</option>
            <option value="Europe/Berlin">柏林时间（UTC+1）</option>
            <option value="Europe/Moscow">莫斯科时间（UTC+3）</option>
            <option value="Australia/Sydney">悉尼时间（UTC+10）</option>
            <option value="Australia/Melbourne">墨尔本时间（UTC+10）</option>
            <option value="Pacific/Auckland">奥克兰时间（UTC+12）</option>
          </select>
            <p class="mt-1 text-sm text-gray-500">选择需要使用时区，计算到期日期</p>
          </div>
          <div class="mb-6">
            <label for="reminderTimes" class="block text-sm font-medium text-gray-700 mb-1">全局每日提醒时段（默认）</label>
            <input type="text" id="reminderTimes" placeholder="08:00,12:00,18:00" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            <p class="mt-1 text-sm text-gray-500">作为默认提醒时段生效；未设置订阅级“当天重复提醒时段”时使用。按 HH:mm 输入多个时段，使用逗号分隔</p>
          </div>
        </div>

        
        <div class="border-b border-gray-200 pb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">通知设置</h3>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-3">通知方式（可多选）</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="inline-flex items-center">
                <input type="checkbox" name="enabledNotifiers" value="telegram" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="ml-2 text-sm text-gray-700">Telegram</span>
              </label>
              <label class="inline-flex items-center">
                <input type="checkbox" name="enabledNotifiers" value="notifyx" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" checked>
                <span class="ml-2 text-sm text-gray-700 font-semibold">NotifyX</span>
              </label>
              <label class="inline-flex items-center">
                <input type="checkbox" name="enabledNotifiers" value="webhook" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="ml-2 text-sm text-gray-700">企业微信应用通知</span>
              </label>
              <label class="inline-flex items-center">
                <input type="checkbox" name="enabledNotifiers" value="wechatbot" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="ml-2 text-sm text-gray-700">企业微信机器人</span>
              </label>
              <label class="inline-flex items-center">
                <input type="checkbox" name="enabledNotifiers" value="wechatOfficialAccount" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="ml-2 text-sm text-gray-700">微信公众号</span>
              </label>
              <label class="inline-flex items-center">
                <input type="checkbox" name="enabledNotifiers" value="email" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="ml-2 text-sm text-gray-700">邮件通知</span>
              </label>
              <label class="inline-flex items-center">
                <input type="checkbox" name="enabledNotifiers" value="bark" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="ml-2 text-sm text-gray-700">Bark</span>
              </label>
              <label class="inline-flex items-center">
                <input type="checkbox" name="enabledNotifiers" value="wenotify" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                <span class="ml-2 text-sm text-gray-700">WeNotify Edge</span>
              </label>
            </div>
            <div class="mt-2 flex flex-wrap gap-4">
              <a href="https://www.notifyx.cn/" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-sm">
                <i class="fas fa-external-link-alt ml-1"></i> NotifyX官网
              </a>
              <a href="https://push.wangwangit.com" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-sm">
                <i class="fas fa-external-link-alt ml-1"></i> 企业微信应用通知官网
              </a>
              <a href="https://developer.work.weixin.qq.com/document/path/91770" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-sm">
                <i class="fas fa-external-link-alt ml-1"></i> 企业微信机器人文档
              </a>
              <a href="https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-sm">
                <i class="fas fa-external-link-alt ml-1"></i> 获取 Resend API Key
              </a>
              <a href="https://apps.apple.com/cn/app/bark-customed-notifications/id1403753865" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-sm">
                <i class="fas fa-external-link-alt ml-1"></i> Bark iOS应用
              </a>
            </div>
          </div>
          
          <div id="telegramConfig" class="config-section">
            <h4 class="text-md font-medium text-gray-900 mb-3">Telegram 配置</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="tgBotToken" class="block text-sm font-medium text-gray-700">Bot Token</label>
                <input type="text" id="tgBotToken" placeholder="从 @BotFather 获取" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="tgChatId" class="block text-sm font-medium text-gray-700">Chat ID</label>
                <input type="text" id="tgChatId" placeholder="可从 @userinfobot 获取" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
            </div>
            <div class="flex justify-end">
              <button type="button" id="testTelegramBtn" class="btn-secondary text-white px-4 py-2 rounded-md text-sm font-medium">
                <i class="fas fa-paper-plane mr-2"></i>测试 Telegram 通知
              </button>
            </div>
          </div>
          
          <div id="notifyxConfig" class="config-section">
            <h4 class="text-md font-medium text-gray-900 mb-3">NotifyX 配置</h4>
            <div class="mb-4">
              <label for="notifyxApiKey" class="block text-sm font-medium text-gray-700">API Key</label>
              <input type="text" id="notifyxApiKey" placeholder="从 NotifyX 平台获取的 API Key" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <p class="mt-1 text-sm text-gray-500">从 <a href="https://www.notifyx.cn/" target="_blank" class="text-indigo-600 hover:text-indigo-800">NotifyX平台</a> 获取的 API Key</p>
            </div>
            <div class="flex justify-end">
              <button type="button" id="testNotifyXBtn" class="btn-secondary text-white px-4 py-2 rounded-md text-sm font-medium">
                <i class="fas fa-paper-plane mr-2"></i>测试 NotifyX 通知
              </button>
            </div>
          </div>

          <div id="wenotifyConfig" class="config-section">
            <h4 class="text-md font-medium text-gray-900 mb-3">WeNotify Edge 配置</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="wenotifyUrl" class="block text-sm font-medium text-gray-700">服务地址</label>
                <input type="url" id="wenotifyUrl" placeholder="https://your-domain.workers.dev" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="wenotifyToken" class="block text-sm font-medium text-gray-700">API Token</label>
                <input type="text" id="wenotifyToken" placeholder="在 WeNotify Edge 中设置的 API_TOKEN" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="wenotifyPath" class="block text-sm font-medium text-gray-700">端点路径</label>
                <input type="text" id="wenotifyPath" placeholder="/wxsend 或 /api/wxsend" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="/wxsend">
              </div>
              <div>
                <label for="wenotifyUserid" class="block text-sm font-medium text-gray-700">UserID (可选)</label>
                <input type="text" id="wenotifyUserid" placeholder="OPENID1|OPENID2" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="wenotifyTemplateId" class="block text-sm font-medium text-gray-700">模板ID (可选)</label>
                <input type="text" id="wenotifyTemplateId" placeholder="微信模板消息 ID" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
            </div>
            <div class="flex justify-end">
              <button type="button" id="testWeNotifyBtn" class="btn-secondary text-white px-4 py-2 rounded-md text-sm font-medium">
                <i class="fas fa-paper-plane mr-2"></i>测试 WeNotify Edge
              </button>
            </div>
          </div>

          <div id="webhookConfig" class="config-section">
            <h4 class="text-md font-medium text-gray-900 mb-3">企业微信应用通知 配置</h4>
            <div class="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label for="webhookUrl" class="block text-sm font-medium text-gray-700">企业微信应用通知 URL</label>
                <input type="url" id="webhookUrl" placeholder="https://push.wangwangit.com/api/send/your-key" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <p class="mt-1 text-sm text-gray-500">从 <a href="https://push.wangwangit.com" target="_blank" class="text-indigo-600 hover:text-indigo-800">企业微信应用通知平台</a> 获取的推送URL</p>
              </div>
              <div>
                <label for="webhookMethod" class="block text-sm font-medium text-gray-700">请求方法</label>
                <select id="webhookMethod" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="POST">POST</option>
                  <option value="GET">GET</option>
                  <option value="PUT">PUT</option>
                </select>
              </div>
              <div>
                <label for="webhookHeaders" class="block text-sm font-medium text-gray-700">自定义请求头 (JSON格式，可选)</label>
                <textarea id="webhookHeaders" rows="3" placeholder='{"Authorization": "Bearer your-token", "Content-Type": "application/json"}' class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                <p class="mt-1 text-sm text-gray-500">JSON格式的自定义请求头，留空使用默认</p>
              </div>
              <div>
                <label for="webhookTemplate" class="block text-sm font-medium text-gray-700">消息模板 (JSON格式，可选)</label>
                <textarea id="webhookTemplate" rows="4" placeholder='{"title": "{{title}}", "content": "{{content}}", "timestamp": "{{timestamp}}"}' class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                <p class="mt-1 text-sm text-gray-500">支持变量: {{title}}, {{content}}, {{timestamp}}。留空使用默认格式</p>
              </div>
            </div>
            <div class="flex justify-end">
              <button type="button" id="testWebhookBtn" class="btn-secondary text-white px-4 py-2 rounded-md text-sm font-medium">
                <i class="fas fa-paper-plane mr-2"></i>测试 企业微信应用通知
              </button>
            </div>
          </div>

          <div id="wechatbotConfig" class="config-section">
            <h4 class="text-md font-medium text-gray-900 mb-3">企业微信机器人 配置</h4>
            <div class="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label for="wechatbotWebhook" class="block text-sm font-medium text-gray-700">机器人 Webhook URL</label>
                <input type="url" id="wechatbotWebhook" placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your-key" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <p class="mt-1 text-sm text-gray-500">从企业微信群聊中添加机器人获取的 Webhook URL</p>
              </div>
              <div>
                <label for="wechatbotMsgType" class="block text-sm font-medium text-gray-700">消息类型</label>
                <select id="wechatbotMsgType" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="text">文本消息</option>
                  <option value="markdown">Markdown消息</option>
                </select>
                <p class="mt-1 text-sm text-gray-500">选择发送的消息格式类型</p>
              </div>
              <div>
                <label for="wechatbotAtMobiles" class="block text-sm font-medium text-gray-700">@手机号 (可选)</label>
                <input type="text" id="wechatbotAtMobiles" placeholder="13800138000,13900139000" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <p class="mt-1 text-sm text-gray-500">需要@的手机号，多个用逗号分隔，留空则不@任何人</p>
              </div>
              <div>
                <label class="inline-flex items-center mt-2">
                  <input type="checkbox" id="wechatbotAtAll" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                  <span class="ml-2 text-sm text-gray-700">@所有人</span>
                </label>
              </div>
            </div>
            <div class="flex justify-end">
              <button type="button" id="testWechatBotBtn" class="btn-secondary text-white px-4 py-2 rounded-md text-sm font-medium">
                <i class="fas fa-paper-plane mr-2"></i>测试 企业微信机器人
              </button>
            </div>
          </div>

          <div id="wechatOfficialAccountConfig" class="config-section">
            <h4 class="text-md font-medium text-gray-900 mb-3">微信公众号 配置</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="wechatOaAppId" class="block text-sm font-medium text-gray-700">AppID</label>
                <input type="text" id="wechatOaAppId" placeholder="wx..." class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="wechatOaAppSecret" class="block text-sm font-medium text-gray-700">AppSecret</label>
                <input type="text" id="wechatOaAppSecret" placeholder="32位密钥" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="wechatOaTemplateId" class="block text-sm font-medium text-gray-700">模板ID</label>
                <input type="text" id="wechatOaTemplateId" placeholder="模板消息ID" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="wechatOaUserIds" class="block text-sm font-medium text-gray-700">用户OpenID (多个用|分隔)</label>
                <input type="text" id="wechatOaUserIds" placeholder="OPENID1|OPENID2" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
            </div>
            <div class="flex justify-end">
              <button type="button" id="testWeChatOABtn" class="btn-secondary text-white px-4 py-2 rounded-md text-sm font-medium">
                <i class="fas fa-paper-plane mr-2"></i>测试 微信公众号
              </button>
            </div>
          </div>

          <div id="emailConfig" class="config-section">
            <h4 class="text-md font-medium text-gray-900 mb-3">邮件通知 配置</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="resendApiKey" class="block text-sm font-medium text-gray-700">Resend API Key</label>
                <input type="text" id="resendApiKey" placeholder="re_..." class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="emailFrom" class="block text-sm font-medium text-gray-700">发件人邮箱</label>
                <input type="email" id="emailFrom" placeholder="onboarding@resend.dev" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="emailFromName" class="block text-sm font-medium text-gray-700">发件人名称</label>
                <input type="text" id="emailFromName" placeholder="订阅助手" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label for="emailTo" class="block text-sm font-medium text-gray-700">收件人邮箱</label>
                <input type="email" id="emailTo" placeholder="your@email.com" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
            </div>
            <div class="flex justify-end">
              <button type="button" id="testEmailBtn" class="btn-secondary text-white px-4 py-2 rounded-md text-sm font-medium">
                <i class="fas fa-paper-plane mr-2"></i>测试 邮件通知
              </button>
            </div>
          </div>

          <div id="barkConfig" class="config-section">
            <h4 class="text-md font-medium text-gray-900 mb-3">Bark 配置</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="barkServer" class="block text-sm font-medium text-gray-700">服务器地址</label>
                <input type="url" id="barkServer" placeholder="https://api.day.app" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <p class="mt-1 text-sm text-gray-500">默认为 https://api.day.app，自建服务请填写对应地址</p>
              </div>
              <div>
                <label for="barkDeviceKey" class="block text-sm font-medium text-gray-700">设备 Key</label>
                <input type="text" id="barkDeviceKey" placeholder="Bark App 中的 Device Key" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              </div>
              <div>
                <label class="inline-flex items-center mt-6">
                  <input type="checkbox" id="barkIsArchive" class="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                  <span class="ml-2 text-sm text-gray-700">自动保存通知</span>
                </label>
              </div>
            </div>
            <div class="flex justify-end">
              <button type="button" id="testBarkBtn" class="btn-secondary text-white px-4 py-2 rounded-md text-sm font-medium">
                <i class="fas fa-paper-plane mr-2"></i>测试 Bark 通知
              </button>
            </div>
          </div>

        </div>

        <div class="flex justify-end">
          <button type="submit" class="btn-primary text-white px-6 py-3 rounded-md text-base font-medium flex items-center">
            <i class="fas fa-save mr-2"></i>保存配置
          </button>
        </div>
      </form>
    </div>
  </div>

  <script>
    function showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = \`toast \${type}\`;
      
      let icon = '';
      if (type === 'success') icon = '<i class="fas fa-check-circle mr-2"></i>';
      else if (type === 'error') icon = '<i class="fas fa-times-circle mr-2"></i>';
      else if (type === 'warning') icon = '<i class="fas fa-exclamation-triangle mr-2"></i>';
      else icon = '<i class="fas fa-info-circle mr-2"></i>';
      
      toast.innerHTML = \`\${icon}\${message}\`;
      container.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('show');
      }, 10);
      
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          container.removeChild(toast);
        }, 300);
      }, 3000);
    }
    
    async function loadConfig() {
      try {
        const response = await fetch('/api/config', { credentials: 'include' });
        const config = await response.json();
        
        document.getElementById('adminUsername').value = config.ADMIN_USERNAME || '';
        document.getElementById('tgBotToken').value = config.TG_BOT_TOKEN || '';
        document.getElementById('tgChatId').value = config.TG_CHAT_ID || '';
        document.getElementById('notifyxApiKey').value = config.NOTIFYX_API_KEY || '';
        document.getElementById('wenotifyUrl').value = config.WENOTIFY_URL || '';
        document.getElementById('wenotifyToken').value = config.WENOTIFY_TOKEN || '';
        document.getElementById('wenotifyPath').value = config.WENOTIFY_PATH || '/wxsend';
        document.getElementById('wenotifyUserid').value = config.WENOTIFY_USERID || '';
        document.getElementById('wenotifyTemplateId').value = config.WENOTIFY_TEMPLATE_ID || '';
        document.getElementById('webhookUrl').value = config.WEBHOOK_URL || '';
        document.getElementById('webhookMethod').value = config.WEBHOOK_METHOD || 'POST';
        document.getElementById('webhookHeaders').value = config.WEBHOOK_HEADERS || '';
        document.getElementById('webhookTemplate').value = config.WEBHOOK_TEMPLATE || '';
        document.getElementById('showLunarGlobal').checked = config.SHOW_LUNAR === true;
        document.getElementById('wechatbotWebhook').value = config.WECHATBOT_WEBHOOK || '';
        document.getElementById('wechatbotMsgType').value = config.WECHATBOT_MSG_TYPE || 'text';
        document.getElementById('wechatbotAtMobiles').value = config.WECHATBOT_AT_MOBILES || '';
        document.getElementById('wechatbotAtAll').checked = config.WECHATBOT_AT_ALL === 'true';
        document.getElementById('resendApiKey').value = config.RESEND_API_KEY || '';
        document.getElementById('emailFrom').value = config.EMAIL_FROM || '';
        document.getElementById('emailFromName').value = config.EMAIL_FROM_NAME || '';
        document.getElementById('emailTo').value = config.EMAIL_TO || '';
        document.getElementById('barkServer').value = config.BARK_SERVER || 'https://api.day.app';
        document.getElementById('barkDeviceKey').value = config.BARK_DEVICE_KEY || '';
        document.getElementById('barkIsArchive').checked = config.BARK_IS_ARCHIVE === 'true';

        // 初始化时区选择
        initTimezoneSelect(config.TIMEZONE || 'UTC');
        document.getElementById('reminderTimes').value = (config.REMINDER_TIMES || '').toString();

        const enabledNotifiers = config.ENABLED_NOTIFIERS || ['notifyx'];
        document.querySelectorAll('input[name="enabledNotifiers"]').forEach(checkbox => {
          checkbox.checked = enabledNotifiers.includes(checkbox.value);
        });
        
        toggleNotificationConfigs(enabledNotifiers);
        
      } catch (error) {
        console.error('加载配置失败:', error);
        showToast('加载配置失败，请刷新重试', 'error');
      }
    }

    function initTimezoneSelect(selectedTimezone) {
      const timezoneSelect = document.getElementById('timezone');
      
      // 常用时区列表
      const timezones = [
        { value: 'UTC', name: '世界标准时间', offset: '+0' },
        { value: 'Asia/Shanghai', name: '中国标准时间', offset: '+8' },
        { value: 'Asia/Hong_Kong', name: '香港时间', offset: '+8' },
        { value: 'Asia/Taipei', name: '台北时间', offset: '+8' },
        { value: 'Asia/Singapore', name: '新加坡时间', offset: '+8' },
        { value: 'Asia/Tokyo', name: '日本时间', offset: '+9' },
        { value: 'Asia/Seoul', name: '韩国时间', offset: '+9' },
        { value: 'America/New_York', name: '美国东部时间', offset: '-5' },
        { value: 'America/Chicago', name: '美国中部时间', offset: '-6' },
        { value: 'America/Denver', name: '美国山地时间', offset: '-7' },
        { value: 'America/Los_Angeles', name: '美国太平洋时间', offset: '-8' },
        { value: 'Europe/London', name: '英国时间', offset: '+0' },
        { value: 'Europe/Paris', name: '巴黎时间', offset: '+1' },
        { value: 'Europe/Berlin', name: '柏林时间', offset: '+1' },
        { value: 'Europe/Moscow', name: '莫斯科时间', offset: '+3' },
        { value: 'Australia/Sydney', name: '悉尼时间', offset: '+10' },
        { value: 'Australia/Melbourne', name: '墨尔本时间', offset: '+10' },
        { value: 'Pacific/Auckland', name: '奥克兰时间', offset: '+12' }
      ];
      
      // 清空现有选项
      timezoneSelect.innerHTML = '';
      
      // 添加新选项
      timezones.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz.value;
        option.textContent = tz.name + '（UTC' + tz.offset + '）';
        timezoneSelect.appendChild(option);
      });
      
      // 设置选中的时区
      timezoneSelect.value = selectedTimezone;
    }
    
    function toggleNotificationConfigs(enabledNotifiers) {
      const telegramConfig = document.getElementById('telegramConfig');
      const notifyxConfig = document.getElementById('notifyxConfig');
      const wenotifyConfig = document.getElementById('wenotifyConfig');
      const webhookConfig = document.getElementById('webhookConfig');
      const wechatbotConfig = document.getElementById('wechatbotConfig');
      const wechatOfficialAccountConfig = document.getElementById('wechatOfficialAccountConfig');
      const emailConfig = document.getElementById('emailConfig');
      const barkConfig = document.getElementById('barkConfig');

      // 重置所有配置区域
      [telegramConfig, notifyxConfig, wenotifyConfig, webhookConfig, wechatbotConfig, wechatOfficialAccountConfig, emailConfig, barkConfig].forEach(config => {
        config.classList.remove('active', 'inactive');
        config.classList.add('inactive');
      });

      // 激活选中的配置区域
      enabledNotifiers.forEach(type => {
        if (type === 'telegram') {
          telegramConfig.classList.remove('inactive');
          telegramConfig.classList.add('active');
        } else if (type === 'notifyx') {
          notifyxConfig.classList.remove('inactive');
          notifyxConfig.classList.add('active');
        } else if (type === 'wenotify') {
          wenotifyConfig.classList.remove('inactive');
          wenotifyConfig.classList.add('active');
        } else if (type === 'webhook') {
          webhookConfig.classList.remove('inactive');
          webhookConfig.classList.add('active');
        } else if (type === 'wechatbot') {
          wechatbotConfig.classList.remove('inactive');
          wechatbotConfig.classList.add('active');
        } else if (type === 'wechatOfficialAccount') {
          wechatOfficialAccountConfig.classList.remove('inactive');
          wechatOfficialAccountConfig.classList.add('active');
        } else if (type === 'email') {
          emailConfig.classList.remove('inactive');
          emailConfig.classList.add('active');
        } else if (type === 'bark') {
          barkConfig.classList.remove('inactive');
          barkConfig.classList.add('active');
        }
      });
    }

    document.querySelectorAll('input[name="enabledNotifiers"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const enabledNotifiers = Array.from(document.querySelectorAll('input[name="enabledNotifiers"]:checked'))
          .map(cb => cb.value);
        toggleNotificationConfigs(enabledNotifiers);
      });
    });
    
    document.getElementById('configForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const enabledNotifiers = Array.from(document.querySelectorAll('input[name="enabledNotifiers"]:checked'))
        .map(cb => cb.value);

      if (enabledNotifiers.length === 0) {
        showToast('请至少选择一种通知方式', 'warning');
        return;
      }

        const config = {
          ADMIN_USERNAME: document.getElementById('adminUsername').value.trim(),
          TG_BOT_TOKEN: document.getElementById('tgBotToken').value.trim(),
          TG_CHAT_ID: document.getElementById('tgChatId').value.trim(),
          NOTIFYX_API_KEY: document.getElementById('notifyxApiKey').value.trim(),
          WENOTIFY_URL: document.getElementById('wenotifyUrl').value.trim(),
          WENOTIFY_TOKEN: document.getElementById('wenotifyToken').value.trim(),
          WENOTIFY_PATH: document.getElementById('wenotifyPath').value.trim() || '/wxsend',
          WENOTIFY_USERID: document.getElementById('wenotifyUserid').value.trim(),
          WENOTIFY_TEMPLATE_ID: document.getElementById('wenotifyTemplateId').value.trim(),
        WEBHOOK_URL: document.getElementById('webhookUrl').value.trim(),
        WEBHOOK_METHOD: document.getElementById('webhookMethod').value,
        WEBHOOK_HEADERS: document.getElementById('webhookHeaders').value.trim(),
        WEBHOOK_TEMPLATE: document.getElementById('webhookTemplate').value.trim(),
        SHOW_LUNAR: document.getElementById('showLunarGlobal').checked,
        WECHATBOT_WEBHOOK: document.getElementById('wechatbotWebhook').value.trim(),
        WECHATBOT_MSG_TYPE: document.getElementById('wechatbotMsgType').value,
        WECHATBOT_AT_MOBILES: document.getElementById('wechatbotAtMobiles').value.trim(),
        WECHATBOT_AT_ALL: document.getElementById('wechatbotAtAll').checked.toString(),
        WECHAT_OA_APPID: document.getElementById('wechatOaAppId').value.trim(),
        WECHAT_OA_APPSECRET: document.getElementById('wechatOaAppSecret').value.trim(),
        WECHAT_OA_TEMPLATE_ID: document.getElementById('wechatOaTemplateId').value.trim(),
        WECHAT_OA_USERIDS: document.getElementById('wechatOaUserIds').value.trim(),
        RESEND_API_KEY: document.getElementById('resendApiKey').value.trim(),
        EMAIL_FROM: document.getElementById('emailFrom').value.trim(),
        EMAIL_FROM_NAME: document.getElementById('emailFromName').value.trim(),
        EMAIL_TO: document.getElementById('emailTo').value.trim(),
        BARK_SERVER: document.getElementById('barkServer').value.trim() || 'https://api.day.app',
        BARK_DEVICE_KEY: document.getElementById('barkDeviceKey').value.trim(),
        BARK_IS_ARCHIVE: document.getElementById('barkIsArchive').checked.toString(),
        ENABLED_NOTIFIERS: enabledNotifiers,
        TIMEZONE: document.getElementById('timezone').value.trim(),
        REMINDER_TIMES: document.getElementById('reminderTimes').value.trim()
      };

      const passwordField = document.getElementById('adminPassword');
      if (passwordField.value.trim()) {
        config.ADMIN_PASSWORD = passwordField.value.trim();
      }

      const submitButton = e.target.querySelector('button[type="submit"]');
      const originalContent = submitButton.innerHTML;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>保存中...';
      submitButton.disabled = true;

      try {
        const response = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(config)
        });

        const result = await response.json();

        if (result.success) {
          showToast('配置保存成功', 'success');
          passwordField.value = '';
          
          // 更新全局时区并重新显示时间
          globalTimezone = config.TIMEZONE;
          showSystemTime();
          
          // 标记时区已更新，供其他页面检测
          localStorage.setItem('timezoneUpdated', Date.now().toString());
          
          // 如果当前在订阅列表页面，则自动刷新页面以更新时区显示
          if (window.location.pathname === '/admin') {
            window.location.reload();
          }
        } else {
          showToast('配置保存失败: ' + (result.message || '未知错误'), 'error');
        }
      } catch (error) {
        console.error('保存配置失败:', error);
        showToast('保存配置失败，请稍后再试', 'error');
      } finally {
        submitButton.innerHTML = originalContent;
        submitButton.disabled = false;
      }
    });
    
    async function testNotification(type) {
      const buttonId = type === 'telegram' ? 'testTelegramBtn' :
                      type === 'notifyx' ? 'testNotifyXBtn' :
                      type === 'wenotify' ? 'testWeNotifyBtn' :
                      type === 'wechatbot' ? 'testWechatBotBtn' :
                      type === 'email' ? 'testEmailBtn' :
                      type === 'bark' ? 'testBarkBtn' : 'testWebhookBtn';
      const button = document.getElementById(buttonId);
      const originalContent = button.innerHTML;
      const serviceName = type === 'telegram' ? 'Telegram' :
                          type === 'notifyx' ? 'NotifyX' :
                          type === 'wenotify' ? 'WeNotify Edge' :
                          type === 'wechatbot' ? '企业微信机器人' :
                          type === 'wechatOfficialAccount' ? '微信公众号' :
                          type === 'email' ? '邮件通知' :
                          type === 'bark' ? 'Bark' : '企业微信应用通知';

      button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>测试中...';
      button.disabled = true;

      const config = {};
      if (type === 'telegram') {
        config.TG_BOT_TOKEN = document.getElementById('tgBotToken').value.trim();
        config.TG_CHAT_ID = document.getElementById('tgChatId').value.trim();

        if (!config.TG_BOT_TOKEN || !config.TG_CHAT_ID) {
          showToast('请先填写 Telegram Bot Token 和 Chat ID', 'warning');
          button.innerHTML = originalContent;
          button.disabled = false;
          return;
        }
      } else if (type === 'notifyx') {
        config.NOTIFYX_API_KEY = document.getElementById('notifyxApiKey').value.trim();

        if (!config.NOTIFYX_API_KEY) {
          showToast('请先填写 NotifyX API Key', 'warning');
          button.innerHTML = originalContent;
          button.disabled = false;
          return;
        }
      } else if (type === 'wenotify') {
        config.WENOTIFY_URL = document.getElementById('wenotifyUrl').value.trim();
        config.WENOTIFY_TOKEN = document.getElementById('wenotifyToken').value.trim();
        config.WENOTIFY_USERID = document.getElementById('wenotifyUserid').value.trim();
        config.WENOTIFY_TEMPLATE_ID = document.getElementById('wenotifyTemplateId').value.trim();

        if (!config.WENOTIFY_URL || !config.WENOTIFY_TOKEN) {
          showToast('请先填写 WeNotify Edge 服务地址和 API Token', 'warning');
          button.innerHTML = originalContent;
          button.disabled = false;
          return;
        }
      } else if (type === 'webhook') {
        config.WEBHOOK_URL = document.getElementById('webhookUrl').value.trim();
        config.WEBHOOK_METHOD = document.getElementById('webhookMethod').value;
        config.WEBHOOK_HEADERS = document.getElementById('webhookHeaders').value.trim();
        config.WEBHOOK_TEMPLATE = document.getElementById('webhookTemplate').value.trim();

        if (!config.WEBHOOK_URL) {
          showToast('请先填写 企业微信应用通知 URL', 'warning');
          button.innerHTML = originalContent;
          button.disabled = false;
          return;
        }
      } else if (type === 'wechatbot') {
        config.WECHATBOT_WEBHOOK = document.getElementById('wechatbotWebhook').value.trim();
        config.WECHATBOT_MSG_TYPE = document.getElementById('wechatbotMsgType').value;
        config.WECHATBOT_AT_MOBILES = document.getElementById('wechatbotAtMobiles').value.trim();
        config.WECHATBOT_AT_ALL = document.getElementById('wechatbotAtAll').checked.toString();

        if (!config.WECHATBOT_WEBHOOK) {
          showToast('请先填写企业微信机器人 Webhook URL', 'warning');
          button.innerHTML = originalContent;
          button.disabled = false;
          return;
        }
      } else if (type === 'wechatOfficialAccount') {
        config.WECHAT_OA_APPID = document.getElementById('wechatOaAppId').value.trim();
        config.WECHAT_OA_APPSECRET = document.getElementById('wechatOaAppSecret').value.trim();
        config.WECHAT_OA_TEMPLATE_ID = document.getElementById('wechatOaTemplateId').value.trim();
        config.WECHAT_OA_USERIDS = document.getElementById('wechatOaUserIds').value.trim();

        if (!config.WECHAT_OA_APPID || !config.WECHAT_OA_APPSECRET || !config.WECHAT_OA_TEMPLATE_ID || !config.WECHAT_OA_USERIDS) {
          showToast('请先填写微信公众号 AppID、AppSecret、模板ID 和 UserIDs', 'warning');
          button.innerHTML = originalContent;
          button.disabled = false;
          return;
        }
      } else if (type === 'email') {
        config.RESEND_API_KEY = document.getElementById('resendApiKey').value.trim();
        config.EMAIL_FROM = document.getElementById('emailFrom').value.trim();
        config.EMAIL_FROM_NAME = document.getElementById('emailFromName').value.trim();
        config.EMAIL_TO = document.getElementById('emailTo').value.trim();

        if (!config.RESEND_API_KEY || !config.EMAIL_FROM || !config.EMAIL_TO) {
          showToast('请先填写 Resend API Key、发件人邮箱和收件人邮箱', 'warning');
          button.innerHTML = originalContent;
          button.disabled = false;
          return;
        }
      } else if (type === 'bark') {
        config.BARK_SERVER = document.getElementById('barkServer').value.trim() || 'https://api.day.app';
        config.BARK_DEVICE_KEY = document.getElementById('barkDeviceKey').value.trim();
        config.BARK_IS_ARCHIVE = document.getElementById('barkIsArchive').checked.toString();

        if (!config.BARK_DEVICE_KEY) {
          showToast('请先填写 Bark 设备Key', 'warning');
          button.innerHTML = originalContent;
          button.disabled = false;
          return;
        }
      }

      try {
        const response = await fetch('/api/test-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ type: type, ...config })
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            showToast(serviceName + ' 通知测试成功！', 'success');
          } else {
            showToast(serviceName + ' 通知测试失败: ' + (result.message || '未知错误'), 'error');
          }
        } else {
          let text = '';
          try {
            const data = await response.json();
            text = data.message || JSON.stringify(data);
          } catch {
            text = await response.text();
          }
          showToast(serviceName + ' 通知测试失败: ' + (text || ('HTTP ' + response.status)), 'error');
        }
      } catch (error) {
        console.error('测试通知失败:', error);
        showToast('测试失败，请稍后再试', 'error');
      } finally {
        button.innerHTML = originalContent;
        button.disabled = false;
      }
    }
    
    document.getElementById('testTelegramBtn').addEventListener('click', () => {
      testNotification('telegram');
    });
    
    document.getElementById('testNotifyXBtn').addEventListener('click', () => {
      testNotification('notifyx');
    });

    document.getElementById('testWeNotifyBtn').addEventListener('click', () => {
      testNotification('wenotify');
    });

    document.getElementById('testWebhookBtn').addEventListener('click', () => {
      testNotification('webhook');
    });

    document.getElementById('testWechatBotBtn').addEventListener('click', () => {
      testNotification('wechatbot');
    });

    document.getElementById('testEmailBtn').addEventListener('click', () => {
      testNotification('email');
    });

    document.getElementById('testBarkBtn').addEventListener('click', () => {
      testNotification('bark');
    });

    window.addEventListener('load', loadConfig);
    
    // 全局时区配置
    let globalTimezone = 'UTC';
    
    // 实时显示系统时间和时区
    async function showSystemTime() {
      try {
        // 获取后台配置的时区
        const response = await fetch('/api/config', { credentials: 'include' });
        const config = await response.json();
        globalTimezone = config.TIMEZONE || 'UTC';
        
        // 格式化当前时间
        function formatTime(dt, tz) {
          return dt.toLocaleString('zh-CN', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        function formatTimezoneDisplay(tz) {
          try {
            // 使用更准确的时区偏移计算方法
            const now = new Date();
            const dtf = new Intl.DateTimeFormat('en-US', {
              timeZone: tz,
              hour12: false,
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
            const parts = dtf.formatToParts(now);
            const get = type => Number(parts.find(x => x.type === type).value);
            const target = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
            const utc = now.getTime();
            const offset = Math.round((target - utc) / (1000 * 60 * 60));
            
            // 时区中文名称映射
            const timezoneNames = {
              'UTC': '世界标准时间',
              'Asia/Shanghai': '中国标准时间',
              'Asia/Hong_Kong': '香港时间',
              'Asia/Taipei': '台北时间',
              'Asia/Singapore': '新加坡时间',
              'Asia/Tokyo': '日本时间',
              'Asia/Seoul': '韩国时间',
              'America/New_York': '美国东部时间',
              'America/Los_Angeles': '美国太平洋时间',
              'America/Chicago': '美国中部时间',
              'America/Denver': '美国山地时间',
              'Europe/London': '英国时间',
              'Europe/Paris': '巴黎时间',
              'Europe/Berlin': '柏林时间',
              'Europe/Moscow': '莫斯科时间',
              'Australia/Sydney': '悉尼时间',
              'Australia/Melbourne': '墨尔本时间',
              'Pacific/Auckland': '奥克兰时间'
            };
            
            const offsetStr = offset >= 0 ? '+' + offset : offset;
            const timezoneName = timezoneNames[tz] || tz;
            return timezoneName + ' (UTC' + offsetStr + ')';
          } catch (error) {
            console.error('格式化时区显示失败:', error);
            return tz;
          }
        }
        function update() {
          const now = new Date();
          const timeStr = formatTime(now, globalTimezone);
          const tzStr = formatTimezoneDisplay(globalTimezone);
          const el = document.getElementById('systemTimeDisplay');
          if (el) {
            el.textContent = timeStr + '  ' + tzStr;
          }
        }
        update();
        // 每秒刷新
        setInterval(update, 1000);
        
        // 定期检查时区变化并重新加载订阅列表（每30秒检查一次）
        setInterval(async () => {
          try {
            const response = await fetch('/api/config', { credentials: 'include' });
            const config = await response.json();
            const newTimezone = config.TIMEZONE || 'UTC';
            
            if (globalTimezone !== newTimezone) {
              globalTimezone = newTimezone;
              console.log('时区已更新为:', globalTimezone);
              // 重新加载订阅列表以更新天数计算
              loadSubscriptions();
            }
          } catch (error) {
            console.error('检查时区更新失败:', error);
          }
        }, 30000);
      } catch (e) {
        // 出错时显示本地时间
        const el = document.getElementById('systemTimeDisplay');
        if (el) {
          el.textContent = new Date().toLocaleString();
        }
      }
    }
    showSystemTime();
  </script>
</body>
</html>
`;
