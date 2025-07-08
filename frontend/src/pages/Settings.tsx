
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Key, Bell, Database, Shield, Trash2, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    company: "DataFlow Corp",
    role: "Admin"
  });

  const [notifications, setNotifications] = useState({
    email: true,
    slack: false,
    webhook: true,
    jobComplete: true,
    jobFailed: true,
    weekly: false
  });

  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: "Production API", key: "df_prod_123...789", created: "2024-01-15", lastUsed: "2 hours ago" },
    { id: 2, name: "Development API", key: "df_dev_456...012", created: "2024-01-10", lastUsed: "1 day ago" }
  ]);

  const [showApiKey, setShowApiKey] = useState({});

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully!");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences updated!");
  };

  const handleGenerateApiKey = () => {
    const newKey = {
      id: Date.now(),
      name: "New API Key",
      key: `df_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: "Never"
    };
    setApiKeys([...apiKeys, newKey]);
    toast.success("New API key generated!");
  };

  const handleDeleteApiKey = (keyId) => {
    setApiKeys(apiKeys.filter(key => key.id !== keyId));
    toast.success("API key deleted!");
  };

  const handleCopyApiKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard!");
  };

  const toggleApiKeyVisibility = (keyId) => {
    setShowApiKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  return (
    <>
      <AppSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Settings" />
        
        <div className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="api" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API Keys
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Data
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
              </TabsList>

              {/* Profile Settings */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Manage your account information and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20">
                        <AvatarFallback className="bg-teal-500 text-white text-lg">
                          {profile.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline">Change Avatar</Button>
                        <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF, max 2MB</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={profile.company}
                          onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select value={profile.role} onValueChange={(value) => setProfile({ ...profile, role: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="User">User</SelectItem>
                            <SelectItem value="Viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button onClick={handleSaveProfile} className="bg-teal-600 hover:bg-teal-700">
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* API Keys */}
              <TabsContent value="api">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>API Keys</CardTitle>
                        <CardDescription>Manage your API keys for integrations</CardDescription>
                      </div>
                      <Button onClick={handleGenerateApiKey} className="bg-teal-600 hover:bg-teal-700">
                        Generate New Key
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {apiKeys.map((apiKey) => (
                        <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{apiKey.name}</h3>
                              <Badge variant="outline">Active</Badge>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                {showApiKey[apiKey.id] ? apiKey.key : apiKey.key.replace(/(.{8}).*(.{8})/, '$1...***...$2')}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleApiKeyVisibility(apiKey.id)}
                              >
                                {showApiKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopyApiKey(apiKey.key)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-500">
                              Created: {apiKey.created} • Last used: {apiKey.lastUsed}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteApiKey(apiKey.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose how you want to be notified</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Notification Channels</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-gray-500">Receive notifications via email</p>
                          </div>
                          <Switch
                            checked={notifications.email}
                            onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Slack Integration</p>
                            <p className="text-sm text-gray-500">Send notifications to Slack</p>
                          </div>
                          <Switch
                            checked={notifications.slack}
                            onCheckedChange={(checked) => setNotifications({ ...notifications, slack: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Webhook Notifications</p>
                            <p className="text-sm text-gray-500">Send to custom webhook endpoints</p>
                          </div>
                          <Switch
                            checked={notifications.webhook}
                            onCheckedChange={(checked) => setNotifications({ ...notifications, webhook: checked })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Event Types</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Job Completion</p>
                            <p className="text-sm text-gray-500">When jobs finish successfully</p>
                          </div>
                          <Switch
                            checked={notifications.jobComplete}
                            onCheckedChange={(checked) => setNotifications({ ...notifications, jobComplete: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Job Failures</p>
                            <p className="text-sm text-gray-500">When jobs fail or encounter errors</p>
                          </div>
                          <Switch
                            checked={notifications.jobFailed}
                            onCheckedChange={(checked) => setNotifications({ ...notifications, jobFailed: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Weekly Reports</p>
                            <p className="text-sm text-gray-500">Weekly summary of your activities</p>
                          </div>
                          <Switch
                            checked={notifications.weekly}
                            onCheckedChange={(checked) => setNotifications({ ...notifications, weekly: checked })}
                          />
                        </div>
                      </div>
                    </div>

                    <Button onClick={handleSaveNotifications} className="bg-teal-600 hover:bg-teal-700">
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Data Settings */}
              <TabsContent value="data">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>Configure data retention and storage options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Data Retention Period</Label>
                      <Select defaultValue="90days">
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30days">30 days</SelectItem>
                          <SelectItem value="90days">90 days</SelectItem>
                          <SelectItem value="1year">1 year</SelectItem>
                          <SelectItem value="forever">Forever</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Default Export Format</Label>
                      <Select defaultValue="csv">
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        These actions cannot be undone. Please proceed with caution.
                      </p>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your account security and access</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3">Change Password</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input id="currentPassword" type="password" />
                        </div>
                        <div>
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input id="newPassword" type="password" />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input id="confirmPassword" type="password" />
                        </div>
                        <Button>Update Password</Button>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-medium mb-3">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">2FA Status</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security</p>
                        </div>
                        <Button variant="outline">Enable 2FA</Button>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-medium mb-3">Active Sessions</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-gray-500">Chrome on macOS • 192.168.1.100</p>
                          </div>
                          <Badge>Active</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </>
  );
};

export default Settings;
