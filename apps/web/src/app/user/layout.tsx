
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
        <div className="flex h-screen bg-white text-black">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-none shadow-sm text-black hover:bg-gray-50 transition-colors"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-gray-200 flex flex-col
          transform transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                <div className="p-4 md:p-6 border-b border-gray-200 flex items-center gap-3 bg-black">
                    <img src="https://res.cloudinary.com/desdbjzzt/image/upload/v1777203252/logo_yswfeg.png" alt="Logo" className="h-8 w-8 object-contain filter invert" />
                    <h1 className="text-sm md:text-base font-bold text-white tracking-widest leading-tight line-clamp-2">
                        WYLDCARD <span className="text-gray-300 font-light">STATS</span>
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
                                className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 rounded-none transition-all duration-200 text-sm font-semibold group border-l-2 ${isActive
                                    ? 'bg-gray-100 text-black border-black shadow-sm'
                                    : 'text-gray-500 hover:text-black hover:bg-gray-50 border-transparent'
                                    }`}
                            >
                                <Icon className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 transition-transform ${isActive ? 'text-black' : 'text-gray-400 group-hover:text-black'}`} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Logout */}
                <div className="p-3 md:p-4 border-t border-gray-200 space-y-2 bg-gray-50">
                    {session?.user && (
                        <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-none">
                            <Avatar className="h-8 w-8 md:h-9 md:w-9 flex-shrink-0 border border-gray-300 rounded-none">
                                <AvatarFallback className="text-xs bg-black text-white font-bold rounded-none">
                                    {session.user.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-black truncate">{session.user.name}</p>
                                <p className="text-xs text-gray-500 truncate uppercase tracking-wider">{session.user.role}</p>
                            </div>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 md:gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm md:text-base transition-colors rounded-none font-semibold"
                        onClick={() => signOut({ callbackUrl: '/' })}
                    >
                        <LogOut className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                        <span>Logout</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto w-full bg-white relative">
                <div className="lg:hidden h-16" /> {/* Spacer for mobile menu button */}
                {children}
            </main>
        </div>
    );
}
