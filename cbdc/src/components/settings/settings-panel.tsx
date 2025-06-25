// src/components/settings/settings-panel.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Shield, KeyRound, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SettingsPanel() {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState({ name: "Central Banker", email: "banker@central.gov" });
  const [notifications, setNotifications] = useState({ emailAlerts: true, pushAlerts: false });
  const [securitySettings, setSecuritySettings] = useState({ twoFactorAuth: true });

  const handleProfileSave = () => {
    // Simulate API call
    console.log("Saving profile:", userProfile);
    toast({ title: "Profile Updated", description: "Your profile settings have been saved." });
  };
  
  const handleNotificationsSave = () => {
    console.log("Saving notification settings:", notifications);
    toast({ title: "Notifications Updated", description: "Your notification preferences have been saved." });
  };
  
  const handleSecuritySave = () => {
    console.log("Saving security settings:", securitySettings);
    toast({ title: "Security Settings Updated", description: "Your security settings have been applied." });
  };


  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <TabsTrigger value="profile"><User className="mr-2 h-4 w-4 inline-block" />Profile</TabsTrigger>
        <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4 inline-block" />Notifications</TabsTrigger>
        <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4 inline-block" />Security</TabsTrigger>
        <TabsTrigger value="api_keys" disabled><KeyRound className="mr-2 h-4 w-4 inline-block" />API Keys</TabsTrigger>
        <TabsTrigger value="appearance" disabled><Palette className="mr-2 h-4 w-4 inline-block" />Appearance</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Manage your personal information and account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://placehold.co/80x80.png" data-ai-hint="avatar person" />
                <AvatarFallback>CB</AvatarFallback>
              </Avatar>
              <Button variant="outline">Change Avatar</Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={userProfile.name} onChange={(e) => setUserProfile(p => ({...p, name: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={userProfile.email} onChange={(e) => setUserProfile(p => ({...p, email: e.target.value}))} />
            </div>
            <Button onClick={handleProfileSave}>Save Profile</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Control how you receive alerts and updates from the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="emailAlerts" className="font-medium">Email Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive important notifications via email.</p>
              </div>
              <Switch id="emailAlerts" checked={notifications.emailAlerts} onCheckedChange={(checked) => setNotifications(s => ({...s, emailAlerts: checked}))} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="pushAlerts" className="font-medium">Push Notifications (Mobile)</Label>
                 <p className="text-sm text-muted-foreground">Get real-time alerts on your mobile device (requires app).</p>
              </div>
              <Switch id="pushAlerts" checked={notifications.pushAlerts} onCheckedChange={(checked) => setNotifications(s => ({...s, pushAlerts: checked}))} disabled />
            </div>
            <Button onClick={handleNotificationsSave}>Save Preferences</Button>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Enhance your account security.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="twoFactorAuth" className="font-medium">Two-Factor Authentication (2FA)</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
              </div>
              <Switch id="twoFactorAuth" checked={securitySettings.twoFactorAuth} onCheckedChange={(checked) => setSecuritySettings(s => ({...s, twoFactorAuth: checked}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" placeholder="Enter current password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" placeholder="Enter new password" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
            </div>
            <Button onClick={handleSecuritySave}>Update Security Settings</Button>
          </CardContent>
        </Card>
      </TabsContent>
      
       <TabsContent value="api_keys">
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage API keys for programmatic access (Feature Coming Soon).</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">This feature is under development. Check back later for API key management.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="appearance">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the platform (Feature Coming Soon).</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">Theme customization options will be available here in a future update.</p>
          </CardContent>
        </Card>
      </TabsContent>

    </Tabs>
  );
}
