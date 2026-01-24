'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { Email, EmailCategory } from '@/types';
import { CategoryBadge } from '@/components/emails/CategoryBadge';

interface RecentEmailsProps {
  emails: Email[];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function RecentEmails({ emails }: RecentEmailsProps) {
  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Recent Emails</CardTitle>
        <Link href="/emails">
          <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {emails.map((email) => (
              <Link
                key={email.id}
                href={`/emails/${email.id}`}
                className="block"
              >
                <div className="group flex items-start gap-4 rounded-lg p-3 transition-all hover:bg-secondary/50">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(email.sender_name || email.sender_email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {email.sender_name || email.sender_email}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(email.created_at)}
                      </div>
                    </div>
                    <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {email.subject}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {email.body?.slice(0, 100)}...
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      {email.category && (
                        <CategoryBadge category={email.category} />
                      )}
                      {email.entities?.urgency === 'high' && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {emails.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">No emails yet</p>
                <p className="text-sm text-muted-foreground">
                  Connect your Gmail to start processing emails
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

