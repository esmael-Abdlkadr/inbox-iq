'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  MessageCircle,
  Phone,
} from 'lucide-react';
import { TelegramConnection } from '@/types';
import { toast } from 'sonner';

function SettingsContent() {
  const searchParams = useSearchParams();
  
  // Gmail state
  const [isConnectingGmail, setIsConnectingGmail] = useState(false);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);
  const [syncingEmails, setSyncingEmails] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  // Telegram state
  const [telegramConnection, setTelegramConnection] = useState<TelegramConnection | null>(null);
  const [isConnectingTelegram, setIsConnectingTelegram] = useState(false);
  const [telegramError, setTelegramError] = useState<string | null>(null);
  const [syncingTelegram, setSyncingTelegram] = useState(false);
  const [telegramSyncResult, setTelegramSyncResult] = useState<string | null>(null);
  
  // Telegram OTP modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  
  // Telegram sync preferences
  const [syncDms, setSyncDms] = useState(true);
  const [syncGroups, setSyncGroups] = useState(true);
  const [syncChannels, setSyncChannels] = useState(true);

  useEffect(() => {
    const gmailStatus = searchParams.get('gmail');
    const error = searchParams.get('error');
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (gmailStatus === 'connected') {
      setGmailConnected(true);
      localStorage.setItem('gmail_connected', 'true');
      
      if (accessToken) {
        localStorage.setItem('gmail_access_token', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('gmail_refresh_token', refreshToken);
      }
      
      window.history.replaceState({}, '', '/settings?gmail=connected');
    }
    
    if (error) {
      setGmailError(error);
    }

    const storedConnection = localStorage.getItem('gmail_connected');
    const storedToken = localStorage.getItem('gmail_access_token');
    if (storedConnection === 'true' && storedToken) {
      setGmailConnected(true);
    }

    fetchTelegramConnection();
  }, [searchParams]);

  const fetchTelegramConnection = async () => {
    try {
      const response = await fetch('/api/telegram/auth');
      const data = await response.json();
      if (data.connection) {
        setTelegramConnection(data.connection);
        setSyncDms(data.connection.sync_dms);
        setSyncGroups(data.connection.sync_groups);
        setSyncChannels(data.connection.sync_channels);
      }
    } catch (error) {
      console.error('Error fetching Telegram connection:', error);
    }
  };

  const handleConnectGmail = async () => {
    setIsConnectingGmail(true);
    setGmailError(null);
    
    try {
      const response = await fetch('/api/gmail/auth');
      const data = await response.json();
      
      if (data.authUrl) {
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
    
    toast.loading('Syncing Gmail messages...', { id: 'gmail-sync' });
    
    try {
      const accessToken = localStorage.getItem('gmail_access_token');
      const refreshToken = localStorage.getItem('gmail_refresh_token');
      
      if (!accessToken) {
        setSyncResult('No access token. Please disconnect and reconnect Gmail.');
        setSyncingEmails(false);
        toast.error('No access token', { id: 'gmail-sync' });
        return;
      }

      const response = await fetch('/api/gmail/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accessToken, 
          refreshToken,
          maxResults: 10
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        const synced = data.synced || 0;
        const skipped = data.skipped || 0;
        const errors = data.errors || 0;
        setSyncResult(`Synced: ${synced} | Skipped: ${skipped} | Errors: ${errors}`);
        toast.success(`Sync complete! ${synced} new emails synced`, { 
          id: 'gmail-sync',
          description: `Skipped: ${skipped} | Errors: ${errors}`
        });
      } else {
        setSyncResult(data.error || 'Failed to sync emails');
        toast.error('Sync failed', { id: 'gmail-sync', description: data.error });
        if (data.error?.includes('expired') || data.error?.includes('Token') || response.status === 401) {
          handleDisconnectGmail();
          setSyncResult('Token expired. Please reconnect Gmail.');
        }
      }
    } catch (error) {
      console.error('Error syncing emails:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to sync emails';
      setSyncResult(`Error: ${errorMsg}`);
      toast.error('Sync failed', { id: 'gmail-sync', description: errorMsg });
    } finally {
      setSyncingEmails(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      setTelegramError('Please enter your phone number');
      return;
    }

    setSendingOtp(true);
    setTelegramError(null);

    try {
      const response = await fetch('/api/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
      } else {
        setTelegramError(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setTelegramError('Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode.trim()) {
      setTelegramError('Please enter the verification code');
      return;
    }

    setVerifyingOtp(true);
    setTelegramError(null);

    try {
      const response = await fetch('/api/telegram/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: otpCode,
          syncDms,
          syncGroups,
          syncChannels,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowOtpModal(false);
        setPhoneNumber('');
        setOtpCode('');
        setOtpSent(false);
        fetchTelegramConnection();
      } else {
        setTelegramError(data.error || 'Failed to verify OTP');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setTelegramError('Failed to verify OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleDisconnectTelegram = async () => {
    setIsConnectingTelegram(true);

    try {
      const response = await fetch('/api/telegram/disconnect', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setTelegramConnection(null);
        setTelegramSyncResult(null);
      } else {
        setTelegramError(data.error || 'Failed to disconnect');
      }
    } catch (error) {
      console.error('Error disconnecting Telegram:', error);
      setTelegramError('Failed to disconnect');
    } finally {
      setIsConnectingTelegram(false);
    }
  };

  const handleSyncTelegram = async () => {
    setSyncingTelegram(true);
    setTelegramSyncResult(null);
    
    toast.loading('Syncing Telegram messages...', { id: 'telegram-sync' });

    try {
      const response = await fetch('/api/telegram/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        const synced = data.synced || 0;
        const skipped = data.skipped || 0;
        const errors = data.errors || 0;
        setTelegramSyncResult(`Synced: ${synced} | Skipped: ${skipped} | Errors: ${errors}`);
        fetchTelegramConnection();
        
        toast.success(`Sync complete! ${synced} new messages synced`, { 
          id: 'telegram-sync',
          description: `Skipped: ${skipped} | Errors: ${errors}`
        });
      } else {
        setTelegramSyncResult(data.error || 'Failed to sync messages');
        toast.error('Sync failed', { 
          id: 'telegram-sync',
          description: data.error || 'Failed to sync messages'
        });
      }
    } catch (error) {
      console.error('Error syncing Telegram:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to sync';
      setTelegramSyncResult(`Error: ${errorMsg}`);
      toast.error('Sync failed', { 
        id: 'telegram-sync',
        description: errorMsg
      });
    } finally {
      setSyncingTelegram(false);
    }
  };

  const resetOtpModal = () => {
    setShowOtpModal(false);
    setPhoneNumber('');
    setOtpCode('');
    setOtpSent(false);
    setTelegramError(null);
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

        {/* Telegram Connection Card */}
        <Card className="glass border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-400" />
              Telegram Connection
            </CardTitle>
            <CardDescription>
              Connect your Telegram account to sync messages from DMs, groups, and channels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {telegramError && !showOtpModal && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Error: {telegramError}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${telegramConnection ? 'bg-blue-500/20' : 'bg-gray-500/20'}`}>
                  <MessageCircle className={`h-5 w-5 ${telegramConnection ? 'text-blue-400' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="font-medium">Telegram Account</p>
                  <p className="text-sm text-muted-foreground">
                    {telegramConnection 
                      ? `Connected (****${telegramConnection.phone_hash.slice(-4)})` 
                      : 'Not connected'}
                  </p>
                </div>
              </div>
              {telegramConnection ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDisconnectTelegram}
                    disabled={isConnectingTelegram}
                    className="text-destructive border-destructive/50 hover:bg-destructive/10"
                  >
                    {isConnectingTelegram ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Disconnect'
                    )}
                  </Button>
                </div>
              ) : (
                <Button 
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowOtpModal(true)}
                  disabled={isConnectingTelegram}
                >
                  {isConnectingTelegram ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Phone className="h-4 w-4" />
                  )}
                  Connect Telegram
                </Button>
              )}
            </div>

            {telegramConnection && (
              <div className="space-y-3">
                <Separator />
                
                {/* Sync Preferences */}
                <div className="space-y-2">
                  <p className="font-medium text-sm">Sync Preferences</p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="sync-dms" 
                        checked={telegramConnection.sync_dms}
                        disabled
                      />
                      <Label htmlFor="sync-dms" className="text-sm">DMs</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="sync-groups" 
                        checked={telegramConnection.sync_groups}
                        disabled
                      />
                      <Label htmlFor="sync-groups" className="text-sm">Groups</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="sync-channels" 
                        checked={telegramConnection.sync_channels}
                        disabled
                      />
                      <Label htmlFor="sync-channels" className="text-sm">Channels</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sync Messages</p>
                    <p className="text-sm text-muted-foreground">
                      Fetch and process your latest Telegram messages with AI
                    </p>
                    {telegramConnection.last_sync && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last synced: {new Date(telegramConnection.last_sync).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Button 
                    onClick={handleSyncTelegram}
                    disabled={syncingTelegram}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {syncingTelegram ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4" />
                    )}
                    {syncingTelegram ? 'Syncing...' : 'Sync Now'}
                  </Button>
                </div>
                {telegramSyncResult && (
                  <p className="text-sm text-muted-foreground bg-secondary/50 p-2 rounded">
                    {telegramSyncResult}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Your session is encrypted. Only you can access your messages.</span>
            </div>
          </CardContent>
        </Card>

        {/* Telegram OTP Modal */}
        <Dialog open={showOtpModal} onOpenChange={resetOtpModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-400" />
                Connect Telegram
              </DialogTitle>
              <DialogDescription>
                {otpSent 
                  ? 'Enter the verification code sent to your Telegram app'
                  : 'Enter your phone number to receive a verification code'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {telegramError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{telegramError}</span>
                </div>
              )}

              {!otpSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-secondary"
                    />
                    <p className="text-xs text-muted-foreground">
                      Include country code (e.g., +1 for US)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Sync Options</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="modal-sync-dms" 
                          checked={syncDms}
                          onCheckedChange={(checked: boolean | 'indeterminate') => setSyncDms(checked === true)}
                        />
                        <Label htmlFor="modal-sync-dms" className="text-sm">Direct Messages</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="modal-sync-groups" 
                          checked={syncGroups}
                          onCheckedChange={(checked: boolean | 'indeterminate') => setSyncGroups(checked === true)}
                        />
                        <Label htmlFor="modal-sync-groups" className="text-sm">Group Chats</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="modal-sync-channels" 
                          checked={syncChannels}
                          onCheckedChange={(checked: boolean | 'indeterminate') => setSyncChannels(checked === true)}
                        />
                        <Label htmlFor="modal-sync-channels" className="text-sm">Channels</Label>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    {sendingOtp ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Phone className="h-4 w-4" />
                    )}
                    {sendingOtp ? 'Sending...' : 'Send Verification Code'}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="12345"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="bg-secondary text-center text-2xl tracking-widest"
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Check your Telegram app for the code
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode('');
                        setTelegramError(null);
                      }}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp}
                      className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      {verifyingOtp ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      {verifyingOtp ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

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

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <Header title="Settings" subtitle="Loading..." />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
