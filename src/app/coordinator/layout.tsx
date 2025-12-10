'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, Scan, History, User, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
    { href: '/coordinator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/verify', label: 'Scan Tickets', icon: Scan },
    { href: '/coordinator/history', label: 'History', icon: History },
    { href: '/coordinator/profile', label: 'Profile', icon: User },
];

export default function CoordinatorLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-950">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 rounded-lg text-white"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-slate-900 border-r border-slate-800 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="p-4 md:p-6 border-b border-slate-800 flex items-center gap-3">
                    <img src="https://res.cloudinary.com/dxgx75kwb/image/upload/v1756488747/logo_bplslj.png" alt="Logo" className="h-8 w-8 object-contain" />
                    <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        FGSN Coordinator
                    </h1>
                </div>

                <nav className="flex-1 p-3 md:p-4 space-y-1 md:space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${isActive
                                    ? 'bg-primary text-white'
                                    : 'text-slate-300 hover:bg-slate-800'
                                    }`}
                            >
                                <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Logout */}
                <div className="p-3 md:p-4 border-t border-slate-800 space-y-2">
                    {session?.user && (
                        <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 bg-slate-800 rounded-lg">
                            <Avatar className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0">
                                <AvatarFallback className="text-xs bg-primary text-white">
                                    {session.user.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm font-medium text-white truncate">{session.user.name}</p>
                                <p className="text-xs text-slate-400 truncate">{session.user.role}</p>
                            </div>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 md:gap-3 text-red-400 hover:text-red-300 hover:bg-red-950/50 text-sm md:text-base"
                        onClick={() => signOut({ callbackUrl: '/' })}
                    >
                        <LogOut className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                        <span>Logout</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-slate-950 w-full">
                <div className="lg:hidden h-16" /> {/* Spacer for mobile menu button */}
                {children}
            </main>
        </div>
    );
}
