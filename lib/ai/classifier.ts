import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ClassificationResult, EmailCategory } from '@/types';

const CLASSIFIER_PROMPT = `You are an expert email classifier for a CRM system. Your job is to analyze emails and classify them into one of three categories:

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

export async function classifyEmail(
  subject: string,
  body: string,
  senderEmail: string
): Promise<ClassificationResult> {
  const apiKey = process.env.GOOGLE_API_KEY;
  const modelName = process.env.LLM_MODEL || 'gemini-1.5-flash';
  const temperature = parseFloat(process.env.LLM_TEMPERATURE || '0.1');
  
  if (!apiKey) {
    console.error('GOOGLE_API_KEY is not configured');
    throw new Error('GOOGLE_API_KEY is not configured. Please add it to your .env.local file.');
  }

  try {
    const model = new ChatGoogleGenerativeAI({
      model: modelName,
      apiKey,
      temperature,
    });

    const emailContent = `
From: ${senderEmail}
Subject: ${subject}

${body}
`;

    const response = await model.invoke([
      new SystemMessage(CLASSIFIER_PROMPT),
      new HumanMessage(`Classify this email:\n\n${emailContent}`),
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
      category: result.category as EmailCategory,
      confidence: Math.min(1, Math.max(0, result.confidence)),
      reasoning: result.reasoning,
    };
  } catch (error) {
    console.error('Classification error:', error instanceof Error ? error.message : error);
    // Default fallback
    return {
      category: 'Spam',
      confidence: 0.5,
      reasoning: `Classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
