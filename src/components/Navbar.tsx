'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Menu, X } from 'lucide-react';

import { useState } from 'react';

export function Navbar() {
    const { data: session, status } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className="border-b bg-[#AE8638] text-black sticky top-0 z-50 shadow-md">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <img src="https://res.cloudinary.com/dxgx75kwb/image/upload/v1765407837/logo_lxeacy.png" alt="FGSN Logo" className="h-14 w-auto object-contain" />
                        <span className="text-sm md:text-xl font-black italic tracking-widest text-black uppercase drop-shadow-[1px_1px_0_rgba(255,255,255,0.5)] transform -skew-x-12">WYLDCARD STATS</span>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden p-2" onClick={toggleMenu}>
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-4">
                    <Link href="/events" className="text-sm font-bold text-black hover:text-white transition-colors">
                        Events
                    </Link>
                    <Link href="/about" className="text-sm font-bold text-black hover:text-white transition-colors">
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

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden border-t bg-[#AE8638] p-4 space-y-4 shadow-xl">
                    <div className="flex flex-col space-y-3">
                        <Link href="/events" className="text-sm font-bold text-black hover:text-white transition-colors" onClick={toggleMenu}>
                            Events
                        </Link>
                        <Link href="/about" className="text-sm font-bold text-black hover:text-white transition-colors" onClick={toggleMenu}>
                            About
                        </Link>
                    </div>
                    <div className="pt-4 border-t">
                        {status === 'loading' ? (
                            <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
                        ) : session ? (
                            <div className="flex flex-col gap-3">
                                <Link href={getDashboardLink()} onClick={toggleMenu}>
                                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-xs">
                                                {session.user.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>{session.user.name}</span>
                                        <span className="text-xs text-muted-foreground ml-auto">{session.user.role} Dashboard</span>
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        signOut({ callbackUrl: '/' });
                                        toggleMenu();
                                    }}
                                    className="w-full justify-start gap-2 text-red-600"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link href="/login" onClick={toggleMenu}>
                                    <Button variant="ghost" size="sm" className="w-full">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/register" onClick={toggleMenu}>
                                    <Button size="sm" className="w-full">Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
