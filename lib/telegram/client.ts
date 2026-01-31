import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { decryptSession } from './encryption';

const API_ID = parseInt(process.env.TELEGRAM_API_ID || '0');
const API_HASH = process.env.TELEGRAM_API_HASH || '';

export interface TelegramDialog {
  id: string;
  name: string;
  type: 'dm' | 'group' | 'channel';
  unreadCount: number;
}

export interface TelegramMessageData {
  id: string;
  chatId: string;
  chatName: string;
  chatType: 'dm' | 'group' | 'channel';
  senderName: string;
  senderUsername?: string;
  text: string;
  date: Date;
}

export async function createTelegramClient(sessionString?: string): Promise<TelegramClient> {
  const session = new StringSession(sessionString || '');
  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
    timeout: 30,
    requestRetries: 3,
    autoReconnect: true,
  });
  return client;
}

export async function sendOTP(phone: string): Promise<{ phoneCodeHash: string; client: TelegramClient }> {
  const client = await createTelegramClient();
  await client.connect();
  
  const result = await client.sendCode(
    { apiId: API_ID, apiHash: API_HASH },
    phone
  );
  
  return {
    phoneCodeHash: result.phoneCodeHash,
    client,
  };
}

export async function verifyOTP(
  client: TelegramClient,
  phone: string,
  code: string,
  phoneCodeHash: string
): Promise<string> {
  await client.invoke(
    new Api.auth.SignIn({
      phoneNumber: phone,
      phoneCodeHash,
      phoneCode: code,
    })
  );
  
  const session = client.session.save() as unknown as string;
  return session;
}

export async function getClientFromEncryptedSession(
  encryptedSession: string,
  userId: string
): Promise<TelegramClient> {
  const sessionString = decryptSession(encryptedSession, userId);
  const client = await createTelegramClient(sessionString);
  
  // Connect with timeout handling
  const connectPromise = client.connect();
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Connection timeout')), 30000)
  );
  
  await Promise.race([connectPromise, timeoutPromise]);
  return client;
}

export async function fetchDialogs(client: TelegramClient): Promise<TelegramDialog[]> {
  const dialogs = await client.getDialogs({ limit: 20 });
  
  return dialogs.map((dialog) => {
    let type: 'dm' | 'group' | 'channel' = 'dm';
    
    if (dialog.isChannel) {
      type = 'channel';
    } else if (dialog.isGroup) {
      type = 'group';
    }
    
    return {
      id: dialog.id?.toString() || '',
      name: dialog.title || dialog.name || 'Unknown',
      type,
      unreadCount: dialog.unreadCount || 0,
    };
  });
}

export async function fetchRecentMessages(
  client: TelegramClient,
  options: {
    syncDms: boolean;
    syncGroups: boolean;
    syncChannels: boolean;
    limit: number;
  }
): Promise<TelegramMessageData[]> {
  // Fetch fewer dialogs to reduce timeout risk
  const dialogs = await client.getDialogs({ limit: 10 });
  const messages: TelegramMessageData[] = [];
  
  // Process dialogs sequentially with smaller batches
  for (const dialog of dialogs) {
    if (messages.length >= options.limit) break;
    
    let chatType: 'dm' | 'group' | 'channel' = 'dm';
    
    if (dialog.isChannel) {
      chatType = 'channel';
      if (!options.syncChannels) continue;
    } else if (dialog.isGroup) {
      chatType = 'group';
      if (!options.syncGroups) continue;
    } else {
      if (!options.syncDms) continue;
    }
    
    try {
      // Fetch only 2 messages per dialog to reduce API load
      const chatMessages = await client.getMessages(dialog.inputEntity, {
        limit: 2,
      });
      
      for (const msg of chatMessages) {
        if (!msg.message) continue;
        
        let senderName = 'Unknown';
        let senderUsername: string | undefined;
        
        if (msg.sender) {
          if ('firstName' in msg.sender) {
            senderName = [msg.sender.firstName, msg.sender.lastName]
              .filter(Boolean)
              .join(' ') || 'Unknown';
            senderUsername = msg.sender.username || undefined;
          } else if ('title' in msg.sender) {
            senderName = msg.sender.title || 'Unknown';
          }
        }
        
        messages.push({
          id: msg.id.toString(),
          chatId: dialog.id?.toString() || '',
          chatName: dialog.title || dialog.name || 'Unknown',
          chatType,
          senderName,
          senderUsername,
          text: msg.message,
          date: new Date(msg.date * 1000),
        });
        
        if (messages.length >= options.limit) break;
      }
    } catch (error) {
      console.error(`Error fetching messages from ${dialog.title}:`, error);
      // Continue to next dialog instead of failing completely
      continue;
    }
    
    // Small delay between dialogs to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return messages.slice(0, options.limit);
}

export async function disconnectClient(client: TelegramClient): Promise<void> {
  try {
    await client.disconnect();
  } catch (error) {
    console.error('Error disconnecting Telegram client:', error);
  }
}
