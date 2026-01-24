'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Mail,
  Key,
  Bell,
  Shield,
  Zap,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [isConnectingGmail, setIsConnectingGmail] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);
  const [syncingEmails, setSyncingEmails] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    // Check URL params for Gmail connection status
    const gmailStatus = searchParams.get('gmail');
    const error = searchParams.get('error');
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (gmailStatus === 'connected') {
      setGmailConnected(true);
      localStorage.setItem('gmail_connected', 'true');
      
      // Store tokens
      if (accessToken) {
        localStorage.setItem('gmail_access_token', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('gmail_refresh_token', refreshToken);
      }
      
      // Clean URL (remove tokens from URL for security)
      window.history.replaceState({}, '', '/settings?gmail=connected');
    }
    
    if (error) {
      setGmailError(error);
    }

    // Check localStorage for existing connection
    const storedConnection = localStorage.getItem('gmail_connected');
    const storedToken = localStorage.getItem('gmail_access_token');
    if (storedConnection === 'true' && storedToken) {
      setGmailConnected(true);
    }
  }, [searchParams]);

  const handleConnectGmail = async () => {
    setIsConnectingGmail(true);
    setGmailError(null);
    
    try {
      const response = await fetch('/api/gmail/auth');
      const data = await response.json();
      
      if (data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        setGmailError('Failed to get auth URL');
        setIsConnectingGmail(false);
      }
    } catch (error) {
      console.error('Error connecting Gmail:', error);
      setGmailError('Failed to connect Gmail');
      setIsConnectingGmail(false);
    }
  };

  const handleDisconnectGmail = () => {
    localStorage.removeItem('gmail_connected');
    localStorage.removeItem('gmail_access_token');
    localStorage.removeItem('gmail_refresh_token');
    setGmailConnected(false);
    setSyncResult(null);
  };

  const handleSyncEmails = async () => {
    setSyncingEmails(true);
    setSyncResult(null);
    
    try {
      const accessToken = localStorage.getItem('gmail_access_token');
      const refreshToken = localStorage.getItem('gmail_refresh_token');
      
      if (!accessToken) {
        setSyncResult('No access token. Please disconnect and reconnect Gmail.');
        setSyncingEmails(false);
        return;
      }

      const response = await fetch('/api/gmail/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accessToken, 
          refreshToken,
          maxResults: 10  // Sync 10 emails at a time
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        const synced = data.synced || 0;
        const skipped = data.skipped || 0;
        const errors = data.errors || 0;
        setSyncResult(`Synced: ${synced} | Skipped: ${skipped} | Errors: ${errors}`);
      } else {
        setSyncResult(data.error || 'Failed to sync emails');
        // If token expired, prompt to reconnect
        if (data.error?.includes('expired') || data.error?.includes('Token') || response.status === 401) {
          handleDisconnectGmail();
          setSyncResult('Token expired. Please reconnect Gmail.');
        }
      }
    } catch (error) {
      console.error('Error syncing emails:', error);
      setSyncResult(`Error: ${error instanceof Error ? error.message : 'Failed to sync emails'}`);
    } finally {
      setSyncingEmails(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header 
        title="Settings" 
        subtitle="Configure your InboxIQ preferences" 
      />
      
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Gmail Connection Card */}
        <Card className="glass border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Gmail Connection
            </CardTitle>
            <CardDescription>
              Connect your Gmail account to automatically sync and process emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {gmailError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Error: {gmailError}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${gmailConnected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <Mail className={`h-5 w-5 ${gmailConnected ? 'text-green-400' : 'text-red-400'}`} />
                </div>
                <div>
                  <p className="font-medium">Gmail Account</p>
                  <p className="text-sm text-muted-foreground">
                    {gmailConnected ? 'Connected and ready to sync' : 'Not connected'}
                  </p>
                </div>
              </div>
              {gmailConnected ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-success border-success/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDisconnectGmail}
                    className="text-destructive border-destructive/50 hover:bg-destructive/10"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button 
                  className="gap-2"
                  onClick={handleConnectGmail}
                  disabled={isConnectingGmail}
                >
                  {isConnectingGmail ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  {isConnectingGmail ? 'Connecting...' : 'Connect Gmail'}
                </Button>
              )}
            </div>

            {gmailConnected && (
              <div className="space-y-3">
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sync Emails</p>
                    <p className="text-sm text-muted-foreground">
                      Fetch and process your latest emails with AI
                    </p>
                  </div>
                  <Button 
                    onClick={handleSyncEmails}
                    disabled={syncingEmails}
                    className="gap-2"
                  >
                    {syncingEmails ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    {syncingEmails ? 'Syncing...' : 'Sync Now'}
                  </Button>
                </div>
                {syncResult && (
                  <p className="text-sm text-muted-foreground bg-secondary/50 p-2 rounded">
                    {syncResult}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>We only read emails. We never send or delete without your permission.</span>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-warning" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Configure your AI model settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">AI Model</p>
                <p className="text-sm text-muted-foreground">Google Gemini 1.5 Flash</p>
              </div>
              <Badge variant="outline" className="text-success border-success/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Classification</p>
                <p className="text-sm text-muted-foreground">CRM, Customer Support, Spam</p>
              </div>
              <Badge variant="outline" className="text-primary border-primary/30">
                3 Categories
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Entity Extraction</p>
                <p className="text-sm text-muted-foreground">Contacts, Companies, Action Items</p>
              </div>
              <Badge variant="outline" className="text-primary border-primary/30">
                Enabled
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-400" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium">High-priority CRM leads</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when high-value leads are detected
                </p>
              </div>
              <Badge variant="outline" className="text-success border-success/30">
                Enabled
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium">Urgent support tickets</p>
                <p className="text-sm text-muted-foreground">
                  Get notified for urgent customer support requests
                </p>
              </div>
              <Badge variant="outline" className="text-success border-success/30">
                Enabled
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="glass border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <div>
                <p className="font-medium">Delete all processed data</p>
                <p className="text-sm text-muted-foreground">
                  This will permanently delete all emails and analysis data
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Delete All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
