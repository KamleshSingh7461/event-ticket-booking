'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, LogIn } from 'lucide-react';
import BackButton from '@/components/BackButton';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                toast.error(result.error);
            } else if (result?.ok) {
                toast.success('Login successful!');

                // Fetch session to get role
                const response = await fetch('/api/auth/session');
                const session = await response.json();

                if (session?.user?.role) {
                    const role = session.user.role;
                    switch (role) {
                        case 'SUPER_ADMIN':
                            router.push('/admin/dashboard');
                            break;
                        case 'VENUE_MANAGER':
                            router.push('/venue-manager/dashboard');
                            break;
                        case 'COORDINATOR':
                            router.push('/coordinator/dashboard');
                            break;
                        default:
                            router.push('/user/dashboard'); // Or home '/'
                    }
                    router.refresh();
                } else {
                    router.push('/');
                    router.refresh();
                }
            }
        } catch (error) {
            toast.error('An error occurred during login');
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
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-[#AE8638]/10 rounded-full flex items-center justify-center border border-[#AE8638]/20">
                            <LogIn className="w-10 h-10 text-[#AE8638]" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold text-white">Welcome Back</CardTitle>
                    <CardDescription className="text-gray-400">Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-200">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={loading}
                                className="bg-white/5 border-[#AE8638]/20 text-white placeholder:text-gray-600 focus:border-[#AE8638]"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-gray-200">Password</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-[#AE8638] hover:text-[#AE8638]/80 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-gray-400">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-[#AE8638] hover:underline font-bold">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
