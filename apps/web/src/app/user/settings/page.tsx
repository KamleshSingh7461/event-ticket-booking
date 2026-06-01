'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { User, Lock, Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function UserSettingsPage() {
    const { data: session, status } = useSession();

    const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);

    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [passwordSaving, setPasswordSaving] = useState(false);

    const [notifications, setNotifications] = useState({
        emailBooking: true,
        emailReminders: true,
        smsAlerts: false,
        promotions: false,
    });

    // Load real profile from DB
    useEffect(() => {
        if (status !== 'authenticated') return;
        fetch('/api/user/profile')
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    setProfile({
                        name: data.data.name || '',
                        email: data.data.email || '',
                        phone: data.data.phone || '',
                    });
                }
            })
            .catch(() => toast.error('Failed to load profile'))
            .finally(() => setProfileLoading(false));
    }, [status]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: profile.name, phone: profile.phone }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Profile updated successfully');
            } else {
                toast.error(data.error || 'Failed to update profile');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            toast.error('New passwords do not match');
            return;
        }
        if (passwordData.new.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setPasswordSaving(true);
        try {
            const res = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.current,
                    newPassword: passwordData.new,
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Password changed successfully');
                setPasswordData({ current: '', new: '', confirm: '' });
            } else {
                toast.error(data.error || 'Failed to change password');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleNotificationToggle = (key: string) => {
        setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
        toast.success('Notification preferences updated');
    };

    const initials = profile.name
        ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <main className="flex-1 p-6 md:p-12">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8 border-b border-gray-200 pb-6">
                        <h1 className="text-3xl font-bold mb-2 text-black tracking-tight">Account Settings</h1>
                        <p className="text-gray-500">Manage your profile and preferences</p>
                    </div>

                    <Tabs defaultValue="profile" className="space-y-8">
                        <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-none h-12 p-0">
                            <TabsTrigger value="profile" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white h-full">
                                Profile
                            </TabsTrigger>
                            <TabsTrigger value="security" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white h-full">
                                Security
                            </TabsTrigger>
                            <TabsTrigger value="notifications" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white h-full">
                                Notifications
                            </TabsTrigger>
                        </TabsList>

                        {/* ── Profile Tab ── */}
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
                                    {profileLoading ? (
                                        <div className="flex items-center justify-center py-16">
                                            <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full" />
                                        </div>
                                    ) : (
                                        <>
                                            {/* Avatar + name header */}
                                            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                                                <Avatar className="w-20 h-20 rounded-none">
                                                    <AvatarFallback className="rounded-none bg-black text-white text-xl font-bold">
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="text-xl font-bold text-black">{profile.name || '—'}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
                                                    {session?.user?.role && (
                                                        <span className="inline-block mt-2 text-xs font-bold uppercase tracking-widest text-gray-400 border border-gray-200 px-2 py-0.5">
                                                            {session.user.role}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-black font-semibold text-xs uppercase tracking-widest">
                                                            Full Name
                                                        </Label>
                                                        <Input
                                                            className="rounded-none border-gray-200 focus-visible:ring-1 focus-visible:ring-black h-12"
                                                            value={profile.name}
                                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-black font-semibold text-xs uppercase tracking-widest">
                                                            Email Address
                                                        </Label>
                                                        <Input
                                                            className="rounded-none border-gray-200 bg-gray-50 h-12 text-gray-400 cursor-not-allowed"
                                                            type="email"
                                                            value={profile.email}
                                                            disabled
                                                            title="Email cannot be changed"
                                                        />
                                                        <p className="text-xs text-gray-400">Email cannot be changed</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-black font-semibold text-xs uppercase tracking-widest">
                                                        Phone Number
                                                    </Label>
                                                    <Input
                                                        className="rounded-none border-gray-200 focus-visible:ring-1 focus-visible:ring-black h-12"
                                                        value={profile.phone}
                                                        placeholder="e.g. 9876543210"
                                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                    />
                                                </div>
                                                <Button
                                                    type="submit"
                                                    disabled={profileSaving}
                                                    className="rounded-none bg-black text-white hover:bg-gray-800 h-12 px-8 uppercase tracking-widest text-xs font-bold"
                                                >
                                                    {profileSaving ? 'Saving...' : 'Save Changes'}
                                                </Button>
                                            </form>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Security Tab ── */}
                        <TabsContent value="security" className="m-0">
                            <Card className="rounded-none shadow-sm border border-gray-200">
                                <CardHeader className="border-b border-gray-100 bg-white">
                                    <CardTitle className="flex items-center gap-2 text-black">
                                        <Lock className="w-5 h-5" />
                                        Password &amp; Security
                                    </CardTitle>
                                    <CardDescription>Keep your account secure</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-8">
                                    <form onSubmit={handlePasswordChange} className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-black font-semibold text-xs uppercase tracking-widest">
                                                Current Password
                                            </Label>
                                            <Input
                                                className="rounded-none border-gray-200 focus-visible:ring-1 focus-visible:ring-black h-12"
                                                type="password"
                                                value={passwordData.current}
                                                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-black font-semibold text-xs uppercase tracking-widest">
                                                    New Password
                                                </Label>
                                                <Input
                                                    className="rounded-none border-gray-200 focus-visible:ring-1 focus-visible:ring-black h-12"
                                                    type="password"
                                                    value={passwordData.new}
                                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-black font-semibold text-xs uppercase tracking-widest">
                                                    Confirm New Password
                                                </Label>
                                                <Input
                                                    className="rounded-none border-gray-200 focus-visible:ring-1 focus-visible:ring-black h-12"
                                                    type="password"
                                                    value={passwordData.confirm}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={passwordSaving}
                                            className="rounded-none bg-black text-white hover:bg-gray-800 h-12 px-8 uppercase tracking-widest text-xs font-bold"
                                        >
                                            {passwordSaving ? 'Updating...' : 'Update Password'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ── Notifications Tab ── */}
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
                                    {[
                                        { key: 'emailBooking', label: 'Booking Confirmations', desc: 'Receive email when you book a ticket' },
                                        { key: 'emailReminders', label: 'Event Reminders', desc: 'Get reminded before your events' },
                                        { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive text messages for important updates' },
                                        { key: 'promotions', label: 'Promotional Emails', desc: 'Receive updates about new events and offers' },
                                    ].map(({ key, label, desc }) => (
                                        <div key={key} className="flex items-center justify-between p-6 border border-gray-200 bg-white">
                                            <div>
                                                <p className="font-bold text-black">{label}</p>
                                                <p className="text-sm text-gray-500">{desc}</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notifications[key as keyof typeof notifications]}
                                                onChange={() => handleNotificationToggle(key)}
                                                className="w-5 h-5 accent-black cursor-pointer"
                                            />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
