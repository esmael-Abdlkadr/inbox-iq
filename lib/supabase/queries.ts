import { createClient } from './server';
import { Message, MessageStats, MessageCategory } from '@/types';

export async function getEmails(limit = 50): Promise<Message[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching emails:', error);
    return [];
  }

  return data || [];
}

export async function getEmailById(id: string): Promise<Message | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching email:', error);
    return null;
  }

  return data;
}

export async function getEmailStats(): Promise<MessageStats> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('emails')
    .select('category, source');

  if (error) {
    console.error('Error fetching stats:', error);
    return { total: 0, crm: 0, cs: 0, spam: 0, unprocessed: 0, bySource: { email: 0, telegram: 0 } };
  }

  const emails = data || [];
  return {
    total: emails.length,
    crm: emails.filter((e) => e.category === 'CRM').length,
    cs: emails.filter((e) => e.category === 'CS').length,
    spam: emails.filter((e) => e.category === 'Spam').length,
    unprocessed: emails.filter((e) => !e.category).length,
    bySource: {
      email: emails.filter((e) => (e.source || 'email') === 'email').length,
      telegram: emails.filter((e) => e.source === 'telegram').length,
    },
  };
}

export async function getEmailsByCategory(category: MessageCategory): Promise<Message[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching emails by category:', error);
    return [];
  }

  return data || [];
}

export async function createEmail(email: Partial<Message>): Promise<Message | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('emails')
    .insert({
      ...email,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating email:', error);
    return null;
  }

  return data;
}

export async function updateEmail(id: string, updates: Partial<Message>): Promise<Message | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('emails')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating email:', error);
    return null;
  }

  return data;
}

export async function deleteEmail(id: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('emails')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting email:', error);
    return false;
  }

  return true;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}


