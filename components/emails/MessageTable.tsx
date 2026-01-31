'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CategoryBadge } from './CategoryBadge';
import { Message, MessageCategory, MessageSource } from '@/types';
import { Search, Filter, Clock, ChevronRight, AlertCircle, Mail, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageTableProps {
  messages: Message[];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function SourceIcon({ source }: { source: MessageSource }) {
  if (source === 'telegram') {
    return <MessageCircle className="h-4 w-4 text-blue-400" />;
  }
  return <Mail className="h-4 w-4 text-primary" />;
}

export function MessageTable({ messages }: MessageTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.chat_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || message.category === categoryFilter;

    const matchesSource =
      sourceFilter === 'all' || (message.source || 'email') === sourceFilter;

    return matchesSearch && matchesCategory && matchesSource;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[140px] bg-secondary/50">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="email">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </span>
              </SelectItem>
              <SelectItem value="telegram">
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-400" /> Telegram
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] bg-secondary/50">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="CRM">CRM</SelectItem>
              <SelectItem value="CS">Customer Support</SelectItem>
              <SelectItem value="Spam">Spam</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="w-[60px]">Source</TableHead>
              <TableHead className="w-[220px]">Sender</TableHead>
              <TableHead>Subject / Chat</TableHead>
              <TableHead className="w-[120px]">Category</TableHead>
              <TableHead className="w-[100px]">Confidence</TableHead>
              <TableHead className="w-[100px] text-right">Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMessages.map((message) => (
              <TableRow
                key={message.id}
                className="group cursor-pointer hover:bg-secondary/30 border-border"
              >
                <TableCell>
                  <SourceIcon source={message.source || 'email'} />
                </TableCell>
                <TableCell>
                  <Link href={`/emails/${message.id}`} className="flex items-center gap-3">
                    <Avatar className={cn(
                      "h-9 w-9 border border-border",
                      message.source === 'telegram' && "border-blue-400/30"
                    )}>
                      <AvatarFallback className={cn(
                        "text-sm",
                        message.source === 'telegram' 
                          ? "bg-blue-500/10 text-blue-400" 
                          : "bg-primary/10 text-primary"
                      )}>
                        {getInitials(message.sender_name || message.sender_email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="font-medium text-foreground truncate">
                        {message.sender_name || message.sender_email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {message.source === 'telegram' && message.sender_username 
                          ? `@${message.sender_username}` 
                          : message.sender_email}
                      </p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/emails/${message.id}`} className="block">
                    <div className="flex items-center gap-2">
                      {message.entities?.urgency === 'high' && (
                        <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                      )}
                      <div className="overflow-hidden">
                        <span className="truncate group-hover:text-primary transition-colors block">
                          {message.subject}
                        </span>
                        {message.source === 'telegram' && message.chat_name && (
                          <span className="text-xs text-blue-400 truncate block">
                            {message.chat_type?.toUpperCase()}: {message.chat_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  {message.category ? (
                    <CategoryBadge category={message.category} />
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {message.confidence !== null && (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            message.confidence >= 0.9
                              ? 'bg-success'
                              : message.confidence >= 0.7
                              ? 'bg-warning'
                              : 'bg-destructive'
                          )}
                          style={{ width: `${message.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(message.confidence * 100)}%
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="text-sm">{formatDate(message.created_at)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Link href={`/emails/${message.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {filteredMessages.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <p className="text-muted-foreground">No messages found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

