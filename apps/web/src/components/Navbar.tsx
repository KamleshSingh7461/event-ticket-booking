'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Menu, X, ArrowRight } from 'lucide-react';

import { useState, useEffect } from 'react';

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

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    return (
        <>
            <nav className="border-b border-white/5 bg-[#0A0A0A]/70 backdrop-blur-2xl text-white sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group z-50 relative">
                            <img src="https://res.cloudinary.com/desdbjzzt/image/upload/v1777203252/logo_yswfeg.png" alt="WYLDCARD Logo" className="h-8 md:h-10 w-auto object-contain transition-transform group-hover:scale-105" />
                            <div className="flex flex-col">
                                <span className="text-sm md:text-base font-black tracking-widest text-white uppercase leading-none">WYLDCARD</span>
                                <span className="text-[8px] md:text-[10px] font-semibold tracking-[0.3em] text-[#AE8638] uppercase mt-0.5">Stats</span>
                            </div>
                        </Link>
                    </div>

                    {/* Modern Animated Mobile Menu Button */}
                    <button 
                        className="md:hidden p-2 flex flex-col justify-center items-center w-10 h-10 gap-1.5 z-50 relative group outline-none" 
                        onClick={toggleMenu}
                        aria-label="Toggle Menu"
                    >
                        <span className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out ${isMenuOpen ? 'rotate-45 translate-y-2 bg-[#AE8638]' : ''}`} />
                        <span className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-0 translate-x-2' : ''}`} />
                        <span className={`block w-6 h-0.5 bg-white rounded-full transition-all duration-300 ease-in-out ${isMenuOpen ? '-rotate-45 -translate-y-2 bg-[#AE8638]' : ''}`} />
                    </button>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/events" className="text-sm font-bold text-gray-300 hover:text-[#AE8638] transition-colors uppercase tracking-widest">
                            Directory
                        </Link>
                        <Link href="/about" className="text-sm font-bold text-gray-300 hover:text-[#AE8638] transition-colors uppercase tracking-widest">
                            Company
                        </Link>

                        {status === 'loading' ? (
                            <div className="h-8 w-20 bg-white/5 animate-pulse rounded"></div>
                        ) : session ? (
                            <div className="flex items-center gap-4 border-l border-white/10 pl-8 ml-2">
                                <a href={getDashboardLink()}>
                                    <Button variant="ghost" size="sm" className="gap-2 text-white bg-transparent hover:text-black hover:bg-[#AE8638] rounded-full h-10 px-4 transition-colors">
                                        <Avatar className="h-6 w-6 rounded-full border border-white/20">
                                            <AvatarFallback className="text-xs bg-transparent text-current">
                                                {session.user.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden sm:inline font-bold tracking-wide uppercase text-xs">{session.user.name}</span>
                                    </Button>
                                </a>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="gap-2 text-gray-400 bg-transparent hover:text-red-400 hover:bg-red-500/10 rounded-full h-10 px-4 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline uppercase text-xs tracking-widest font-bold">Logout</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 border-l border-white/10 pl-8 ml-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="rounded-full text-gray-300 bg-transparent hover:text-white hover:bg-white/10 uppercase tracking-widest text-xs font-bold h-10 px-6">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm" className="rounded-full bg-[#AE8638] text-black hover:bg-[#F7EF8A] uppercase tracking-widest text-xs font-bold h-10 px-6 transition-colors shadow-[0_0_15px_rgba(174,134,56,0.2)]">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Sleek Overlay */}
            <div 
                className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-md transition-all duration-500 ease-in-out ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
                onClick={toggleMenu} 
            />
            <div 
                className={`md:hidden fixed top-0 right-0 h-full w-[85vw] max-w-sm z-50 bg-[#0A0A0A]/95 backdrop-blur-3xl border-l border-white/10 text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full pt-24 pb-10 px-8 overflow-y-auto">
                    <div className="flex flex-col space-y-6 flex-grow">
                        <Link href="/events" className="text-3xl font-black text-white hover:text-[#AE8638] transition-colors uppercase tracking-widest flex items-center justify-between group" onClick={toggleMenu}>
                            <span>Directory</span>
                            <ArrowRight className="w-6 h-6 text-[#AE8638] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </Link>
                        <div className="w-full h-px bg-gradient-to-r from-white/10 to-transparent" />
                        <Link href="/about" className="text-3xl font-black text-white hover:text-[#AE8638] transition-colors uppercase tracking-widest flex items-center justify-between group" onClick={toggleMenu}>
                            <span>Company</span>
                            <ArrowRight className="w-6 h-6 text-[#AE8638] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </Link>
                        <div className="w-full h-px bg-gradient-to-r from-white/10 to-transparent" />
                    </div>

                    <div className="pt-8">
                        {status === 'loading' ? (
                            <div className="h-14 w-full bg-white/5 animate-pulse rounded-xl"></div>
                        ) : session ? (
                            <div className="flex flex-col gap-4">
                                <div className="mb-4">
                                    <p className="text-[#AE8638] text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Signed in as</p>
                                    <div className="flex items-center gap-4 border border-white/10 rounded-2xl p-4 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-lg">
                                        <Avatar className="h-12 w-12 rounded-full border border-[#AE8638] shadow-[0_0_15px_rgba(174,134,56,0.3)]">
                                            <AvatarFallback className="bg-black text-[#AE8638] font-bold text-lg">
                                                {session.user.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-bold text-lg tracking-wide">{session.user.name}</div>
                                            <div className="text-[10px] text-[#AE8638] uppercase tracking-[0.1em]">{session.user.role}</div>
                                        </div>
                                    </div>
                                </div>
                                <a href={getDashboardLink()} onClick={toggleMenu}>
                                    <Button size="lg" className="w-full justify-center bg-[#AE8638] text-black hover:bg-[#F7EF8A] rounded-xl uppercase tracking-widest text-xs font-black h-14 shadow-[0_4px_20px_rgba(174,134,56,0.25)] transition-all active:scale-95">
                                        Go to Dashboard
                                    </Button>
                                </a>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => {
                                        signOut({ callbackUrl: '/' });
                                        toggleMenu();
                                    }}
                                    className="w-full justify-center gap-2 border-white/10 text-red-400 bg-black/40 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30 rounded-xl uppercase tracking-widest text-xs font-bold h-12 mt-2 transition-all active:scale-95"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <Link href="/login" onClick={toggleMenu} className="w-full">
                                    <Button variant="outline" size="lg" className="w-full rounded-xl border-white/20 text-white bg-black/40 backdrop-blur-md hover:bg-white/10 uppercase tracking-widest text-xs font-bold h-14 transition-all active:scale-95">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/register" onClick={toggleMenu} className="w-full">
                                    <Button size="lg" className="w-full rounded-xl bg-[#AE8638] text-black hover:bg-[#F7EF8A] uppercase tracking-widest text-xs font-black h-14 shadow-[0_4px_20px_rgba(174,134,56,0.25)] transition-all active:scale-95">
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
