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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                            <LogIn className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>Sign in to your EventZone account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                disabled={loading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
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
                        <p className="text-muted-foreground">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                        <p className="text-xs text-center text-muted-foreground mb-3">Demo Accounts:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 bg-muted rounded">
                                <p className="font-medium">Admin</p>
                                <p className="text-muted-foreground">admin@test.com</p>
                            </div>
                            <div className="p-2 bg-muted rounded">
                                <p className="font-medium">Manager</p>
                                <p className="text-muted-foreground">manager@test.com</p>
                            </div>
                            <div className="p-2 bg-muted rounded">
                                <p className="font-medium">Coordinator</p>
                                <p className="text-muted-foreground">coord@test.com</p>
                            </div>
                            <div className="p-2 bg-muted rounded">
                                <p className="font-medium">User</p>
                                <p className="text-muted-foreground">user@test.com</p>
                            </div>
                        </div>
                        <p className="text-xs text-center text-muted-foreground mt-2">Password: password123</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
