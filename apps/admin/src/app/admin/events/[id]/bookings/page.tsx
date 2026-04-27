'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function EventBookingsPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<any[]>([]);
    const [event, setEvent] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (params.id) {
            fetchData();
        }
    }, [params.id]);

    const fetchData = async () => {
        try {
            // Fetch Event Details
            const eventRes = await fetch(`/api/events/${params.id}`);
            const eventData = await eventRes.json();
            if (eventData.success) {
                setEvent(eventData.data);
            }

            // Fetch Tickets (We might need a new API endpoint or use query params on existing)
            // For now, let's assume we can fetch via a dedicated route or filter existing ticket route
            // Since we don't have a specific "get tickets by event" admin API exposed directly without auth checks,
            // we will create/use '/api/admin/events/[id]/tickets' or similar. 
            // For this iteration, let's try to query the tickets securely.
            // Actually, we usually fetch this server-side or via a specific admin API.
            // Let's implement client-side fetch assuming we make the API available.

            const res = await fetch(`/api/admin/events/${params.id}/tickets`);
            const data = await res.json();

            if (data.success) {
                setTickets(data.data);
                setStats(data.stats);
            } else {
                toast.error(data.error || 'Failed to fetch tickets');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = tickets.filter(ticket =>
        ticket.buyerDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.buyerDetails.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.bookingReference.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-black p-6 space-y-6 text-white text-sm">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-[#AE8638] hover:bg-[#AE8638]/10 hover:text-[#AE8638]">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-[#AE8638]">{event?.title || 'Event'} Bookings</h1>
                        <p className="text-gray-400 text-xs">Manage and view all tickets sold for this event.</p>
                    </div>
                </div>
                {/* <Button variant="outline" className="border-[#AE8638] text-[#AE8638] hover:bg-[#AE8638] hover:text-black">
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                </Button> */}
            </div>

            {/* Stats Overview */}
            {event && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Revenue & Total Sold */}
                    <Card className="bg-black border border-[#AE8638]/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[#AE8638] text-sm font-medium">Performance Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h3 className="text-3xl font-bold text-white">₹{stats?.totalRevenue?.toLocaleString()}</h3>
                                    <p className="text-xs text-gray-400">Total Revenue</p>
                                </div>
                                <div className="text-right">
                                    <h3 className="text-2xl font-bold text-white">{stats?.totalSold}</h3>
                                    <p className="text-xs text-gray-400">Tickets Sold</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Peak Load: {stats?.percentage?.toFixed(1)}%</span>
                                    <span className="text-gray-400">Capacity: {stats?.capacity}/day</span>
                                </div>
                                <div className="h-2 w-full bg-[#AE8638]/10 rounded-full overflow-hidden border border-[#AE8638]/20">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#AE8638] to-yellow-500 transition-all duration-1000"
                                        style={{ width: `${stats?.percentage}%` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Daily Breakdown */}
                    <Card className="col-span-2 bg-black border border-[#AE8638]/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[#AE8638] text-sm font-medium">Daily Ticket Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-2 h-[120px] pt-4 overflow-x-auto">
                                {stats && Object.entries(stats.dailyBreakdown || {}).map(([date, count]: any) => {
                                    const pct = (count / stats.capacity) * 100;
                                    const isHigh = pct > 80;
                                    return (
                                        <div key={date} className="flex flex-col items-center justify-end h-full min-w-[60px] group">
                                            <div className="relative w-full flex flex-col items-center justify-end h-full">
                                                <span className="text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4">{count}</span>
                                                <div className="h-full w-4 bg-[#AE8638]/10 rounded-full relative">
                                                    <div
                                                        className={`absolute bottom-0 w-full rounded-full transition-all duration-500 ${isHigh ? 'bg-red-500' : 'bg-[#AE8638]'}`}
                                                        style={{ height: `${Math.min(pct, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 mt-2 whitespace-nowrap">{date.split(' ')[1]} {date.split(' ')[2]}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card className="bg-black border border-[#AE8638]/30">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search by Name, Email, or Booking Ref..."
                            className="pl-10 bg-black border-[#AE8638]/30 text-white placeholder:text-gray-600 focus-visible:ring-[#AE8638]/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Tickets Table */}
            <Card className="bg-black border border-[#AE8638]/30 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#AE8638]/10 border-b border-[#AE8638]/20">
                            <tr>
                                <th className="p-4 font-medium text-[#AE8638]">Ref ID</th>
                                <th className="p-4 font-medium text-[#AE8638]">Customer</th>
                                <th className="p-4 font-medium text-[#AE8638]">Ticket Type</th>
                                <th className="p-4 font-medium text-[#AE8638]">Dates</th>
                                <th className="p-4 font-medium text-[#AE8638]">Paid</th>
                                <th className="p-4 font-medium text-[#AE8638]">Status</th>
                                <th className="p-4 font-medium text-[#AE8638]">Check-Ins</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#AE8638]/10">
                            {filteredTickets.map((ticket) => {
                                const isAllDay = ticket.selectedDates.length > 1; // Simplified inference or use explicit type if available
                                return (
                                    <tr key={ticket._id} className="hover:bg-[#AE8638]/5 transition-colors">
                                        <td className="p-4 font-mono text-gray-400">{ticket.bookingReference}</td>
                                        <td className="p-4">
                                            <div className="font-medium text-white">{ticket.buyerDetails.name}</div>
                                            <div className="text-xs text-gray-500">{ticket.buyerDetails.email}</div>
                                            <div className="text-xs text-gray-500">{ticket.buyerDetails.contact}</div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="outline" className={`border-${isAllDay ? 'purple' : 'blue'}-500/50 text-${isAllDay ? 'purple' : 'blue'}-400`}>
                                                {isAllDay ? 'SEASON PASS' : 'DAILY PASS'}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-xs text-gray-400 max-w-[200px]">
                                            <div className="flex flex-wrap gap-1">
                                                {ticket.selectedDates.map((d: string) => (
                                                    <span key={d} className="bg-white/5 px-1 rounded">{new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 text-white">₹{ticket.amountPaid}</td>
                                        <td className="p-4">
                                            <Badge className={ticket.paymentStatus === 'SUCCESS' ? 'bg-green-900/50 text-green-400 hover:bg-green-900/60' : 'bg-red-900/50 text-red-400'}>
                                                {ticket.paymentStatus}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-gray-400">
                                            {ticket.checkIns?.length || 0} / {ticket.selectedDates.length}
                                        </td>
                                    </tr>
                                )
                            })}
                            {filteredTickets.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">
                                        No tickets found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
