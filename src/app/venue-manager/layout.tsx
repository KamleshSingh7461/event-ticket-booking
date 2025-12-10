'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, Calendar, Users, BarChart3, Settings, LogOut, Menu, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
    { href: '/venue-manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/venue-manager/events', label: 'My Events', icon: Calendar },
    { href: '/venue-manager/coordinators', label: 'Coordinators', icon: Users },
    { href: '/venue-manager/reports', label: 'Reports', icon: BarChart3 },
    { href: '/verify', label: 'Ticket Scanner', icon: Smartphone },
];

export default function VenueManagerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-black text-white">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#AE8638] text-black rounded-lg shadow-lg hover:bg-[#AE8638]/90"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/80 z-30 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-black border-r border-[#AE8638]/20 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="p-4 md:p-6 border-b border-[#AE8638]/20 flex items-center gap-3">
                    <img src="https://res.cloudinary.com/dxgx75kwb/image/upload/v1756488747/logo_bplslj.png" alt="Logo" className="h-8 w-8 object-contain" />
                    <h1 className="text-sm md:text-base font-bold text-[#AE8638] leading-tight line-clamp-2">
                        VENUE MANAGER
                    </h1>
                </div>

                <nav className="flex-1 p-3 md:p-4 space-y-1 md:space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 rounded-lg transition-all text-sm md:text-base group relative overflow-hidden ${isActive
                                    ? 'bg-[#AE8638] text-black font-semibold'
                                    : 'text-gray-400 hover:text-[#AE8638] hover:bg-[#AE8638]/10'
                                    }`}
                            >
                                <div className={`absolute left-0 top-0 h-full w-1 ${isActive ? 'bg-black/20' : 'bg-transparent transition-colors group-hover:bg-[#AE8638]'} `}></div>
                                <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Logout */}
                <div className="p-3 md:p-4 border-t border-[#AE8638]/20 space-y-2 bg-gradient-to-t from-[#AE8638]/10 to-transparent">
                    {session?.user && (
                        <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 border border-[#AE8638]/10 rounded-lg bg-black/40">
                            <Avatar className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0 border border-[#AE8638]/30">
                                <AvatarFallback className="text-xs bg-[#AE8638] text-black font-bold">
                                    {session.user.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm font-medium truncate text-[#AE8638]">{session.user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{session.user.role}</p>
                            </div>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 md:gap-3 text-red-500 hover:text-red-400 hover:bg-red-950/30 text-sm md:text-base transition-colors"
                        onClick={() => signOut({ callbackUrl: '/' })}
                    >
                        <LogOut className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                        <span>Logout</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto w-full relative">
                <div className="lg:hidden h-16 bg-black border-b border-[#AE8638]/20 flex items-center justify-center">
                    <span className="text-[#AE8638] font-bold">VENUE MANAGER</span>
                </div>
                {children}
            </main>
        </div>
    );
}
