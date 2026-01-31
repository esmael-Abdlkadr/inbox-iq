'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  MessageCircle,
  Loader2,
  Send,
  Smile,
} from 'lucide-react';
import Link from 'next/link';
import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { use, useRef } from 'react';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function MessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Reply state
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = replyText.slice(0, start) + emoji + replyText.slice(end);
      setReplyText(newText);
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setReplyText(prev => prev + emoji);
    }
  };

  useEffect(() => {
    async function fetchMessage() {
      try {
        const response = await fetch(`/api/emails?id=${id}`);
        const data = await response.json();
        if (data.emails && data.emails.length > 0) {
          setMessage(data.emails[0]);
        }
      } catch (error) {
        console.error('Error fetching message:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMessage();
  }, [id]);

  const handleReply = async () => {
    if (!replyText.trim() || !message) return;

    setSendingReply(true);
    setReplyError(null);

    try {
      const response = await fetch('/api/telegram/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: message.id,
          replyText: replyText.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setReplySuccess(true);
        setReplyText('');
        setTimeout(() => {
          setShowReplyDialog(false);
          setReplySuccess(false);
        }, 1500);
      } else {
        setReplyError(data.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setReplyError('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const closeReplyDialog = () => {
    setShowReplyDialog(false);
    setReplyText('');
    setReplyError(null);
    setReplySuccess(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Message Details" subtitle="Loading..." />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="min-h-screen">
        <Header title="Message Details" subtitle="Message not found" />
        <div className="p-6">
          <Link href="/emails">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Messages
            </Button>
          </Link>
          <Card className="mt-6 glass">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">Message not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isTelegram = message.source === 'telegram';

  return (
    <div className="min-h-screen">
      <Header 
        title="Message Details" 
        subtitle="AI-powered analysis and insights" 
      />
      
      <div className="p-6">
        <Link href="/emails">
          <Button variant="ghost" className="mb-4 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Messages
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className={cn(
                      "h-12 w-12 border-2",
                      isTelegram ? "border-blue-400/30" : "border-primary/30"
                    )}>
                      <AvatarFallback className={cn(
                        "font-medium",
                        isTelegram ? "bg-blue-500/20 text-blue-400" : "bg-primary/20 text-primary"
                      )}>
                        {getInitials(message.sender_name || message.sender_email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        {isTelegram ? (
                          <MessageCircle className="h-4 w-4 text-blue-400" />
                        ) : (
                          <Mail className="h-4 w-4 text-primary" />
                        )}
                        <h2 className="text-lg font-semibold">{message.sender_name}</h2>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isTelegram && message.sender_username 
                          ? `@${message.sender_username}` 
                          : message.sender_email}
                      </p>
                      {isTelegram && message.chat_name && (
                        <p className="text-sm text-blue-400">
                          {message.chat_type?.toUpperCase()}: {message.chat_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {message.category && <CategoryBadge category={message.category} size="md" />}
                    {message.entities?.urgency === 'high' && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Urgent
                      </Badge>
                    )}
                    {isTelegram && (
                      <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                        Telegram
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl mt-4">{message.subject}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(message.created_at).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-foreground bg-transparent p-0 m-0">
                    {message.body}
                  </pre>
                </div>
              </CardContent>
              <Separator />
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  {isTelegram && (
                    <Button 
                      variant="secondary" 
                      className="gap-2"
                      onClick={() => setShowReplyDialog(true)}
                    >
                      <Reply className="h-4 w-4" />
                      Reply
                    </Button>
                  )}
                  {!isTelegram && (
                    <Button variant="secondary" className="gap-2" disabled>
                      <Reply className="h-4 w-4" />
                      Reply
                    </Button>
                  )}
                  <Button variant="secondary" className="gap-2" disabled>
                    <Forward className="h-4 w-4" />
                    Forward
                  </Button>
                  <Button variant="ghost" className="gap-2 text-destructive hover:text-destructive" disabled>
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
            <Card className={cn("glass", isTelegram ? "border-blue-400/30" : "border-primary/30")}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className={cn("h-5 w-5", isTelegram ? "text-blue-400" : "text-primary")} />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Classification</p>
                  <div className="flex items-center justify-between">
                    {message.category && <CategoryBadge category={message.category} size="md" />}
                    <span className="text-sm text-success font-medium">
                      {message.confidence && `${Math.round(message.confidence * 100)}% confident`}
                    </span>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Reasoning</p>
                  <p className="text-sm text-foreground">{message.reasoning}</p>
                </div>
              </CardContent>
            </Card>

            {message.entities && (
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
                      <Badge variant="outline">{message.entities.intent}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Urgency</span>
                      <Badge 
                        variant={message.entities.urgency === 'high' ? 'destructive' : 'outline'}
                        className={message.entities.urgency === 'medium' ? 'border-warning text-warning' : ''}
                      >
                        {message.entities.urgency}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {message.entities.contacts && message.entities.contacts.length > 0 && (
                  <Card className="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-400" />
                        Contacts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {message.entities.contacts.map((contact, idx) => (
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

                {message.entities.companies && message.entities.companies.length > 0 && (
                  <Card className="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-green-400" />
                        Companies
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {message.entities.companies.map((company, idx) => (
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

                {message.entities.action_items && message.entities.action_items.length > 0 && (
                  <Card className="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        Action Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {message.entities.action_items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {message.entities.monetary_values && message.entities.monetary_values.length > 0 && (
                  <Card className="glass border-success/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-success" />
                        Monetary Values
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {message.entities.monetary_values.map((value, idx) => (
                          <Badge key={idx} variant="outline" className="text-success border-success/50 text-lg px-3 py-1">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {message.entities.key_dates && message.entities.key_dates.length > 0 && (
                  <Card className="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-400" />
                        Key Dates
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {message.entities.key_dates.map((date, idx) => (
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

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={closeReplyDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-400" />
              Reply to {message.sender_name}
            </DialogTitle>
            <DialogDescription>
              Send a reply to this Telegram message
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {replyError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{replyError}</span>
              </div>
            )}

            {replySuccess && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30 text-success">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Reply sent successfully!</span>
              </div>
            )}

            <div className="p-3 rounded-lg bg-secondary/50 text-sm">
              <p className="text-muted-foreground mb-1">Replying to:</p>
              <p className="text-foreground line-clamp-2">{message.body}</p>
            </div>

            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Type your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[120px] bg-secondary pr-12"
                disabled={sendingReply || replySuccess}
              />
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
                    disabled={sendingReply || replySuccess}
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0 border-none" 
                  side="top" 
                  align="end"
                >
                  <EmojiPicker onEmojiSelect={(emoji) => {
                    handleEmojiSelect(emoji);
                    setShowEmojiPicker(false);
                  }} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeReplyDialog} disabled={sendingReply}>
              Cancel
            </Button>
            <Button 
              onClick={handleReply}
              disabled={sendingReply || !replyText.trim() || replySuccess}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {sendingReply ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {sendingReply ? 'Sending...' : 'Send Reply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
