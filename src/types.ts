export interface Subscription {
  id: string;
  name: string;
  customType?: string;
  startDate?: string | null;
  expiryDate: string; // ISO date string
  periodValue?: number;
  periodUnit?: 'year' | 'month' | 'day';
  price?: number;
  reminderDays?: number;
  notes?: string;
  isActive: boolean;
  autoRenew: boolean;
  useLunar?: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  // Legacy or alternative fields mapping (if needed)
  // type?: 'solar' | 'lunar'; // Mapped to useLunar
  // cycle?: ... // Mapped to periodValue/Unit
  // notifyTime?: ... // Mapped to reminderDays
}

export interface ChannelConfig {
  enabled: boolean;
  [key: string]: any;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export interface NotifyXConfig {
  apiKey: string;
}

export interface WeNotifyConfig {
  url: string;
  token: string;
  userid?: string;
  templateId?: string;
  path?: string;
}

export interface WebhookConfig {
  url: string;
  method: string;
  headers?: string;
  template?: string;
}

export interface EmailConfig {
  resendApiKey: string;
  fromEmail: string;
  toEmail: string;
}

export interface BarkConfig {
  server: string;
  deviceKey: string;
  isArchive?: string;
}

export interface WeChatBotConfig {
  webhook: string;
  msgType: string;
  atMobiles?: string;
  atAll?: string;
}

export interface WeChatOfficialAccountConfig {
  appId: string;
  appSecret: string;
  templateId: string;
  userIds: string; // Supports multiple user IDs separated by |
}

export interface Config {
  adminUsername?: string;
  adminPassword?: string;
  jwtSecret?: string;
  timezone?: string;
  reminderTimes?: string[];
  showLunarGlobal?: boolean;
  enabledNotifiers: string[];
  telegram?: TelegramConfig;
  notifyx?: NotifyXConfig;
  wenotify?: WeNotifyConfig;
  wechatBot?: WeChatBotConfig;
  wechatOfficialAccount?: WeChatOfficialAccountConfig;
  webhook?: WebhookConfig;
  email?: EmailConfig;
  bark?: BarkConfig;
}

export interface Env {
  SUBSCRIPTIONS_KV: KVNamespace;
  JWT_SECRET?: string;
}

export interface User {
  username: string;
  iat: number;
}

export interface DebugInfo {
  timestamp: string;
  pathname: string;
  kvBinding: boolean;
  configExists: boolean;
  adminUsername: string;
  hasJwtSecret: boolean;
  jwtSecretLength: number;
}

export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}
