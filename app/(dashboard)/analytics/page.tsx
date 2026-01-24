'use client';

import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CategoryPieChart,
  WeeklyBarChart,
  TrendLineChart,
  ConfidenceBarChart,
} from '@/components/analytics/Charts';
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Clock,
  Target,
  Zap,
} from 'lucide-react';

const stats = [
  {
    title: 'Avg. Processing Time',
    value: '1.2s',
    change: '-0.3s',
    changeType: 'positive',
    icon: Clock,
  },
  {
    title: 'Classification Accuracy',
    value: '96.5%',
    change: '+2.1%',
    changeType: 'positive',
    icon: Target,
  },
  {
    title: 'AI Confidence',
    value: '91.2%',
    change: '+1.5%',
    changeType: 'positive',
    icon: Brain,
  },
  {
    title: 'Emails/Day',
    value: '24.3',
    change: '+8.2%',
    changeType: 'positive',
    icon: Zap,
  },
];

const topSenders = [
  { name: 'Acme Corp', count: 23, category: 'CRM' },
  { name: 'Tech Startup', count: 18, category: 'CS' },
  { name: 'Enterprise Inc', count: 15, category: 'CRM' },
  { name: 'GlobalTech', count: 12, category: 'CRM' },
  { name: 'Support Team', count: 10, category: 'CS' },
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen">
      <Header 
        title="Analytics" 
        subtitle="Email processing insights and trends" 
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
                        {stat.changeType === 'positive' ? (
                          <TrendingUp className="h-4 w-4 text-success" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        )}
                        <span
                          className={
                            stat.changeType === 'positive'
                              ? 'text-success text-sm'
                              : 'text-destructive text-sm'
                          }
                        >
                          {stat.change}
                        </span>
                        <span className="text-muted-foreground text-sm">vs last week</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryPieChart />
          <WeeklyBarChart />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TrendLineChart />
          </div>
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">Top Senders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSenders.map((sender, idx) => (
                  <div
                    key={sender.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-sm w-6">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-medium">{sender.name}</p>
                        <Badge
                          variant="outline"
                          className={
                            sender.category === 'CRM'
                              ? 'text-blue-400 border-blue-400/30'
                              : 'text-green-400 border-green-400/30'
                          }
                        >
                          {sender.category}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-xl font-bold">{sender.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <ConfidenceBarChart />
      </div>
    </div>
  );
}

