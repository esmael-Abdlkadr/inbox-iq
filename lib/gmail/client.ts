import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.labels',
];

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{
      mimeType: string;
      body?: { data?: string };
    }>;
  };
  internalDate: string;
}

export interface ParsedEmail {
  gmail_id: string;
  sender_email: string;
  sender_name: string;
  subject: string;
  body: string;
  received_at: string;
}

export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`
  );
}

export function getAuthUrl(state?: string): string {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state,
    prompt: 'consent',
  });
}

export async function getTokensFromCode(code: string) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function getGmailClient(accessToken: string, refreshToken?: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export async function fetchRecentEmails(
  accessToken: string,
  refreshToken?: string,
  maxResults = 10
): Promise<ParsedEmail[]> {
  const gmail = await getGmailClient(accessToken, refreshToken);
  
  // Get list of messages
  const response = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    labelIds: ['INBOX'],
  });

  const messages = response.data.messages || [];
  const emails: ParsedEmail[] = [];

  // Fetch full message details
  for (const message of messages) {
    if (!message.id) continue;

    const fullMessage = await gmail.users.messages.get({
      userId: 'me',
      id: message.id,
      format: 'full',
    });

    const parsed = parseGmailMessage(fullMessage.data as GmailMessage);
    if (parsed) {
      emails.push(parsed);
    }
  }

  return emails;
}

function parseGmailMessage(message: GmailMessage): ParsedEmail | null {
  try {
    const headers = message.payload.headers;
    
    const getHeader = (name: string): string => {
      const header = headers.find(
        (h) => h.name.toLowerCase() === name.toLowerCase()
      );
      return header?.value || '';
    };

    const from = getHeader('From');
    const subject = getHeader('Subject');
    
    // Parse sender name and email
    const fromMatch = from.match(/^(.+?)\s*<(.+?)>$/);
    const sender_name = fromMatch ? fromMatch[1].replace(/"/g, '').trim() : from;
    const sender_email = fromMatch ? fromMatch[2] : from;

    // Get email body
    let body = '';
    if (message.payload.body?.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else if (message.payload.parts) {
      const textPart = message.payload.parts.find(
        (part) => part.mimeType === 'text/plain'
      );
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
      } else {
        const htmlPart = message.payload.parts.find(
          (part) => part.mimeType === 'text/html'
        );
        if (htmlPart?.body?.data) {
          body = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
          // Basic HTML stripping
          body = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        }
      }
    }

    return {
      gmail_id: message.id,
      sender_email,
      sender_name,
      subject,
      body: body.slice(0, 10000), // Limit body length
      received_at: new Date(parseInt(message.internalDate)).toISOString(),
    };
  } catch (error) {
    console.error('Error parsing Gmail message:', error);
    return null;
  }
}


