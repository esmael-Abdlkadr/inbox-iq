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

const categoryData = [
  { name: 'CRM', value: 67, color: '#3b82f6' },
  { name: 'Support', value: 45, color: '#22c55e' },
  { name: 'Spam', value: 44, color: '#ef4444' },
];

const weeklyData = [
  { day: 'Mon', CRM: 12, CS: 8, Spam: 5 },
  { day: 'Tue', CRM: 15, CS: 10, Spam: 7 },
  { day: 'Wed', CRM: 8, CS: 12, Spam: 4 },
  { day: 'Thu', CRM: 18, CS: 6, Spam: 9 },
  { day: 'Fri', CRM: 14, CS: 9, Spam: 8 },
  { day: 'Sat', CRM: 5, CS: 3, Spam: 6 },
  { day: 'Sun', CRM: 3, CS: 2, Spam: 5 },
];

const trendData = [
  { date: 'Jan 1', emails: 45, processed: 42 },
  { date: 'Jan 8', emails: 52, processed: 50 },
  { date: 'Jan 15', emails: 48, processed: 48 },
  { date: 'Jan 22', emails: 70, processed: 68 },
  { date: 'Jan 29', emails: 61, processed: 60 },
  { date: 'Feb 5', emails: 85, processed: 82 },
  { date: 'Feb 12', emails: 78, processed: 76 },
];

const confidenceData = [
  { range: '90-100%', count: 89 },
  { range: '80-90%', count: 42 },
  { range: '70-80%', count: 18 },
  { range: '60-70%', count: 5 },
  { range: '<60%', count: 2 },
];

export function CategoryPieChart() {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg">Email Categories</CardTitle>
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

export function WeeklyBarChart() {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg">Weekly Distribution</CardTitle>
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
              <Bar dataKey="CRM" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="CS" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Spam" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function TrendLineChart() {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-lg">Email Volume Trend</CardTitle>
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
                dataKey="emails"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="processed"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConfidenceBarChart() {
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

