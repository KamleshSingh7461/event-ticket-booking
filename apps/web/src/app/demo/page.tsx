'use client';

import { 
    BarChart3, 
    Users, 
    CreditCard, 
    Activity, 
    ArrowLeft,
    TrendingUp,
    CalendarDays,
    MapPin,
    ArrowUpRight,
    ArrowDownRight,
    Clock
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DemoDashboard() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#AE8638] selection:text-black flex flex-col font-sans">
            {/* Demo Banner */}
            <div className="bg-[#AE8638] text-black text-xs font-bold uppercase tracking-widest py-2 text-center flex items-center justify-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                </span>
                Interactive Demo Mode
            </div>

            {/* Header */}
            <header className="border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-widest">Back to Site</span>
                        </Link>
                        <div className="h-6 w-px bg-white/10" />
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Tech Summit 2026</h1>
                            <p className="text-xs text-[#AE8638] uppercase tracking-widest font-bold">Venue Manager Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                            <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                            <span className="text-sm font-medium">Live Sync Active</span>
                        </div>
                        <Button variant="outline" className="border-white/20 text-white bg-transparent hover:bg-white/10 rounded-full">
                            Export Report
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-6 py-8">
                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#AE8638]/50 transition-colors">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:text-[#AE8638] transition-all">
                            <CreditCard className="w-16 h-16" />
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Total Revenue</p>
                        <h3 className="text-4xl font-bold text-white mb-2">₹84,50,000</h3>
                        <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>+14.5% from last week</span>
                        </div>
                    </div>

                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#AE8638]/50 transition-colors">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:text-[#AE8638] transition-all">
                            <Users className="w-16 h-16" />
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Tickets Sold</p>
                        <h3 className="text-4xl font-bold text-white mb-2">1,245</h3>
                        <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>82% Capacity Reached</span>
                        </div>
                    </div>

                    <div className="bg-[#111] border border-[#AE8638]/30 rounded-2xl p-6 relative overflow-hidden group shadow-[0_0_30px_rgba(174,134,56,0.1)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#AE8638]/10 to-transparent pointer-events-none" />
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:text-[#AE8638] transition-all">
                            <Activity className="w-16 h-16" />
                        </div>
                        <p className="text-[#AE8638] font-bold uppercase tracking-widest text-xs mb-2">Live Attendance</p>
                        <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#AE8638] to-[#F7EF8A] mb-2">892</h3>
                        <div className="flex items-center gap-2 text-white text-sm font-medium">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>Updated just now</span>
                        </div>
                    </div>

                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-[#AE8638]/50 transition-colors">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:text-[#AE8638] transition-all">
                            <TrendingUp className="w-16 h-16" />
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Check-in Rate</p>
                        <h3 className="text-4xl font-bold text-white mb-2">71.6%</h3>
                        <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                            <ArrowDownRight className="w-4 h-4" />
                            <span>Slight dip in last hour</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Main Chart Mock */}
                    <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white">Admissions Over Time</h3>
                                <p className="text-gray-400 text-sm">Real-time scan data from all gates</p>
                            </div>
                            <select className="bg-black border border-white/20 text-white rounded-lg px-4 py-2 text-sm outline-none focus:border-[#AE8638]">
                                <option>Today</option>
                                <option>Yesterday</option>
                                <option>All Time</option>
                            </select>
                        </div>
                        <div className="h-[300px] flex items-end justify-between gap-2 md:gap-4 px-2">
                            {/* Generating abstract bars for the chart */}
                            {[10, 25, 15, 40, 55, 80, 65, 45, 90, 75, 60, 85, 100, 95, 70, 50].map((height, i) => (
                                <div key={i} className="w-full bg-white/5 rounded-t-sm relative group hover:bg-white/10 transition-colors" style={{ height: '100%' }}>
                                    <div 
                                        className="absolute bottom-0 w-full bg-gradient-to-t from-[#AE8638] to-[#F7EF8A] rounded-t-sm transition-all duration-500 shadow-[0_0_15px_rgba(174,134,56,0.3)]" 
                                        style={{ height: `${height}%` }}
                                    />
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/20 px-3 py-1 rounded text-xs font-bold whitespace-nowrap z-10 transition-opacity">
                                        {height * 3} Scans
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <span>08:00 AM</span>
                            <span>12:00 PM</span>
                            <span>04:00 PM</span>
                            <span>Now</span>
                        </div>
                    </div>

                    {/* Side Info */}
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                            {[
                                { user: "Sarah Jenkins", action: "Checked in", gate: "Main Entrance", time: "2 min ago", type: "success" },
                                { user: "Michael Chen", action: "Purchased VIP", amount: "₹24,999.00", time: "5 min ago", type: "info" },
                                { user: "Invalid Code", action: "Access Denied", gate: "North Gate", time: "12 min ago", type: "error" },
                                { user: "Emma Wilson", action: "Checked in", gate: "Main Entrance", time: "15 min ago", type: "success" },
                                { user: "David Miller", action: "Checked in", gate: "VIP Entrance", time: "18 min ago", type: "success" },
                                { user: "James Davis", action: "Purchased Standard", amount: "₹4,999.00", time: "22 min ago", type: "info" },
                                { user: "Olivia Taylor", action: "Checked in", gate: "South Gate", time: "25 min ago", type: "success" },
                            ].map((activity, i) => (
                                <div key={i} className="flex items-start gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors">
                                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                                        activity.type === 'success' ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' :
                                        activity.type === 'error' ? 'bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]' :
                                        'bg-[#AE8638] shadow-[0_0_10px_rgba(174,134,56,0.5)]'
                                    }`} />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold text-sm text-white">{activity.user}</p>
                                            <span className="text-xs text-gray-500">{activity.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {activity.action} {activity.gate ? `at ${activity.gate}` : `- ${activity.amount}`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
