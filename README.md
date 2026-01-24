# InboxIQ

AI-powered email intelligence platform that automatically classifies emails and extracts actionable business data using Google Gemini.

## What It Does

- **Email Classification** - Automatically categorizes emails as CRM leads, Customer Support, or Spam
- **Entity Extraction** - Extracts contacts, companies, action items, urgency levels, and monetary values
- **Gmail Integration** - Syncs emails directly from Gmail with OAuth authentication
- **Real-time Dashboard** - Visual overview of email processing with stats and analytics

## Tech Stack

- **Next.js 14** - Full-stack React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS + shadcn/ui** - Modern dark theme UI
- **Supabase** - PostgreSQL database and Google OAuth authentication
- **LangChain.js + Google Gemini** - AI classification and entity extraction
- **Gmail API** - Email fetching and synchronization

## API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/api/emails` | GET | Fetch user's processed emails |
| `/api/emails` | POST | Create new email record |
| `/api/process` | POST | Process email with AI (classify + extract) |
| `/api/gmail/auth` | GET | Initiate Gmail OAuth flow |
| `/api/gmail/callback` | GET | Handle OAuth callback |
| `/api/gmail/sync` | POST | Sync and process emails from Gmail |

## Author

**Esmael Abdlkadr**  
GitHub: [@esmael-Abdlkadr](https://github.com/esmael-Abdlkadr)
