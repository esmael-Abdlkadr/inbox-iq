'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentMessages } from '@/components/dashboard/RecentMessages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mail,
  Briefcase,
  HeadphonesIcon,
  Trash2,
  TrendingUp,
  Zap,
  RefreshCw,
  ArrowUpRight,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import { Message, MessageStats, MessageSource } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessageStats>({
    total: 0,
    crm: 0,
    cs: 0,
    spam: 0,
    unprocessed: 0,
    bySource: {
      email: 0,
      telegram: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<MessageSource | 'all'>('all');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/emails?limit=20');
      const data = await response.json();
      
      if (data.emails) {
        setMessages(data.emails);
        
        const messageList = data.emails as Message[];
        const emailCount = messageList.filter((m) => (m.source || 'email') === 'email').length;
        const telegramCount = messageList.filter((m) => m.source === 'telegram').length;
        
        setStats({
          total: messageList.length,
          crm: messageList.filter((m) => m.category === 'CRM').length,
          cs: messageList.filter((m) => m.category === 'CS').length,
          spam: messageList.filter((m) => m.category === 'Spam').length,
          unprocessed: messageList.filter((m) => !m.category).length,
          bySource: {
            email: emailCount,
            telegram: telegramCount,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncClick = () => {
    router.push('/settings');
  };

  const filteredMessages = sourceFilter === 'all' 
    ? messages 
    : messages.filter(m => (m.source || 'email') === sourceFilter);

  const filteredStats = {
    total: filteredMessages.length,
    crm: filteredMessages.filter((m) => m.category === 'CRM').length,
    cs: filteredMessages.filter((m) => m.category === 'CS').length,
    spam: filteredMessages.filter((m) => m.category === 'Spam').length,
    unprocessed: filteredMessages.filter((m) => !m.category).length,
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Dashboard" 
        subtitle="Overview of your message intelligence"
        onSyncClick={handleSyncClick}
      />
      
      <div className="p-6 space-y-6">
        {/* Source Filter Tabs */}
        <Tabs value={sourceFilter} onValueChange={(v) => setSourceFilter(v as MessageSource | 'all')}>
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="all" className="gap-2">
              All
              <span className="text-xs bg-primary/20 px-1.5 py-0.5 rounded">{stats.total}</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              Email
              <span className="text-xs bg-primary/20 px-1.5 py-0.5 rounded">{stats.bySource.email}</span>
            </TabsTrigger>
            <TabsTrigger value="telegram" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Telegram
              <span className="text-xs bg-blue-500/20 px-1.5 py-0.5 rounded">{stats.bySource.telegram}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Messages"
            value={filteredStats.total}
            change={loading ? 'Loading...' : `${filteredStats.unprocessed} unprocessed`}
            changeType="neutral"
            icon={sourceFilter === 'telegram' ? MessageCircle : Mail}
            iconColor={sourceFilter === 'telegram' ? 'text-blue-400' : 'text-primary'}
          />
          <StatsCard
            title="CRM Leads"
            value={filteredStats.crm}
            change={filteredStats.total > 0 ? `${Math.round((filteredStats.crm / filteredStats.total) * 100)}% of total` : '0%'}
            changeType="positive"
            icon={Briefcase}
            iconColor="text-blue-400"
          />
          <StatsCard
            title="Support Tickets"
            value={filteredStats.cs}
            change={filteredStats.total > 0 ? `${Math.round((filteredStats.cs / filteredStats.total) * 100)}% of total` : '0%'}
            changeType="neutral"
            icon={HeadphonesIcon}
            iconColor="text-green-400"
          />
          <StatsCard
            title="Spam Blocked"
            value={filteredStats.spam}
            change={filteredStats.total > 0 ? `${Math.round((filteredStats.spam / filteredStats.total) * 100)}% of total` : '0%'}
            changeType="negative"
            icon={Trash2}
            iconColor="text-red-400"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {loading ? (
              <Card className="glass">
                <CardContent className="flex items-center justify-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              </Card>
            ) : (
              <RecentMessages messages={filteredMessages} sourceFilter={sourceFilter} />
            )}
          </div>

          <div className="space-y-6">
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start gap-2" 
                  variant="secondary"
                  onClick={fetchMessages}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Messages
                </Button>
                <Button 
                  className="w-full justify-start gap-2" 
                  variant="secondary"
                  onClick={handleSyncClick}
                >
                  <Mail className="h-4 w-4" />
                  Connect Gmail
                </Button>
                <Button 
                  className="w-full justify-start gap-2" 
                  variant="secondary"
                  onClick={handleSyncClick}
                >
                  <MessageCircle className="h-4 w-4 text-blue-400" />
                  Connect Telegram
                </Button>
                <Button className="w-full justify-start gap-2" variant="secondary">
                  <ArrowUpRight className="h-4 w-4" />
                  Export Report
                </Button>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Classification Accuracy</span>
                    <span className="font-medium text-success">96.5%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div className="h-2 rounded-full bg-success" style={{ width: '96.5%' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Messages Processed</span>
                    <span className="font-medium">{stats.total - stats.unprocessed}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div 
                      className="h-2 rounded-full bg-primary" 
                      style={{ width: stats.total > 0 ? `${((stats.total - stats.unprocessed) / stats.total) * 100}%` : '0%' }} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Source Distribution</span>
                    <span className="font-medium">
                      {stats.bySource.email} / {stats.bySource.telegram}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary flex overflow-hidden">
                    <div 
                      className="h-2 bg-primary" 
                      style={{ width: stats.total > 0 ? `${(stats.bySource.email / stats.total) * 100}%` : '50%' }} 
                    />
                    <div 
                      className="h-2 bg-blue-400" 
                      style={{ width: stats.total > 0 ? `${(stats.bySource.telegram / stats.total) * 100}%` : '50%' }} 
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3 text-blue-400" /> Telegram
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
