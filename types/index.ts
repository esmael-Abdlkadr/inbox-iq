export type MessageSource = 'email' | 'telegram';
export type ChatType = 'dm' | 'group' | 'channel';
export type MessageCategory = 'CRM' | 'CS' | 'Spam';

export interface Message {
  id: string;
  user_id: string;
  source: MessageSource;
  gmail_id?: string;
  telegram_msg_id?: string;
  chat_type?: ChatType;
  chat_name?: string;
  sender_email: string;
  sender_name: string;
  sender_username?: string;
  subject: string;
  body: string;
  category: MessageCategory | null;
  confidence: number | null;
  reasoning: string | null;
  entities: ExtractedEntities | null;
  processed_at: string | null;
  created_at: string;
}

export interface Email extends Message {
  source: 'email';
  gmail_id: string;
}

export interface TelegramMessage extends Message {
  source: 'telegram';
  telegram_msg_id: string;
  chat_type: ChatType;
  chat_name?: string;
  sender_username?: string;
}

export type EmailCategory = MessageCategory;

export interface ExtractedEntities {
  contacts: Contact[];
  companies: Company[];
  intent: string;
  urgency: 'low' | 'medium' | 'high';
  action_items: string[];
  key_dates: string[];
  monetary_values: string[];
}

export interface Contact {
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
}

export interface Company {
  name: string;
  industry: string | null;
  website: string | null;
}

export interface MessageStats {
  total: number;
  crm: number;
  cs: number;
  spam: number;
  unprocessed: number;
  bySource: {
    email: number;
    telegram: number;
  };
}

export type EmailStats = MessageStats;

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface ClassificationResult {
  category: MessageCategory;
  confidence: number;
  reasoning: string;
}

export interface ProcessingResult {
  classification: ClassificationResult;
  entities: ExtractedEntities;
}

export interface TelegramConnection {
  id: string;
  user_id: string;
  phone_hash: string;
  sync_dms: boolean;
  sync_groups: boolean;
  sync_channels: boolean;
  last_sync: string | null;
  connected_at: string;
}

export interface TelegramSyncPreferences {
  sync_dms: boolean;
  sync_groups: boolean;
  sync_channels: boolean;
}

