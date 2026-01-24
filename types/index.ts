export interface Email {
  id: string;
  user_id: string;
  gmail_id: string;
  sender_email: string;
  sender_name: string;
  subject: string;
  body: string;
  category: EmailCategory | null;
  confidence: number | null;
  reasoning: string | null;
  entities: ExtractedEntities | null;
  processed_at: string | null;
  created_at: string;
}

export type EmailCategory = 'CRM' | 'CS' | 'Spam';

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

export interface EmailStats {
  total: number;
  crm: number;
  cs: number;
  spam: number;
  unprocessed: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface ClassificationResult {
  category: EmailCategory;
  confidence: number;
  reasoning: string;
}

export interface ProcessingResult {
  classification: ClassificationResult;
  entities: ExtractedEntities;
}

