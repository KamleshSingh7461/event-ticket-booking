'use client';
import { useState } from 'react';
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
            <main className="flex-1 p-6 md:p-12">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8 border-b border-gray-200 pb-6">
                        <h1 className="text-3xl font-bold mb-2 text-black tracking-tight">Account Settings</h1>
                        <p className="text-gray-500">Manage your profile and preferences</p>
                    </div>

                    <Tabs defaultValue="profile" className="space-y-8">
                        <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 rounded-none h-12 p-0">
                            <TabsTrigger value="profile" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white h-full">Profile</TabsTrigger>
                            <TabsTrigger value="security" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white h-full">Security</TabsTrigger>
                            <TabsTrigger value="notifications" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white h-full">Notifications</TabsTrigger>
                            <TabsTrigger value="billing" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white h-full">Billing</TabsTrigger>
                        </TabsList>

                        {/* Profile Tab */}
                        <TabsContent value="profile" className="m-0">
                            <Card className="rounded-none shadow-sm border border-gray-200">
                                <CardHeader className="border-b border-gray-100 bg-white">
                                    <CardTitle className="flex items-center gap-2 text-black">
                                        <User className="w-5 h-5" />
                                        Personal Information
                                    </CardTitle>
                                    <CardDescription>Update your personal details</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-8">
                                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                                        <Avatar className="w-20 h-20 bg-black text-white text-2xl rounded-none">
                                            <AvatarFallback className="rounded-none bg-black text-white">{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-xl font-bold text-black">{profile.name}</h3>
                                            <p className="text-sm text-gray-500 mb-3">{profile.email}</p>
                                            <Button variant="outline" size="sm" className="rounded-none border-gray-300 text-black hover:bg-gray-100">Change Photo</Button>
                                        </div>
                                    </div>

                                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-black font-semibold text-xs uppercase tracking-widest">Full Name</Label>
                                                <Input
                                                    className="rounded-none border-gray-200 focus-visible:ring-1 focus-visible:ring-black h-12"
                                                    value={profile.name}
                                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-black font-semibold text-xs uppercase tracking-widest">Email Address</Label>
                                                <Input
                                                    className="rounded-none border-gray-200 focus-visible:ring-1 focus-visible:ring-black h-12"
                                                    type="email"
                                                    value={profile.email}
                                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-black font-semibold text-xs uppercase tracking-widest">Phone Number</Label>
                                            <Input
                                                className="rounded-none border-gray-200 focus-visible:ring-1 focus-visible:ring-black h-12"
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            />
                                        </div>
                                        <Button type="submit" className="rounded-none bg-black text-white hover:bg-gray-800 h-12 px-8 uppercase tracking-widest text-xs font-bold">Save Changes</Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security" className="m-0">
                            <Card className="rounded-none shadow-sm border border-gray-200">
                                <CardHeader className="border-b border-gray-100 bg-white">
                                    <CardTitle className="flex items-center gap-2 text-black">
                                        <Lock className="w-5 h-5" />
                                        Password & Security
                                    </CardTitle>
                                    <CardDescription>Keep your account secure</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-8">
                                    <form onSubmit={handlePasswordChange} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-black font-semibold text-xs uppercase tracking-widest">Current Password</Label>
                                            <Input
                                                className="rounded-none border-gray-200 focus-visible:ring-1 focus-visible:ring-black h-12"
                                                type="password"
                                                value={passwordData.current}
                                                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-black font-semibold text-xs uppercase tracking-widest">New Password</Label>
                                                <Input
                                                    className="rounded-none border-gray-200 focus-visible:ring-1 focus-visible:ring-black h-12"
                                                    type="password"
                                                    value={passwordData.new}
                                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-black font-semibold text-xs uppercase tracking-widest">Confirm Password</Label>
                                                <Input
                                                    className="rounded-none border-gray-200 focus-visible:ring-1 focus-visible:ring-black h-12"
                                                    type="password"
                                                    value={passwordData.confirm}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit" className="rounded-none bg-black text-white hover:bg-gray-800 h-12 px-8 uppercase tracking-widest text-xs font-bold">Update Password</Button>
                                    </form>

                                    <div className="mt-8 pt-8 border-t border-gray-100">
                                        <h4 className="font-bold text-black mb-2 tracking-tight text-lg">Two-Factor Authentication</h4>
                                        <p className="text-sm text-gray-500 mb-6">
                                            Add an extra layer of security to your account to prevent unauthorized access.
                                        </p>
                                        <Button variant="outline" className="rounded-none border-gray-300 text-black hover:bg-gray-100">Enable 2FA</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Notifications Tab */}
                        <TabsContent value="notifications" className="m-0">
                            <Card className="rounded-none shadow-sm border border-gray-200">
                                <CardHeader className="border-b border-gray-100 bg-white">
                                    <CardTitle className="flex items-center gap-2 text-black">
                                        <Bell className="w-5 h-5" />
                                        Notification Preferences
                                    </CardTitle>
                                    <CardDescription>Choose how you want to be notified</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-8">
                                    <div className="flex items-center justify-between p-6 border border-gray-200 bg-white">
                                        <div>
                                            <p className="font-bold text-black">Booking Confirmations</p>
                                            <p className="text-sm text-gray-500">Receive email when you book a ticket</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notifications.emailBooking}
                                            onChange={() => handleNotificationToggle('emailBooking')}
                                            className="w-5 h-5 accent-black cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-6 border border-gray-200 bg-white">
                                        <div>
                                            <p className="font-bold text-black">Event Reminders</p>
                                            <p className="text-sm text-gray-500">Get reminded before your events</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notifications.emailReminders}
                                            onChange={() => handleNotificationToggle('emailReminders')}
                                            className="w-5 h-5 accent-black cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-6 border border-gray-200 bg-white">
                                        <div>
                                            <p className="font-bold text-black">SMS Alerts</p>
                                            <p className="text-sm text-gray-500">Receive text messages for important updates</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notifications.smsAlerts}
                                            onChange={() => handleNotificationToggle('smsAlerts')}
                                            className="w-5 h-5 accent-black cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-6 border border-gray-200 bg-white">
                                        <div>
                                            <p className="font-bold text-black">Promotional Emails</p>
                                            <p className="text-sm text-gray-500">Receive updates about new events and offers</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={notifications.promotions}
                                            onChange={() => handleNotificationToggle('promotions')}
                                            className="w-5 h-5 accent-black cursor-pointer"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Billing Tab */}
                        <TabsContent value="billing" className="m-0">
                            <Card className="rounded-none shadow-sm border border-gray-200">
                                <CardHeader className="border-b border-gray-100 bg-white">
                                    <CardTitle className="flex items-center gap-2 text-black">
                                        <CreditCard className="w-5 h-5" />
                                        Payment Methods
                                    </CardTitle>
                                    <CardDescription>Manage your saved payment methods</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-8">
                                    <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-300">
                                        <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <p className="mb-2 font-bold text-black">No saved payment methods</p>
                                        <p className="text-sm text-gray-500">Payment methods will be saved during checkout</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="mt-8 rounded-none shadow-sm border border-gray-200">
                                <CardHeader className="border-b border-gray-100 bg-white">
                                    <CardTitle className="text-black">Billing History</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-8">
                                    <div className="text-center py-12 text-gray-500">
                                        <p>Your transaction history will appear here</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
