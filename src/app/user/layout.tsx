
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, Ticket, Settings, LogOut, Menu, X, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/events', label: 'Browse Events', icon: Ticket },
    { href: '/user/settings', label: 'Settings', icon: Settings },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-black text-white">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-black border border-[#AE8638]/30 rounded-lg shadow-lg text-[#AE8638]"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-black border-r border-[#AE8638]/20 flex flex-col
          transform transition-transform duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.5)]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="p-4 md:p-6 border-b border-[#AE8638]/20 flex items-center gap-3">
                    <img src="https://res.cloudinary.com/dxgx75kwb/image/upload/v1756488747/logo_bplslj.png" alt="Logo" className="h-8 w-8 object-contain" />
                    <h1 className="text-sm md:text-base font-bold text-white leading-tight line-clamp-2">
                        WYLDCARD <span className="text-[#AE8638]">STATS</span>
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
                                className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 rounded-lg transition-all duration-200 text-sm md:text-base group ${isActive
                                    ? 'bg-[#AE8638] text-black font-bold shadow-[0_0_15px_rgba(174,134,56,0.3)]'
                                    : 'text-gray-400 hover:text-white hover:bg-[#AE8638]/10'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-black' : 'text-[#AE8638]'}`} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Logout */}
                <div className="p-3 md:p-4 border-t border-[#AE8638]/20 space-y-2 bg-gradient-to-t from-[#AE8638]/5 to-transparent">
                    {session?.user && (
                        <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 bg-[#AE8638]/5 border border-[#AE8638]/10 rounded-lg">
                            <Avatar className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0 border border-[#AE8638]/30">
                                <AvatarFallback className="text-xs bg-black text-[#AE8638] font-bold">
                                    {session.user.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{session.user.name}</p>
                                <p className="text-xs text-[#AE8638] truncate uppercase tracking-wider">{session.user.role}</p>
                            </div>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 md:gap-3 text-red-500 hover:text-red-400 hover:bg-red-950/20 text-sm md:text-base transition-colors"
                        onClick={() => signOut({ callbackUrl: '/' })}
                    >
                        <LogOut className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                        <span>Logout</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto w-full bg-black relative">
                {/* Decorative background glow for main content area to blend with dashboard */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(174,134,56,0.05),transparent_40%)]"></div>

                <div className="lg:hidden h-16" /> {/* Spacer for mobile menu button */}
                {children}
            </main>
        </div>
    );
}
