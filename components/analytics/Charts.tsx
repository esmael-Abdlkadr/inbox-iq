'use client';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Message } from '@/types';

interface ChartProps {
  messages?: Message[];
}

const COLORS = {
  CRM: '#3b82f6',
  CS: '#22c55e',
  Spam: '#ef4444',
  email: '#8b5cf6',
  telegram: '#0ea5e9',
};

export function CategoryPieChart({ messages = [] }: ChartProps) {
  const categoryData = [
    { name: 'CRM', value: messages.filter(m => m.category === 'CRM').length, color: COLORS.CRM },
    { name: 'Support', value: messages.filter(m => m.category === 'CS').length, color: COLORS.CS },
    { name: 'Spam', value: messages.filter(m => m.category === 'Spam').length, color: COLORS.Spam },
  ].filter(d => d.value > 0);

  if (categoryData.length === 0) {
    categoryData.push({ name: 'No Data', value: 1, color: '#404040' });
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg">Message Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  border: '1px solid #262626',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fafafa' }}
              />
              <Legend
                formatter={(value) => <span style={{ color: '#a1a1aa' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function SourcePieChart({ messages = [] }: ChartProps) {
  const sourceData = [
    { name: 'Email', value: messages.filter(m => (m.source || 'email') === 'email').length, color: COLORS.email },
    { name: 'Telegram', value: messages.filter(m => m.source === 'telegram').length, color: COLORS.telegram },
  ].filter(d => d.value > 0);

  if (sourceData.length === 0) {
    sourceData.push({ name: 'No Data', value: 1, color: '#404040' });
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg">Message Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  border: '1px solid #262626',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fafafa' }}
              />
              <Legend
                formatter={(value) => <span style={{ color: '#a1a1aa' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeeklyBarChart({ messages = [] }: ChartProps) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const weeklyData = days.map(day => {
    const dayMessages = messages.filter(m => {
      const msgDay = new Date(m.created_at).getDay();
      return days[msgDay] === day;
    });
    
    return {
      day,
      Email: dayMessages.filter(m => (m.source || 'email') === 'email').length,
      Telegram: dayMessages.filter(m => m.source === 'telegram').length,
    };
  });

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg">Weekly Distribution by Source</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="day" stroke="#a1a1aa" fontSize={12} />
              <YAxis stroke="#a1a1aa" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  border: '1px solid #262626',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fafafa' }}
              />
              <Legend
                formatter={(value) => <span style={{ color: '#a1a1aa' }}>{value}</span>}
              />
              <Bar dataKey="Email" fill={COLORS.email} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Telegram" fill={COLORS.telegram} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoryBySourceChart({ messages = [] }: ChartProps) {
  const data = [
    {
      category: 'CRM',
      Email: messages.filter(m => m.category === 'CRM' && (m.source || 'email') === 'email').length,
      Telegram: messages.filter(m => m.category === 'CRM' && m.source === 'telegram').length,
    },
    {
      category: 'Support',
      Email: messages.filter(m => m.category === 'CS' && (m.source || 'email') === 'email').length,
      Telegram: messages.filter(m => m.category === 'CS' && m.source === 'telegram').length,
    },
    {
      category: 'Spam',
      Email: messages.filter(m => m.category === 'Spam' && (m.source || 'email') === 'email').length,
      Telegram: messages.filter(m => m.category === 'Spam' && m.source === 'telegram').length,
    },
  ];

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg">Categories by Source</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="category" stroke="#a1a1aa" fontSize={12} />
              <YAxis stroke="#a1a1aa" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  border: '1px solid #262626',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fafafa' }}
              />
              <Legend
                formatter={(value) => <span style={{ color: '#a1a1aa' }}>{value}</span>}
              />
              <Bar dataKey="Email" fill={COLORS.email} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Telegram" fill={COLORS.telegram} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function TrendLineChart({ messages = [] }: ChartProps) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const trendData = last7Days.map(date => {
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayMessages = messages.filter(m => {
      const msgDate = new Date(m.created_at);
      return msgDate.toDateString() === date.toDateString();
    });

    return {
      date: dateStr,
      Email: dayMessages.filter(m => (m.source || 'email') === 'email').length,
      Telegram: dayMessages.filter(m => m.source === 'telegram').length,
      Total: dayMessages.length,
    };
  });

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg">Message Volume Trend (7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} />
              <YAxis stroke="#a1a1aa" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  border: '1px solid #262626',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fafafa' }}
              />
              <Legend
                formatter={(value) => <span style={{ color: '#a1a1aa' }}>{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="Total"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="Email"
                stroke={COLORS.email}
                strokeWidth={2}
                dot={{ fill: COLORS.email, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="Telegram"
                stroke={COLORS.telegram}
                strokeWidth={2}
                dot={{ fill: COLORS.telegram, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConfidenceBarChart({ messages = [] }: ChartProps) {
  const confidenceRanges = [
    { range: '90-100%', min: 0.9, max: 1 },
    { range: '80-90%', min: 0.8, max: 0.9 },
    { range: '70-80%', min: 0.7, max: 0.8 },
    { range: '60-70%', min: 0.6, max: 0.7 },
    { range: '<60%', min: 0, max: 0.6 },
  ];

  const confidenceData = confidenceRanges.map(({ range, min, max }) => ({
    range,
    count: messages.filter(m => 
      m.confidence !== null && m.confidence >= min && m.confidence < max
    ).length,
  }));

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg">AI Confidence Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={confidenceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis type="number" stroke="#a1a1aa" fontSize={12} />
              <YAxis dataKey="range" type="category" stroke="#a1a1aa" fontSize={12} width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  border: '1px solid #262626',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fafafa' }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function TelegramChatTypesChart({ messages = [] }: ChartProps) {
  const telegramMessages = messages.filter(m => m.source === 'telegram');
  
  const chatTypeData = [
    { name: 'DMs', value: telegramMessages.filter(m => m.chat_type === 'dm').length, color: '#22c55e' },
    { name: 'Groups', value: telegramMessages.filter(m => m.chat_type === 'group').length, color: '#3b82f6' },
    { name: 'Channels', value: telegramMessages.filter(m => m.chat_type === 'channel').length, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  if (chatTypeData.length === 0) {
    return null;
  }

  return (
    <Card className="glass border-blue-400/30">
      <CardHeader>
        <CardTitle className="text-lg">Telegram Chat Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chatTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chatTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  border: '1px solid #262626',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fafafa' }}
              />
              <Legend
                formatter={(value) => <span style={{ color: '#a1a1aa' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
