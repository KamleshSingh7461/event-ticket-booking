'use client';
import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { User, Mail, Lock, Bell, CreditCard } from 'lucide-react';

export default function UserSettingsPage() {
    const [profile, setProfile] = useState({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 234 567 8900'
    });

    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [notifications, setNotifications] = useState({
        emailBooking: true,
        emailReminders: true,
        smsAlerts: false,
        promotions: false
    });

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Profile updated successfully');
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            toast.error('Passwords do not match');
            return;
        }
        toast.success('Password changed successfully');
        setPasswordData({ current: '', new: '', confirm: '' });
    };

    const handleNotificationToggle = (key: string) => {
        setNotifications({ ...notifications, [key]: !notifications[key as keyof typeof notifications] });
        toast.success('Notification preferences updated');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 container py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
                        <p className="text-muted-foreground">Manage your profile and preferences</p>
                    </div>

                    <Tabs defaultValue="profile" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                            <TabsTrigger value="notifications">Notifications</TabsTrigger>
                            <TabsTrigger value="billing">Billing</TabsTrigger>
                        </TabsList>

                        {/* Profile Tab */}
                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Personal Information
                                    </CardTitle>
                                    <CardDescription>Update your personal details</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-6 mb-6">
                                        <Avatar className="w-20 h-20 bg-primary text-white text-2xl">
                                            <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-lg font-semibold">{profile.name}</h3>
                                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                                            <Button variant="outline" size="sm" className="mt-2">Change Photo</Button>
                                        </div>
                                    </div>

                                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Full Name</Label>
                                                <Input
                                                    value={profile.name}
                                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Email</Label>
                                                <Input
                                                    type="email"
                                                    value={profile.email}
                                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone Number</Label>
                                            <Input
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            />
                                        </div>
                                        <Button type="submit">Save Changes</Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lock className="w-5 h-5" />
                                        Password & Security
                                    </CardTitle>
                                    <CardDescription>Keep your account secure</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePasswordChange} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Current Password</Label>
                                            <Input
                                                type="password"
                                                value={passwordData.current}
                                                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>New Password</Label>
                                                <Input
                                                    type="password"
                                                    value={passwordData.new}
                                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Confirm Password</Label>
                                                <Input
                                                    type="password"
                                                    value={passwordData.confirm}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit">Update Password</Button>
                                    </form>

                                    <div className="mt-6 pt-6 border-t">
                                        <h4 className="font-semibold mb-4">Two-Factor Authentication</h4>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Add an extra layer of security to your account
                                        </p>
                                        <Button variant="outline">Enable 2FA</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Notifications Tab */}
                        <TabsContent value="notifications">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bell className="w-5 h-5" />
                                        Notification Preferences
                                    </CardTitle>
                                    <CardDescription>Choose how you want to be notified</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <p className="font-medium">Booking Confirmations</p>
                                            <p className="text-sm text-muted-foreground">Receive email when you book a ticket</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notifications.emailBooking}
                                            onChange={() => handleNotificationToggle('emailBooking')}
                                            className="w-5 h-5"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <p className="font-medium">Event Reminders</p>
                                            <p className="text-sm text-muted-foreground">Get reminded before your events</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notifications.emailReminders}
                                            onChange={() => handleNotificationToggle('emailReminders')}
                                            className="w-5 h-5"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <p className="font-medium">SMS Alerts</p>
                                            <p className="text-sm text-muted-foreground">Receive text messages for important updates</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notifications.smsAlerts}
                                            onChange={() => handleNotificationToggle('smsAlerts')}
                                            className="w-5 h-5"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <p className="font-medium">Promotional Emails</p>
                                            <p className="text-sm text-muted-foreground">Receive updates about new events and offers</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notifications.promotions}
                                            onChange={() => handleNotificationToggle('promotions')}
                                            className="w-5 h-5"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Billing Tab */}
                        <TabsContent value="billing">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5" />
                                        Payment Methods
                                    </CardTitle>
                                    <CardDescription>Manage your saved payment methods</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12 text-muted-foreground">
                                        <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p className="mb-2">No saved payment methods</p>
                                        <p className="text-sm">Payment methods will be saved during checkout</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Billing History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>Your transaction history will appear here</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Footer />
        </div>
    );
}
