# SubsTracker-Wxpush
Modular TypeScript Version

基于 Cloudflare Workers 的多渠道订阅管理与通知系统。支持公历/农历订阅管理、多渠道推送（Telegram, NotifyX, WeNotify, 企业微信, 邮件, Bark等）、JWT 鉴权、Web UI 管理。

## ✨ 特性

- **多渠道推送**：支持 Telegram, NotifyX, WeNotify Edge, 企业微信应用/机器人, 邮件 (Resend), Bark, 自定义 Webhook。
- **农历支持**：完全支持农历日期订阅与循环（如农历生日提醒）。
- **模块化架构**：TypeScript 编写，逻辑分离，易于维护与扩展。
- **Web UI 管理**：
  - 仪表盘：概览订阅状态、近期到期提醒。
  - 订阅管理：增删改查，支持自定义周期（年/月/日）。
  - 配置中心：Web 界面配置所有通知渠道与系统参数。
  - 调试工具：内置调试页面检查 KV 绑定与环境状态。
- **自动任务**：利用 Cloudflare Workers Cron Triggers 每日自动检查并推送提醒。
- **安全鉴权**：基于 JWT 的登录认证系统。

## 🆕 最近更新

- 仪表盘升级为动态“仪表板状态”，四项卡片支持仪表显示与动画
- 新增“金额（每周期，¥）”字段；仪表盘新增“本月预估支出”，按订阅周期换算月度支出
- 本月预估支出计算规则：
  - 月周期：月支出 = 价格 ÷ 周期数值
  - 年周期：月支出 = 价格 ÷ (12 × 周期数值)
  - 天周期：月支出 ≈ 价格 × (30 ÷ 周期数值)
- 管理页支持单订阅“测试通知”按钮，便于渠道联调
- 默认管理员凭据更新为 `admin / password`，并提供本地预览重置接口 `/api/dev/reset-login`
- KV 与部署命令适配 Wrangler v4 语法（示例见下方）
- 订阅自动续期与到期计算的稳定性改进；UI 日历完善农历展示
- 每日到期提醒支持多时段（如早/中/晚或任意 HH:mm），在配置页新增“每日提醒时段”，按设定时区匹配触发；未配置时默认 08:00
- 定时任务策略更新：将计划任务配置为每分钟触发，并在代码中按配置的时段过滤执行，确保灵活提醒频率且避免非时段运行的推送
- 修复手机端登录：调整 Cookie SameSite 为 Lax，并在前端所有请求加入 `credentials: 'include'`，兼容微信/Safari 等移动浏览器
- 移动端性能优化：增加 CDN 预连接、Font Awesome 异步加载、隐藏未启用的配置区块、使用 content-visibility 优化首屏渲染
- 配置中心增强：支持通过 Web UI 保存 `REMINDER_TIMES` 到 KV，后端按 `Config.reminderTimes` 解析执行
- 订阅级当天重复提醒：可为单个订阅设置专属时段（如 `08:00,12:00,18:00`），仅该订阅在这些时段重复提醒；未设置的订阅按全局“每日提醒时段”执行

## 📥 CSV 导入说明

系统支持通过 CSV 文件批量导入订阅。建议先在系统内手动添加一条完整数据的订阅，然后点击“导出CSV”作为模板。

### 字段格式表
CSV 文件需包含表头（Header），关键字段说明如下：

| 字段名 (Header) | 必填 | 类型/格式 | 说明 | 示例 |
| :--- | :---: | :--- | :--- | :--- |
| **name** | ✅ | 文本 | 订阅服务名称 | `Netflix` |
| **expiryDate** | ✅ | 日期 | 到期日期 (YYYY-MM-DD) | `2024-12-31` |
| customType | | 文本 | 自定义类型 | `影视会员` |
| startDate | | 日期 | 开始日期 (YYYY-MM-DD) | `2024-01-01` |
| periodValue | | 数字 | 周期数值 | `1` |
| periodUnit | | 枚举 | 周期单位 (`month`, `year`, `day`) | `month` |
| price | | 数字 | 金额 (支持两位小数) | `29.99` |
| reminderDays | | 数字 | 提前提醒天数 | `7` |
| notes | | 文本 | 备注信息 | `共享账号` |
| isActive | | 布尔 | 是否启用 (`true`/`false`) | `true` |
| autoRenew | | 布尔 | 自动续期 (`true`/`false`) | `true` |
| useLunar | | 布尔 | 农历周期 (`true`/`false`) | `false` |

