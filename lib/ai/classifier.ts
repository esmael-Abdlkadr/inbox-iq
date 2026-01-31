import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ClassificationResult, MessageCategory, MessageSource } from '@/types';

const EMAIL_CLASSIFIER_PROMPT = `You are an expert email classifier for a CRM system. Your job is to analyze emails and classify them into one of three categories:

1. **CRM** - Sales-related emails including:
   - Partnership inquiries
   - Product/service inquiries
   - Pricing requests
   - Demo requests
   - Contract discussions
   - Lead generation emails
   - Business development outreach

2. **CS** (Customer Support) - Support-related emails including:
   - Technical issues
   - Bug reports
   - Feature requests
   - Billing questions
   - Account issues
   - How-to questions
   - Complaints

3. **Spam** - Unwanted emails including:
   - Marketing newsletters (not from known contacts)
   - Promotional offers
   - Scams
   - Phishing attempts
   - Automated notifications
   - Cold outreach with no relevance

Analyze the email and respond with a JSON object containing:
- category: "CRM" | "CS" | "Spam"
- confidence: number between 0 and 1
- reasoning: brief explanation of why this classification was chosen

IMPORTANT: Respond ONLY with the JSON object, no markdown formatting or additional text.`;

const TELEGRAM_CLASSIFIER_PROMPT = `You are an expert message classifier for a CRM system. Your job is to analyze Telegram messages and classify them into one of three categories:

1. **CRM** - Sales and business-related messages including:
   - Partnership discussions
   - Product/service inquiries
   - Pricing negotiations
   - Business proposals
   - Lead conversations
   - Client communications
   - Deal discussions

2. **CS** (Customer Support) - Support-related messages including:
   - Technical questions
   - Bug reports
   - Feature requests
   - Help requests
   - Account issues
   - How-to questions
   - Complaints or feedback

3. **Spam** - Low-value messages including:
   - Random chatter
   - Memes or jokes
   - Promotional spam
   - Bot messages
   - Off-topic discussions
   - Automated notifications

Analyze the message and respond with a JSON object containing:
- category: "CRM" | "CS" | "Spam"
- confidence: number between 0 and 1
- reasoning: brief explanation of why this classification was chosen

IMPORTANT: Respond ONLY with the JSON object, no markdown formatting or additional text.`;

function getModel() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const modelName = process.env.LLM_MODEL || 'gemini-1.5-flash';
  const temperature = parseFloat(process.env.LLM_TEMPERATURE || '0.1');

  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not configured. Please add it to your .env.local file.');
  }

  return new ChatGoogleGenerativeAI({
    model: modelName,
    apiKey,
    temperature,
  });
}

function parseResponse(content: string): { category: string; confidence: number; reasoning: string } {
  let cleaned = content;
  
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.split('```')[1];
    if (cleaned.startsWith('json')) {
      cleaned = cleaned.slice(4);
    }
  }
  cleaned = cleaned.trim();

  return JSON.parse(cleaned);
}

export async function classifyEmail(
  subject: string,
  body: string,
  senderEmail: string
): Promise<ClassificationResult> {
  try {
    const model = getModel();

    const emailContent = `
From: ${senderEmail}
Subject: ${subject}

${body}
`;

    const response = await model.invoke([
      new SystemMessage(EMAIL_CLASSIFIER_PROMPT),
      new HumanMessage(`Classify this email:\n\n${emailContent}`),
    ]);

    const result = parseResponse(response.content as string);
    return {
      category: result.category as MessageCategory,
      confidence: Math.min(1, Math.max(0, result.confidence)),
      reasoning: result.reasoning,
    };
  } catch (error) {
    console.error('Classification error:', error instanceof Error ? error.message : error);
    return {
      category: 'Spam',
      confidence: 0.5,
      reasoning: `Classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function classifyTelegramMessage(
  text: string,
  senderName: string,
  chatName: string,
  chatType: 'dm' | 'group' | 'channel'
): Promise<ClassificationResult> {
  try {
    const model = getModel();

    const messageContent = `
Chat Type: ${chatType.toUpperCase()}
Chat Name: ${chatName}
Sender: ${senderName}

Message:
${text}
`;

    const response = await model.invoke([
      new SystemMessage(TELEGRAM_CLASSIFIER_PROMPT),
      new HumanMessage(`Classify this Telegram message:\n\n${messageContent}`),
    ]);

    const result = parseResponse(response.content as string);
    return {
      category: result.category as MessageCategory,
      confidence: Math.min(1, Math.max(0, result.confidence)),
      reasoning: result.reasoning,
    };
  } catch (error) {
    console.error('Telegram classification error:', error instanceof Error ? error.message : error);
    return {
      category: 'Spam',
      confidence: 0.5,
      reasoning: `Classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function classifyMessage(
  source: MessageSource,
  content: {
    subject?: string;
    body: string;
    senderEmail?: string;
    senderName?: string;
    chatName?: string;
    chatType?: 'dm' | 'group' | 'channel';
  }
): Promise<ClassificationResult> {
  if (source === 'email') {
    return classifyEmail(
      content.subject || '(No Subject)',
      content.body,
      content.senderEmail || 'unknown@email.com'
    );
  } else {
    return classifyTelegramMessage(
      content.body,
      content.senderName || 'Unknown',
      content.chatName || 'Unknown Chat',
      content.chatType || 'dm'
    );
  }
}
