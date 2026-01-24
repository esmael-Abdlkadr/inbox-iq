'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentEmails } from '@/components/dashboard/RecentEmails';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import { Email, EmailStats } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);
  const [stats, setStats] = useState<EmailStats>({
    total: 0,
    crm: 0,
    cs: 0,
    spam: 0,
    unprocessed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/emails?limit=10');
      const data = await response.json();
      
      if (data.emails) {
        setEmails(data.emails);
        
        // Calculate stats from emails
        const emailList = data.emails as Email[];
        setStats({
          total: emailList.length,
          crm: emailList.filter((e) => e.category === 'CRM').length,
          cs: emailList.filter((e) => e.category === 'CS').length,
          spam: emailList.filter((e) => e.category === 'Spam').length,
          unprocessed: emailList.filter((e) => !e.category).length,
        });
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncEmails = () => {
    // Navigate to settings page to connect Gmail
    router.push('/settings');
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Dashboard" 
        subtitle="Overview of your email intelligence"
        onSyncClick={handleSyncEmails}
      />
      
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Emails"
            value={stats.total}
            change={loading ? 'Loading...' : `${stats.unprocessed} unprocessed`}
            changeType="neutral"
            icon={Mail}
            iconColor="text-primary"
          />
          <StatsCard
            title="CRM Leads"
            value={stats.crm}
            change={stats.total > 0 ? `${Math.round((stats.crm / stats.total) * 100)}% of total` : '0%'}
            changeType="positive"
            icon={Briefcase}
            iconColor="text-blue-400"
          />
          <StatsCard
            title="Support Tickets"
            value={stats.cs}
            change={stats.total > 0 ? `${Math.round((stats.cs / stats.total) * 100)}% of total` : '0%'}
            changeType="neutral"
            icon={HeadphonesIcon}
            iconColor="text-green-400"
          />
          <StatsCard
            title="Spam Blocked"
            value={stats.spam}
            change={stats.total > 0 ? `${Math.round((stats.spam / stats.total) * 100)}% of total` : '0%'}
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
              <RecentEmails emails={emails} />
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
                  onClick={fetchEmails}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Emails
                </Button>
                <Button 
                  className="w-full justify-start gap-2" 
                  variant="secondary"
                  onClick={handleSyncEmails}
                >
                  <Zap className="h-4 w-4" />
                  Connect Gmail
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
                    <span className="text-muted-foreground">Emails Processed</span>
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
                    <span className="text-muted-foreground">Avg. Response Time</span>
                    <span className="font-medium">1.2s</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div className="h-2 rounded-full bg-warning" style={{ width: '30%' }} />
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
