'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CategoryPieChart,
  SourcePieChart,
  WeeklyBarChart,
  TrendLineChart,
  ConfidenceBarChart,
  CategoryBySourceChart,
  TelegramChatTypesChart,
} from '@/components/analytics/Charts';
import {
  TrendingUp,
  Brain,
  Zap,
  Mail,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { Message } from '@/types';

export default function AnalyticsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch('/api/emails?limit=100');
        const data = await response.json();
        if (data.emails) {
          setMessages(data.emails);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  const emailCount = messages.filter(m => (m.source || 'email') === 'email').length;
  const telegramCount = messages.filter(m => m.source === 'telegram').length;
  const processedCount = messages.filter(m => m.category).length;
  const avgConfidence = messages.length > 0 
    ? messages.reduce((sum, m) => sum + (m.confidence || 0), 0) / messages.length 
    : 0;

  const stats = [
    {
      title: 'Total Messages',
      value: messages.length.toString(),
      change: `${emailCount} email, ${telegramCount} telegram`,
      changeType: 'positive' as const,
      icon: Zap,
    },
    {
      title: 'Email Messages',
      value: emailCount.toString(),
      change: messages.length > 0 ? `${Math.round((emailCount / messages.length) * 100)}% of total` : '0%',
      changeType: 'positive' as const,
      icon: Mail,
    },
    {
      title: 'Telegram Messages',
      value: telegramCount.toString(),
      change: messages.length > 0 ? `${Math.round((telegramCount / messages.length) * 100)}% of total` : '0%',
      changeType: 'positive' as const,
      icon: MessageCircle,
    },
    {
      title: 'Avg. AI Confidence',
      value: `${Math.round(avgConfidence * 100)}%`,
      change: `${processedCount} processed`,
      changeType: 'positive' as const,
      icon: Brain,
    },
  ];

  const topSenders = messages
    .reduce((acc, msg) => {
      const sender = msg.sender_name || msg.sender_email;
      const existing = acc.find(s => s.name === sender);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ 
          name: sender, 
          count: 1, 
          category: msg.category || 'Pending',
          source: msg.source || 'email',
        });
      }
      return acc;
    }, [] as Array<{ name: string; count: number; category: string; source: string }>)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Analytics" subtitle="Loading insights..." />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        title="Analytics" 
        subtitle="Message processing insights and trends" 
      />
      
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="glass">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-success text-sm">
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      stat.icon === MessageCircle ? 'bg-blue-500/20' : 'bg-primary/20'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        stat.icon === MessageCircle ? 'text-blue-400' : 'text-primary'
                      }`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryPieChart messages={messages} />
          <SourcePieChart messages={messages} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <WeeklyBarChart messages={messages} />
          <CategoryBySourceChart messages={messages} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TrendLineChart messages={messages} />
          </div>
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">Top Senders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSenders.length > 0 ? (
                  topSenders.map((sender, idx) => (
                    <div
                      key={sender.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-sm w-6">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            {sender.source === 'telegram' ? (
                              <MessageCircle className="h-3 w-3 text-blue-400" />
                            ) : (
                              <Mail className="h-3 w-3 text-primary" />
                            )}
                            <p className="font-medium truncate max-w-[120px]">{sender.name}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              sender.category === 'CRM'
                                ? 'text-blue-400 border-blue-400/30'
                                : sender.category === 'CS'
                                ? 'text-green-400 border-green-400/30'
                                : sender.category === 'Spam'
                                ? 'text-red-400 border-red-400/30'
                                : 'text-muted-foreground'
                            }
                          >
                            {sender.category}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-xl font-bold">{sender.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ConfidenceBarChart messages={messages} />
          <TelegramChatTypesChart messages={messages} />
        </div>
      </div>
    </div>
  );
}
