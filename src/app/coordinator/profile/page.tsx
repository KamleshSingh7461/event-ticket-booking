'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { User, Mail, Lock, Bell } from 'lucide-react';

export default function CoordinatorProfilePage() {
    const [profile, setProfile] = useState({
        name: 'John Coordinator',
        email: 'john@eventzone.com',
        phone: '+1 234 567 8900'
    });

    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        smsAlerts: false,
        pushNotifications: true
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
        <div className="min-h-screen bg-slate-950 text-white">
            <header className="bg-slate-900 border-b border-slate-800">
                <div className="container mx-auto px-6 py-4">
                    <h1 className="text-2xl font-bold">Profile & Settings</h1>
                    <p className="text-sm text-slate-400">Manage your account preferences</p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 max-w-4xl">
                {/* Profile Section */}
                <Card className="bg-slate-900 border-slate-800 mb-8">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Personal Information
                        </CardTitle>
                        <CardDescription className="text-slate-400">Update your profile details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-6 mb-6">
                            <Avatar className="w-20 h-20 bg-primary text-white text-2xl">
                                <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
                                <p className="text-sm text-slate-400">Coordinator</p>
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Full Name</Label>
                                    <Input
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="bg-slate-800 border-slate-700 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Email</Label>
                                    <Input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        className="bg-slate-800 border-slate-700 text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Phone Number</Label>
                                <Input
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                            <Button type="submit" className="bg-primary hover:bg-primary/90">
                                Save Changes
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Password Section */}
                <Card className="bg-slate-900 border-slate-800 mb-8">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Lock className="w-5 h-5 text-primary" />
                            Change Password
                        </CardTitle>
                        <CardDescription className="text-slate-400">Update your password for security</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Current Password</Label>
                                <Input
                                    type="password"
                                    value={passwordData.current}
                                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">New Password</Label>
                                    <Input
                                        type="password"
                                        value={passwordData.new}
                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                        className="bg-slate-800 border-slate-700 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Confirm Password</Label>
                                    <Input
                                        type="password"
                                        value={passwordData.confirm}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                        className="bg-slate-800 border-slate-700 text-white"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="bg-primary hover:bg-primary/90">
                                Update Password
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Notifications Section */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary" />
                            Notification Preferences
                        </CardTitle>
                        <CardDescription className="text-slate-400">Manage how you receive alerts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                            <div>
                                <p className="font-medium text-white">Email Alerts</p>
                                <p className="text-sm text-slate-400">Receive verification updates via email</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={notifications.emailAlerts}
                                onChange={() => handleNotificationToggle('emailAlerts')}
                                className="w-5 h-5"
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                            <div>
                                <p className="font-medium text-white">SMS Alerts</p>
                                <p className="text-sm text-slate-400">Get text messages for important updates</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={notifications.smsAlerts}
                                onChange={() => handleNotificationToggle('smsAlerts')}
                                className="w-5 h-5"
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                            <div>
                                <p className="font-medium text-white">Push Notifications</p>
                                <p className="text-sm text-slate-400">Browser notifications for real-time alerts</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={notifications.pushNotifications}
                                onChange={() => handleNotificationToggle('pushNotifications')}
                                className="w-5 h-5"
                            />
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
