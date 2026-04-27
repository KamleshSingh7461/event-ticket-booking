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
import { Loader2, LogIn, Eye, EyeOff, ArrowLeft } from 'lucide-react';
export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);


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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md mb-8 flex justify-start">
                <Link href="/" className="flex items-center gap-2 text-sm text-black hover:text-gray-600 bg-white hover:bg-gray-50 p-2 rounded-none transition-colors border border-gray-200 shadow-sm font-semibold uppercase tracking-widest px-4">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
            </div>

            <Card className="w-full max-w-md bg-white border border-gray-200 shadow-sm rounded-none">
                <CardHeader className="space-y-2 text-center pb-6 border-b border-gray-100">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-black flex items-center justify-center">
                            <LogIn className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-semibold text-black tracking-tight">System Authentication</CardTitle>
                    <CardDescription className="text-gray-500 font-light">Access your enterprise dashboard</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-black font-semibold uppercase tracking-wider text-xs">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={loading}
                                className="bg-white border-gray-200 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black rounded-none h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-black font-semibold uppercase tracking-wider text-xs">Password</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-gray-500 hover:text-black hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    disabled={loading}
                                    className="bg-white border-gray-200 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black rounded-none h-12 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-black text-white hover:bg-gray-800 font-semibold rounded-none h-12"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm border-t border-gray-100 pt-6">
                        <p className="text-gray-500">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-black hover:underline font-bold">
                                Request Access
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
