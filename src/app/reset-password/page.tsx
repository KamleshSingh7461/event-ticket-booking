'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error('Invalid or missing reset token');
            router.push('/login');
        }
    }, [token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Password reset successfully');
                router.push('/login');
            } else {
                toast.error(data.error || 'Failed to reset password');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!token) return null;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">New Password</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-white/5 border-[#AE8638]/20 text-white placeholder:text-gray-600 focus:border-[#AE8638]"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-200">Confirm New Password</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-white/5 border-[#AE8638]/20 text-white placeholder:text-gray-600 focus:border-[#AE8638]"
                />
            </div>
            <Button
                type="submit"
                className="w-full bg-[#AE8638] text-black hover:bg-[#AE8638]/90 font-bold"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Resetting Password...
                    </>
                ) : (
                    'Set New Password'
                )}
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

            <Card className="w-full max-w-md bg-black border border-[#AE8638]/20 shadow-2xl relative z-10">
                <CardHeader className="space-y-2 text-center pb-2">
                    <CardTitle className="text-3xl font-bold text-white">Set New Password</CardTitle>
                    <CardDescription className="text-gray-400">
                        Create a strong password for your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
                        <ResetPasswordForm />
                    </Suspense>

                    <div className="mt-6 text-center text-sm">
                        <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                            Back to Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
