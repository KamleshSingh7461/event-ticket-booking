
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Ticket, IndianRupee, Plus, Eye, BarChart3, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function VenueManagerDashboard() {
    const [stats, setStats] = useState<any>({
        myEvents: 0,
        totalTicketsSold: 0,
        totalRevenue: 0,
        activeCoordinators: 0,
        eventStats: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch stats
            const statsRes = await fetch('/api/venue-manager/stats');
            const statsData = await statsRes.json();

            if (statsData.success) {
                setStats(statsData.data);
            } else {
                toast.error('Failed to load stats');
            }
        } catch (error) {
            console.error('Failed to fetch venue manager data:', error);
            toast.error('Network error loading dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-[#AE8638] animate-pulse">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Header */}
            <header className="bg-black border-b border-[#AE8638]/20 sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-white">
                        <span className="text-[#AE8638]">VM</span> Dashboard
                    </h1>
                    <div className="flex gap-4">
                        <Link href="/venue-manager/coordinators">
                            <Button variant="outline" className="border-[#AE8638]/50 text-[#AE8638] hover:bg-[#AE8638]/10">
                                <Users className="w-4 h-4 mr-2" /> Manage Team
                            </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={fetchData} className="text-gray-400 hover:text-white">
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 flex-1">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-black border border-[#AE8638]/30 shadow-[0_0_15px_rgba(174,134,56,0.1)]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-[#AE8638]">My Events</CardTitle>
                            <Calendar className="h-4 w-4 text-[#AE8638]/60" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.myEvents}</div>
                            <p className="text-xs text-gray-400">Events managed by you</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-black border border-[#AE8638]/30 shadow-[0_0_15px_rgba(174,134,56,0.1)]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-[#AE8638]">Tickets Sold</CardTitle>
                            <Ticket className="h-4 w-4 text-[#AE8638]/60" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.totalTicketsSold}</div>
                            <p className="text-xs text-gray-400">Across all active events</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-black border border-[#AE8638]/30 shadow-[0_0_15px_rgba(174,134,56,0.1)]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-[#AE8638]">Revenue</CardTitle>
                            <IndianRupee className="h-4 w-4 text-[#AE8638]/60" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-gray-400">Total earnings generated</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-black border border-[#AE8638]/30 shadow-[0_0_15px_rgba(174,134,56,0.1)]">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-[#AE8638]">Coordinators</CardTitle>
                            <Users className="h-4 w-4 text-[#AE8638]/60" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-white">{stats.activeCoordinators}</div>
                            <p className="text-xs text-gray-400">Active team members</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Event Sales Performance */}
                    <Card className="col-span-2 bg-black border border-[#AE8638]/30">
                        <CardHeader>
                            <CardTitle className="text-[#AE8638]">Event Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {stats.eventStats && stats.eventStats.length > 0 ? (
                                    stats.eventStats.map((event: any) => (
                                        <div key={event.id} className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <Link href={`/venue-manager/events/${event.id}`} className="font-bold text-white text-lg hover:text-[#AE8638] transition-colors cursor-pointer flex items-center gap-2">
                                                        {event.title}
                                                        <span className="text-[10px] bg-[#AE8638]/20 px-2 py-0.5 rounded text-[#AE8638] font-normal border border-[#AE8638]/30">Details</span>
                                                    </Link>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(event.startDate).toLocaleDateString()} |
                                                        Cap: <span className="text-white">{event.capacity}</span>
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-[#AE8638]">{event.sold}</p>
                                                    <p className="text-xs text-gray-500">Tickets Sold</p>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="h-3 w-full bg-[#AE8638]/10 rounded-full overflow-hidden border border-[#AE8638]/20">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#AE8638] to-yellow-500 transition-all duration-1000"
                                                    style={{ width: `${event.percentage}%` }}
                                                />
                                            </div>

                                            <div className="flex justify-between text-xs pt-1">
                                                <div className="flex gap-4">
                                                    <span className="text-green-400">Peak Load: {event.percentage.toFixed(1)}%</span>
                                                    <span className="text-gray-400">Peak Day: <span className="text-white">{event.peakDay?.date ? new Date(event.peakDay.date).toLocaleDateString() : 'N/A'}</span></span>
                                                </div>
                                                <div className="flex gap-4 text-gray-500">
                                                    <span>Rev: ₹{event.revenue.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {/* Daily Breakdown Mini-Bar */}
                                            {event.dailyStats && (
                                                <div className="flex gap-1 pt-2 overflow-x-auto pb-2 scrollbar-hide">
                                                    {Object.entries(event.dailyStats).map(([date, count]: any) => {
                                                        const pct = (count / event.capacity) * 100;
                                                        const isHigh = pct > 80;
                                                        return (
                                                            <div key={date} className="flex flex-col items-center min-w-[50px] group relative">
                                                                <div className="h-10 w-2 bg-[#AE8638]/10 rounded-full relative">
                                                                    <div
                                                                        className={`absolute bottom-0 w-full rounded-full transition-all ${isHigh ? 'bg-red-500' : 'bg-[#AE8638]'}`}
                                                                        style={{ height: `${Math.min(pct, 100)}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] text-gray-400 mt-1 opacity-60 group-hover:opacity-100">{new Date(date).getDate()}</span>
                                                                {/* Tooltip */}
                                                                <div className="absolute bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-[10px] p-1 rounded whitespace-nowrap z-10">
                                                                    {new Date(date).toLocaleDateString()}: {count}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-8">No events found. Contact Admin to assign events.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="col-span-1 bg-black border border-[#AE8638]/30 h-fit">
                        <CardHeader>
                            <CardTitle className="text-[#AE8638]">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4">
                            <Link href="/venue-manager/coordinators" className="p-4 border rounded hover:bg-[#AE8638]/10 cursor-pointer transition text-center bg-[#AE8638]/5 border-[#AE8638]/20 text-white font-medium">
                                Manage Coordinators
                            </Link>
                            <Link href="/venue-manager/reports" className="p-4 border rounded hover:bg-[#AE8638]/10 cursor-pointer transition text-center bg-[#AE8638]/5 border-[#AE8638]/20 text-white font-medium">
                                Download Reports
                            </Link>
                            <Link href="/verify" className="p-4 border rounded hover:bg-[#AE8638]/10 cursor-pointer transition text-center bg-[#AE8638]/5 border-[#AE8638]/20 text-white font-medium">
                                Open Ticket Scanner
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
