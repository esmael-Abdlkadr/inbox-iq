'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { EmailTable } from '@/components/emails/EmailTable';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Briefcase, HeadphonesIcon, Trash2, Clock, Loader2 } from 'lucide-react';
import { Email } from '@/types';

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = {
    all: emails.length,
    crm: emails.filter((e) => e.category === 'CRM').length,
    cs: emails.filter((e) => e.category === 'CS').length,
    spam: emails.filter((e) => e.category === 'Spam').length,
    pending: emails.filter((e) => !e.category).length,
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/emails?limit=50');
      const data = await response.json();
      
      if (data.emails) {
        setEmails(data.emails);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Emails" 
        subtitle="View and manage all processed emails" 
      />
      
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-5 mb-6">
          <Card className="glass">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.all}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.crm}</p>
                <p className="text-xs text-muted-foreground">CRM</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <HeadphonesIcon className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.cs}</p>
                <p className="text-xs text-muted-foreground">Support</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.spam}</p>
                <p className="text-xs text-muted-foreground">Spam</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass">
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <EmailTable emails={emails} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
