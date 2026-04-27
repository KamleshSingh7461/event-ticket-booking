'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Settings, Mail, CreditCard, Bell } from 'lucide-react';

export default function SettingsPage() {
    const [emailSettings, setEmailSettings] = useState({
        host: process.env.EMAIL_SERVER_HOST || '',
        port: process.env.EMAIL_SERVER_PORT || '',
        user: process.env.EMAIL_SERVER_USER || '',
        from: process.env.EMAIL_FROM || ''
    });

    const [paymentSettings, setPaymentSettings] = useState({
        payuKey: '***hidden***',
        payuEnv: process.env.PAYU_ENV || 'test'
    });

    const handleSaveEmail = () => {
        toast.info('Email settings are configured via environment variables (.env.local)');
    };

    const handleSavePayment = () => {
        toast.info('Payment settings are configured via environment variables (.env.local)');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Settings className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Settings</h1>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="payment">Payment</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Information</CardTitle>
                            <CardDescription>Basic details about your event platform</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Platform Name</Label>
                                <Input defaultValue="EventZone" />
                            </div>
                            <div className="space-y-2">
                                <Label>Support Email</Label>
                                <Input type="email" defaultValue="support@eventzone.com" />
                            </div>
                            <div className="space-y-2">
                                <Label>Contact Phone</Label>
                                <Input defaultValue="+1 234 567 8900" />
                            </div>
                            <Button onClick={() => toast.success('Settings saved!')}>Save Changes</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="email" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                Email Configuration
                            </CardTitle>
                            <CardDescription>Configure SMTP settings for sending emails</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                                <strong>Note:</strong> Email settings are configured via environment variables in <code className="bg-blue-100 px-1 rounded">.env.local</code>
                            </div>
                            <div className="space-y-2">
                                <Label>SMTP Host</Label>
                                <Input value={emailSettings.host} disabled placeholder="smtp.example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label>SMTP Port</Label>
                                <Input value={emailSettings.port} disabled placeholder="587" />
                            </div>
                            <div className="space-y-2">
                                <Label>From Email</Label>
                                <Input value={emailSettings.from} disabled placeholder="noreply@eventzone.com" />
                            </div>
                            <Button onClick={handleSaveEmail} variant="outline">View Documentation</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payment" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                PayU Integration
                            </CardTitle>
                            <CardDescription>Manage payment gateway settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                                <strong>Note:</strong> PayU credentials are configured via environment variables in <code className="bg-blue-100 px-1 rounded">.env.local</code>
                            </div>
                            <div className="space-y-2">
                                <Label>Merchant Key</Label>
                                <Input value={paymentSettings.payuKey} disabled type="password" />
                            </div>
                            <div className="space-y-2">
                                <Label>Environment</Label>
                                <Input value={paymentSettings.payuEnv} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label>Test Mode</Label>
                                <div className="flex items-center gap-2">
                                    <div className={`px-3 py-1 rounded text-sm font-medium ${paymentSettings.payuEnv === 'test' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {paymentSettings.payuEnv === 'test' ? 'Test Mode Active' : 'Production Mode'}
                                    </div>
                                </div>
                            </div>
                            <Button onClick={handleSavePayment} variant="outline">View Documentation</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                Notification Preferences
                            </CardTitle>
                            <CardDescription>Manage how and when you receive notifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">New Bookings</p>
                                    <p className="text-sm text-muted-foreground">Get notified when someone books a ticket</p>
                                </div>
                                <input type="checkbox" defaultChecked className="w-4 h-4" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Payment Failures</p>
                                    <p className="text-sm text-muted-foreground">Alert when a payment fails</p>
                                </div>
                                <input type="checkbox" defaultChecked className="w-4 h-4" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">New User Registrations</p>
                                    <p className="text-sm text-muted-foreground">Notify when new users sign up</p>
                                </div>
                                <input type="checkbox" className="w-4 h-4" />
                            </div>
                            <Button onClick={() => toast.success('Notification preferences saved!')}>Save Preferences</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
