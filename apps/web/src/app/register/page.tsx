'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, UserPlus, Eye, EyeOff, ArrowLeft } from 'lucide-react';
export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Account created successfully!');
                router.push('/login');
            } else {
                toast.error(data.error || 'Registration failed');
            }
        } catch (error) {
            toast.error('An error occurred during registration');
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
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-semibold text-black tracking-tight">Enterprise Registration</CardTitle>
                    <CardDescription className="text-gray-500 font-light">Join the WYLDCARD Stats platform</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-black font-semibold uppercase tracking-wider text-xs">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                disabled={loading}
                                className="bg-white border-gray-200 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black rounded-none h-12"
                            />
                        </div>
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
                            <Label htmlFor="password" className="text-black font-semibold uppercase tracking-wider text-xs">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    disabled={loading}
                                    minLength={6}
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
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-black font-semibold uppercase tracking-wider text-xs">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                    disabled={loading}
                                    className="bg-white border-gray-200 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black rounded-none h-12 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                        </div>
                        <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800 font-semibold rounded-none h-12" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Submit Request'
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm border-t border-gray-100 pt-6">
                        <p className="text-gray-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-black hover:underline font-bold">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
