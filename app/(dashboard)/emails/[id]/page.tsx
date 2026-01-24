'use client';

import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CategoryBadge } from '@/components/emails/CategoryBadge';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Building2,
  User,
  Target,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Reply,
  Forward,
  Trash2,
  MoreHorizontal,
  Brain,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { Email } from '@/types';

const mockEmail: Email = {
  id: '1',
  user_id: 'user1',
  gmail_id: 'gmail1',
  sender_email: 'john@acmecorp.com',
  sender_name: 'John Smith',
  subject: 'Partnership Opportunity - Q1 2026',
  body: `Hi there,

I wanted to reach out about a potential partnership between our companies. We have been following your work in the AI/ML space and believe there could be significant synergies between what you're building and our enterprise platform.

Acme Corp serves over 500 enterprise clients globally, and we're looking to integrate AI-powered email intelligence into our CRM solution. Your InboxIQ product seems like a perfect fit.

I'd love to schedule a call to discuss:
1. Technical integration requirements
2. Pricing for enterprise volume
3. Timeline for a pilot program

Our budget for this initiative is approximately $50,000 - $100,000 annually, depending on the scope.

Would you be available for a 30-minute call next week? I'm flexible on timing.

Best regards,
John Smith
VP of Business Development
Acme Corp
john@acmecorp.com
+1 (555) 123-4567`,
  category: 'CRM',
  confidence: 0.95,
  reasoning: 'Business partnership inquiry with clear sales intent. The email mentions specific budget figures, enterprise scale, and requests a sales call. Contains multiple buying signals including timeline, budget, and technical requirements.',
  entities: {
    contacts: [
      { name: 'John Smith', email: 'john@acmecorp.com', phone: '+1 (555) 123-4567', role: 'VP of Business Development' }
    ],
    companies: [
      { name: 'Acme Corp', industry: 'Enterprise Software', website: 'acmecorp.com' }
    ],
    intent: 'Partnership proposal and product inquiry',
    urgency: 'high',
    action_items: [
      'Schedule discovery call',
      'Prepare enterprise pricing deck',
      'Review technical integration docs',
      'Check calendar for next week availability'
    ],
    key_dates: ['Q1 2026', 'next week'],
    monetary_values: ['$50,000 - $100,000 annually'],
  },
  processed_at: new Date().toISOString(),
  created_at: new Date(Date.now() - 3600000).toISOString(),
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function EmailDetailPage({ params }: { params: { id: string } }) {
  const email = mockEmail;

  return (
    <div className="min-h-screen">
      <Header 
        title="Email Details" 
        subtitle="AI-powered analysis and insights" 
      />
      
      <div className="p-6">
        <Link href="/emails">
          <Button variant="ghost" className="mb-4 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Emails
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary/20 text-primary font-medium">
                        {getInitials(email.sender_name || email.sender_email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-lg font-semibold">{email.sender_name}</h2>
                      <p className="text-sm text-muted-foreground">{email.sender_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {email.category && <CategoryBadge category={email.category} size="md" />}
                    {email.entities?.urgency === 'high' && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Urgent
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl mt-4">{email.subject}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(email.created_at).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-foreground bg-transparent p-0 m-0">
                    {email.body}
                  </pre>
                </div>
              </CardContent>
              <Separator />
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="gap-2">
                    <Reply className="h-4 w-4" />
                    Reply
                  </Button>
                  <Button variant="secondary" className="gap-2">
                    <Forward className="h-4 w-4" />
                    Forward
                  </Button>
                  <Button variant="ghost" className="gap-2 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Classification</p>
                  <div className="flex items-center justify-between">
                    {email.category && <CategoryBadge category={email.category} size="md" />}
                    <span className="text-sm text-success font-medium">
                      {email.confidence && `${Math.round(email.confidence * 100)}% confident`}
                    </span>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Reasoning</p>
                  <p className="text-sm text-foreground">{email.reasoning}</p>
                </div>
              </CardContent>
            </Card>

            {email.entities && (
              <>
                <Card className="glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-warning" />
                      Intent & Urgency
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Intent</span>
                      <Badge variant="outline">{email.entities.intent}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Urgency</span>
                      <Badge 
                        variant={email.entities.urgency === 'high' ? 'destructive' : 'outline'}
                        className={email.entities.urgency === 'medium' ? 'border-warning text-warning' : ''}
                      >
                        {email.entities.urgency}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {email.entities.contacts.length > 0 && (
                  <Card className="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-400" />
                        Contacts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {email.entities.contacts.map((contact, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-secondary/50">
                          <p className="font-medium">{contact.name}</p>
                          {contact.role && (
                            <p className="text-sm text-muted-foreground">{contact.role}</p>
                          )}
                          {contact.email && (
                            <p className="text-sm text-primary">{contact.email}</p>
                          )}
                          {contact.phone && (
                            <p className="text-sm text-muted-foreground">{contact.phone}</p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {email.entities.companies.length > 0 && (
                  <Card className="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-green-400" />
                        Companies
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {email.entities.companies.map((company, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-secondary/50">
                          <p className="font-medium">{company.name}</p>
                          {company.industry && (
                            <p className="text-sm text-muted-foreground">{company.industry}</p>
                          )}
                          {company.website && (
                            <p className="text-sm text-primary">{company.website}</p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {email.entities.action_items.length > 0 && (
                  <Card className="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        Action Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {email.entities.action_items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {email.entities.monetary_values.length > 0 && (
                  <Card className="glass border-success/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-success" />
                        Monetary Values
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {email.entities.monetary_values.map((value, idx) => (
                          <Badge key={idx} variant="outline" className="text-success border-success/50 text-lg px-3 py-1">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {email.entities.key_dates.length > 0 && (
                  <Card className="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-400" />
                        Key Dates
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {email.entities.key_dates.map((date, idx) => (
                          <Badge key={idx} variant="outline" className="text-purple-400 border-purple-400/50">
                            {date}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

