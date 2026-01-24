import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ExtractedEntities } from '@/types';

const EXTRACTOR_PROMPT = `You are an expert entity extractor for a CRM system. Your job is to analyze emails and extract structured business information.

Extract the following entities from emails:

1. **contacts** - People mentioned in the email:
   - name: Full name
   - email: Email address if mentioned
   - phone: Phone number if mentioned
   - role: Job title or role if mentioned

2. **companies** - Organizations mentioned:
   - name: Company name
   - industry: Industry if determinable
   - website: Website if mentioned

3. **intent** - The primary purpose of the email (e.g., "Partnership inquiry", "Technical support request", "Product demo request")

4. **urgency** - How urgent is this email: "low" | "medium" | "high"
   - high: Contains words like "urgent", "ASAP", "immediately", "blocking", "critical"
   - medium: Normal business priority, mentions deadlines
   - low: No time pressure indicated

5. **action_items** - Specific actions that need to be taken (array of strings)

6. **key_dates** - Any dates or timeframes mentioned (array of strings)

7. **monetary_values** - Any dollar amounts or budgets mentioned (array of strings)

Respond with a JSON object containing all these fields. Use empty arrays for fields with no data.

IMPORTANT: Respond ONLY with the JSON object, no markdown formatting or additional text.`;

export async function extractEntities(
  subject: string,
  body: string,
  senderEmail: string,
  senderName?: string
): Promise<ExtractedEntities> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const modelName = process.env.LLM_MODEL || 'gemini-1.5-flash';
  const temperature = parseFloat(process.env.LLM_TEMPERATURE || '0.1');
  
  if (!apiKey) {
    console.error('GOOGLE_API_KEY is not configured');
    return {
      contacts: [],
      companies: [],
      intent: 'Unknown - API key not configured',
      urgency: 'low',
      action_items: [],
      key_dates: [],
      monetary_values: [],
    };
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      model: modelName,
      apiKey,
      temperature,
    });

    const emailContent = `
From: ${senderName || senderEmail} <${senderEmail}>
Subject: ${subject}

${body}
`;

    const response = await model.invoke([
      new SystemMessage(EXTRACTOR_PROMPT),
      new HumanMessage(`Extract entities from this email:\n\n${emailContent}`),
    ]);

    let content = response.content as string;
    
    // Strip markdown code blocks if present
    if (content && content.startsWith('```')) {
      content = content.split('```')[1];
      if (content.startsWith('json')) {
        content = content.slice(4);
      }
    }
    content = (content || '').trim();

    const result = JSON.parse(content);
    return {
      contacts: result.contacts || [],
      companies: result.companies || [],
      intent: result.intent || 'Unknown',
      urgency: result.urgency || 'low',
      action_items: result.action_items || [],
      key_dates: result.key_dates || [],
      monetary_values: result.monetary_values || [],
    };
  } catch (error: any) {
    console.error('Extraction error:', error.message);
    return {
      contacts: [],
      companies: [],
      intent: `Extraction failed: ${error.message}`,
      urgency: 'low',
      action_items: [],
      key_dates: [],
      monetary_values: [],
    };
  }
}