### 示例数据 (Template)
您可以复制以下内容保存为 `.csv` 文件进行测试：

```csv
name,customType,startDate,expiryDate,periodValue,periodUnit,price,reminderDays,notes,isActive,autoRenew,useLunar
Netflix,影视会员,2024-01-01,2024-02-01,1,month,15.90,3,家庭组车头,true,true,false
Spotify,音乐,2023-12-15,2024-12-15,1,year,99.00,7,个人独享,true,true,false
```

## 📂 目录结构

```
src/
├── services/        # 业务逻辑 (订阅管理, 通知发送)
├── templates/       # HTML 模板 (Admin, Config, Login, Debug)
├── utils/           # 工具函数 (Auth, Date, Lunar, Http)
├── types.ts         # TypeScript 类型定义
└── worker.ts        # Workers 入口文件
```

## 🚀 部署指南

### 1. 环境准备

- Cloudflare 账号
- Node.js & npm
- Wrangler CLI (`npm install -g wrangler`)

### 2. 配置项目

修改 `wrangler.toml` 文件（如不存在请参考示例创建）：

```toml
name = "subscription-manager"
main = "src/worker.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[[kv_namespaces]]
# 替换为你的 KV ID
binding = "SUBSCRIPTIONS_KV"
id = "your-kv-id-here"

[triggers]
crons = ["* * * * *"] # 每分钟触发，结合代码内时段过滤实现灵活提醒
```

### 3. 创建 KV Namespace

```bash
wrangler kv namespace create SUBSCRIPTIONS_KV
# 将输出的 ID 填入 wrangler.toml
```

### 4. 部署

```bash
npm install
wrangler deploy
```

## ⚙️ 使用说明

1. **初始登录**：
   - 访问部署后的 Worker 域名。
   - 默认账号：`admin`
   - 默认密码：`password`

2. **系统配置**：
   - 登录后点击导航栏的 **"系统配置"**。
   - **强烈建议**：立即修改管理员密码。
   - 配置所需的通知渠道（Telegram Bot Token, Chat ID 等）。
   - 设置系统时区（默认 `Asia/Shanghai`）。
   - 如需全局多时段提醒，在“每日提醒时段”中填入多个 `HH:mm`，逗号分隔

3. **添加订阅**：
   - 在仪表盘点击 **"添加订阅"**。
   - 支持公历与农历日期。
   - 设置提醒提前天数（如提前 7 天提醒）。
   - 如需仅对当前订阅的当天重复提醒，在“当天重复提醒时段”中填入多个 `HH:mm`，逗号分隔（覆盖全局设置）

## 🔔 提醒策略说明

- 全局每日提醒时段：在“系统配置”中设置，作为所有订阅的默认重复提醒时段
- 订阅级当天重复提醒时段：在订阅编辑弹窗中设置，仅对该订阅生效，优先级高于全局设置
- 触发频率：计划任务每分钟触发一次，代码按设定时区计算当前 `HH:mm` 并过滤匹配的时段后才推送
- 时区与格式：所有时段按系统时区计算，格式为 `HH:mm`，多个用逗号分隔
- 建议：如需降低触发成本，可在 `wrangler.toml` 调整为每 5 分钟或每小时，并将提醒时段与粒度匹配
4. **调试**：
   - 访问 `/debug` 路径可查看系统环境与 KV 连接状态。

5. **本地重置登录（仅限预览环境）**：
   - 在本地预览（localhost/127.0.0.1）下可调用：`POST /api/dev/reset-login`
   - 重置为：用户名 `admin`，密码 `password`，并生成缺失的 JWT 密钥

## 🛠️ 开发与构建

```bash
# 本地开发预览
npx wrangler dev
```

## 📝 环境变量说明

所有配置均通过 Web UI (`/admin/config`) 管理并存储在 KV 中，无需在 Cloudflare Dashboard 设置环境变量（`SUBSCRIPTIONS_KV` 绑定除外）。

主要配置项（Web UI 中设置）：
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`: 管理员凭据
- `JWT_SECRET`: JWT 签名密钥（自动生成，也可手动指定）
- `TG_BOT_TOKEN` / `TG_CHAT_ID`: Telegram 推送配置
- ... 其他渠道配置
