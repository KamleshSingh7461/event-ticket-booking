'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import BackButton from '@/components/BackButton';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (data.success) {
                setSubmitted(true);
                toast.success('Reset link sent to your email');
            } else {
                toast.error(data.error || 'Something went wrong');
            }
        } catch (error) {
            toast.error('Failed to send reset request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

            <div className="w-full max-w-md mb-8 flex justify-start relative z-10">
                <BackButton className="text-[#AE8638] hover:text-[#AE8638]/80 bg-black/40 hover:bg-black/60 p-2 rounded-full transition-colors backdrop-blur-sm border border-[#AE8638]/20" />
            </div>

            <Card className="w-full max-w-md bg-black border border-[#AE8638]/20 shadow-2xl relative z-10">
                <CardHeader className="space-y-2 text-center pb-2">
                    <CardTitle className="text-3xl font-bold text-white">Reset Password</CardTitle>
                    <CardDescription className="text-gray-400">
                        Enter your email to receive a password reset link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-200">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                        Sending Link...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="bg-[#AE8638]/10 text-[#AE8638] p-4 rounded-lg border border-[#AE8638]/20">
                                <p className="font-medium">Check your email</p>
                                <p className="text-sm mt-1 text-gray-400">
                                    We have sent a password reset link to <strong>{email}</strong>
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full border-[#AE8638]/20 text-[#AE8638] hover:bg-[#AE8638]/10"
                                onClick={() => setSubmitted(false)}
                            >
                                Try another email
                            </Button>
                        </div>
                    )}

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
