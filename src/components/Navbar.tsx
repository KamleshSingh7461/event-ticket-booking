'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';

export function Navbar() {
    const { data: session, status } = useSession();

    const getDashboardLink = () => {
        if (!session?.user?.role) return '/';

        switch (session.user.role) {
            case 'SUPER_ADMIN':
                return '/admin/dashboard';
            case 'VENUE_MANAGER':
                return '/venue-manager/dashboard';
            case 'COORDINATOR':
                return '/coordinator/dashboard';
            case 'USER':
                return '/user/dashboard';
            default:
                return '/';
        }
    };

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            EventZone
                        </span>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/events" className="text-sm font-medium transition-colors hover:text-primary">
                        Events
                    </Link>
                    <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
                        About
                    </Link>

                    {status === 'loading' ? (
                        <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
                    ) : session ? (
                        <div className="flex items-center gap-3">
                            <Link href={getDashboardLink()}>
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                            {session.user.name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden sm:inline">{session.user.name}</span>
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
