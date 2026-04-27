'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scan, CheckCircle, Calendar, Users } from 'lucide-react';

export default function CoordinatorDashboard() {
    const [stats, setStats] = useState({
        assignedEvents: 0,
        ticketsVerified: 0,
        todayScans: 0,
        pendingVerifications: 0
    });
    const [assignedEvents, setAssignedEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch stats
            const statsRes = await fetch('/api/coordinator/stats');
            const statsData = await statsRes.json();

            if (statsData.success) {
                setStats({
                    assignedEvents: statsData.data.assignedEvents,
                    ticketsVerified: statsData.data.totalVerifications,
                    todayScans: statsData.data.ticketsVerifiedToday,
                    pendingVerifications: statsData.data.pendingVerifications
                });
            }

            // Fetch assigned events
            const eventsRes = await fetch('/api/coordinator/assigned-events');
            const eventsData = await eventsRes.json();

            if (eventsData.success) {
                setAssignedEvents(eventsData.data);
            }
        } catch (error) {
            console.error('Failed to fetch coordinator data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-black min-h-screen">
            {/* Header */}
            <div className="mb-6 md:mb-8 border-b border-[#AE8638]/20 pb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Dashboard</h1>
                <p className="text-sm md:text-base text-[#AE8638]">Verify tickets and manage event access</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
                <Card className="bg-black border border-[#AE8638]/30 shadow-[0_0_15px_rgba(174,134,56,0.1)]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-4 lg:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium text-[#AE8638]/80">Assigned Events</CardTitle>
                        <Calendar className="h-3 w-3 md:h-4 md:w-4 text-[#AE8638]" />
                    </CardHeader>
                    <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
                        <div className="text-xl md:text-2xl font-bold text-white">{stats.assignedEvents}</div>
                        <p className="text-xs text-gray-400">Events you're managing</p>
                    </CardContent>
                </Card>

                <Card className="bg-black border border-[#AE8638]/30 shadow-[0_0_15px_rgba(174,134,56,0.1)]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-4 lg:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium text-[#AE8638]/80">Total Verified</CardTitle>
                        <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-[#AE8638]" />
                    </CardHeader>
                    <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
                        <div className="text-xl md:text-2xl font-bold text-white">{stats.ticketsVerified}</div>
                        <p className="text-xs text-gray-400">All-time scans</p>
                    </CardContent>
                </Card>

                <Card className="bg-black border border-[#AE8638]/30 shadow-[0_0_15px_rgba(174,134,56,0.1)]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-4 lg:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium text-[#AE8638]/80">Today's Scans</CardTitle>
                        <Scan className="h-3 w-3 md:h-4 md:w-4 text-[#AE8638]" />
                    </CardHeader>
                    <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
                        <div className="text-xl md:text-2xl font-bold text-white">{stats.todayScans}</div>
                        <p className="text-xs text-gray-400">Verified today</p>
                    </CardContent>
                </Card>

                <Card className="bg-black border border-[#AE8638]/30 shadow-[0_0_15px_rgba(174,134,56,0.1)]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-4 lg:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium text-[#AE8638]/80">Pending</CardTitle>
                        <Users className="h-3 w-3 md:h-4 md:w-4 text-[#AE8638]" />
                    </CardHeader>
                    <CardContent className="p-3 md:p-4 lg:p-6 pt-0">
                        <div className="text-xl md:text-2xl font-bold text-white">{stats.pendingVerifications}</div>
                        <p className="text-xs text-gray-400">Awaiting entry</p>
                    </CardContent>
                </Card>
            </div>

            {/* Assigned Events */}
            <Card className="bg-black border border-[#AE8638]/30 mb-6 md:mb-8">
                <CardHeader className="p-4 md:p-6 border-b border-[#AE8638]/10">
                    <CardTitle className="text-base md:text-lg text-[#AE8638]">My Assigned Events</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-6">
                    <div className="space-y-3 md:space-y-4">
                        {assignedEvents.map((event) => (
                            <div key={event._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 bg-[#AE8638]/5 rounded-lg border border-[#AE8638]/20 hover:border-[#AE8638]/50 transition duration-300">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm md:text-base text-white truncate">{event.title}</h3>
                                    <p className="text-xs md:text-sm text-gray-400 truncate">
                                        {new Date(event.date).toLocaleDateString()} • {event.venue}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                    <Badge variant="outline" className="text-xs border-[#AE8638] text-[#AE8638]">
                                        {event.status}
                                    </Badge>
                                    <Link href={`/coordinator/events/${event._id}`} className="flex-1 sm:flex-none">
                                        <Button size="sm" variant="outline" className="w-full sm:w-auto border-[#AE8638] text-[#AE8638] hover:bg-[#AE8638] hover:text-black text-xs md:text-sm">
                                            View Details
                                        </Button>
                                    </Link>
                                    <Link href={`/verify?event=${event._id}`} className="flex-1 sm:flex-none">
                                        <Button size="sm" className="w-full sm:w-auto bg-[#AE8638] text-black hover:bg-[#AE8638]/90 font-bold text-xs md:text-sm">
                                            <Scan className="w-3 h-3 md:w-4 md:h-4 mr-1" /> Verify
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <Card className="bg-black border border-[#AE8638] hover:shadow-[0_0_20px_rgba(174,134,56,0.2)] transition cursor-pointer group">
                    <CardHeader className="p-4 md:p-6">
                        <CardTitle className="text-base md:text-lg text-white flex items-center gap-2 group-hover:text-[#AE8638] transition">
                            <Scan className="w-4 h-4 md:w-5 md:h-5 text-[#AE8638]" />
                            Quick Scan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                        <p className="text-xs md:text-sm text-gray-400 mb-3 md:mb-4">
                            Open the QR scanner to verify tickets instantly
                        </p>
                        <Link href="/verify">
                            <Button className="w-full bg-[#AE8638] hover:bg-[#AE8638]/90 text-black font-bold text-sm md:text-base">Start Scanning</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="bg-black border border-[#AE8638]/30 hover:border-[#AE8638] transition cursor-pointer group">
                    <CardHeader className="p-4 md:p-6">
                        <CardTitle className="text-base md:text-lg text-white flex items-center gap-2 group-hover:text-[#AE8638] transition">
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-[#AE8638]" />
                            Verification History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                        <p className="text-xs md:text-sm text-gray-400 mb-3 md:mb-4">
                            View all tickets you've verified
                        </p>
                        <Link href="/coordinator/history">
                            <Button variant="outline" className="w-full border-[#AE8638] text-[#AE8638] hover:bg-[#AE8638] hover:text-black text-sm md:text-base">
                                View History
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
