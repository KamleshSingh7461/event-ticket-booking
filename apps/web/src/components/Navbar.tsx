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

        const adminBaseUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';

        switch (session.user.role) {
            case 'SUPER_ADMIN':
                return `${adminBaseUrl}/admin/dashboard`;
            case 'VENUE_MANAGER':
                return `${adminBaseUrl}/venue-manager/dashboard`;
            case 'COORDINATOR':
                return `${adminBaseUrl}/coordinator/dashboard`;
            case 'USER':
                return '/user/dashboard';
            default:
                return '/';
        }
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className="border-b border-gray-100 bg-white text-black sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <img src="https://res.cloudinary.com/desdbjzzt/image/upload/v1777203252/logo_yswfeg.png" alt="WYLDCARD Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
                        <div className="hidden sm:flex flex-col">
                            <span className="text-base font-black tracking-widest text-black uppercase leading-none">WYLDCARD</span>
                            <span className="text-[10px] font-semibold tracking-[0.3em] text-gray-500 uppercase">Stats</span>
                        </div>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden p-2" onClick={toggleMenu}>
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/events" className="text-sm font-semibold text-gray-600 hover:text-black transition-colors uppercase tracking-wider">
                        Events
                    </Link>
                    <Link href="/about" className="text-sm font-semibold text-gray-600 hover:text-black transition-colors uppercase tracking-wider">
                        Company
                    </Link>

                    {status === 'loading' ? (
                        <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
                    ) : session ? (
                        <div className="flex items-center gap-4">
                            <a href={getDashboardLink()}>
                                <Button variant="ghost" size="sm" className="gap-2 text-black hover:bg-gray-100 rounded-none h-9 px-3">
                                    <Avatar className="h-6 w-6 rounded-none">
                                        <AvatarFallback className="text-xs bg-black text-white rounded-none">
                                            {session.user.name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden sm:inline font-medium">{session.user.name}</span>
                                </Button>
                            </a>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="gap-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-none h-9 px-3"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline uppercase text-xs tracking-wider font-bold">Logout</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 border-l border-gray-200 pl-6 ml-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="rounded-none text-gray-600 hover:text-black hover:bg-gray-100 uppercase tracking-wider text-xs font-bold">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm" className="rounded-none bg-black text-white hover:bg-gray-800 uppercase tracking-wider text-xs font-bold px-6">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white p-4 space-y-4 shadow-sm">
                    <div className="flex flex-col space-y-3">
                        <Link href="/events" className="text-sm font-semibold text-gray-600 hover:text-black transition-colors uppercase tracking-wider" onClick={toggleMenu}>
                            Events
                        </Link>
                        <Link href="/about" className="text-sm font-semibold text-gray-600 hover:text-black transition-colors uppercase tracking-wider" onClick={toggleMenu}>
                            Company
                        </Link>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                        {status === 'loading' ? (
                            <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
                        ) : session ? (
                            <div className="flex flex-col gap-3">
                                <a href={getDashboardLink()} onClick={toggleMenu}>
                                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-none text-black">
                                        <Avatar className="h-6 w-6 rounded-none">
                                            <AvatarFallback className="text-xs bg-black text-white rounded-none">
                                                {session.user.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>{session.user.name}</span>
                                        <span className="text-[10px] text-gray-400 ml-auto uppercase tracking-wider">{session.user.role} Dashboard</span>
                                    </Button>
                                </a>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        signOut({ callbackUrl: '/' });
                                        toggleMenu();
                                    }}
                                    className="w-full justify-start gap-2 text-red-600 rounded-none hover:bg-red-50 hover:text-red-700 uppercase tracking-wider text-xs font-bold"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link href="/login" onClick={toggleMenu}>
                                    <Button variant="ghost" size="sm" className="w-full rounded-none text-gray-600 uppercase tracking-wider text-xs font-bold">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/register" onClick={toggleMenu}>
                                    <Button size="sm" className="w-full rounded-none bg-black text-white uppercase tracking-wider text-xs font-bold">Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
