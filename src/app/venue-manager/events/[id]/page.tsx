
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/link'; // Correction: next/navigation used below
import { useRouter as useNextRouter, useParams as useNextParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Search, Calendar, MapPin, Edit, RefreshCw, Smartphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function VenueManagerEventDetailPage() {
    const params = useNextParams();
    const router = useNextRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (params.id) {
            fetchData();
        }
    }, [params.id]);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/venue-manager/events/${params.id}`);
            const result = await res.json();

            if (result.success) {
                setData(result.data);
            } else {
                toast.error(result.error || 'Failed to load event data');
                router.push('/venue-manager/events');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-[#AE8638] animate-pulse">Loading Details...</p>
            </div>
        );
    }

    if (!data) return null;

    const { event, tickets, stats } = data;

    const filteredTickets = tickets.filter((ticket: any) =>
        ticket.buyerDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.buyerDetails.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.bookingReference.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Header */}
            <header className="bg-black border-b border-[#AE8638]/20 sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="text-[#AE8638] hover:bg-[#AE8638]/10 hover:text-[#AE8638]"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-xl font-bold text-white">
                            {event.title} <span className="text-gray-500 font-normal text-sm ml-2">Event Dashboard</span>
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={fetchData} variant="outline" size="icon" className="border-[#AE8638]/30 text-[#AE8638] hover:bg-[#AE8638]/10"><RefreshCw className="w-4 h-4" /></Button>
                        <Button onClick={() => router.push('/verify')} className="bg-[#AE8638] hover:bg-[#AE8638]/90 text-black font-bold">
                            <Smartphone className="w-4 h-4 mr-2" /> Verify Tickets
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Revenue & Total Sold */}
                    <Card className="bg-black border border-[#AE8638]/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[#AE8638] text-sm font-medium">Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h3 className="text-3xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</h3>
                                    <p className="text-xs text-gray-400">Total Revenue</p>
                                </div>
                                <div className="text-right">
                                    <h3 className="text-2xl font-bold text-white">{stats.totalSold}</h3>
                                    <p className="text-xs text-gray-400">Tickets Sold</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400">Peak Load: {stats.percentage.toFixed(1)}%</span>
                                    <span className="text-gray-400">Cap: {stats.capacity}/day</span>
                                </div>
                                <div className="h-2 w-full bg-[#AE8638]/10 rounded-full overflow-hidden border border-[#AE8638]/20">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#AE8638] to-yellow-500 transition-all duration-1000"
                                        style={{ width: `${stats.percentage}%` }}
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
                            <div className="flex items-end gap-2 h-[120px] pt-4 overflow-x-auto scrollbar-hide">
                                {Object.entries(stats.dailyBreakdown).map(([date, count]: any) => {
                                    const pct = (count / stats.capacity) * 100;
                                    const isHigh = pct > 80;
                                    return (
                                        <div key={date} className="flex flex-col items-center justify-end h-full min-w-[60px] group relative">
                                            <div className="relative w-full flex flex-col items-center justify-end h-full">
                                                <span className="text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4">{count}</span>
                                                <div className="h-full w-4 bg-[#AE8638]/10 rounded-full relative">
                                                    <div
                                                        className={`absolute bottom-0 w-full rounded-full transition-all duration-500 ${isHigh ? 'bg-red-500' : 'bg-[#AE8638]'}`}
                                                        style={{ height: `${Math.min(pct, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 mt-2 whitespace-nowrap">{new Date(date).getDate()} {new Date(date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ticket List */}
                    <div className="col-span-2 space-y-6">
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

                        {/* Table */}
                        <Card className="bg-black border border-[#AE8638]/30 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#AE8638]/10 border-b border-[#AE8638]/20">
                                        <tr>
                                            <th className="p-4 font-medium text-[#AE8638] whitespace-nowrap">Ref ID</th>
                                            <th className="p-4 font-medium text-[#AE8638]">Customer</th>
                                            <th className="p-4 font-medium text-[#AE8638]">Type</th>
                                            <th className="p-4 font-medium text-[#AE8638]">Status</th>
                                            <th className="p-4 font-medium text-[#AE8638] text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#AE8638]/10 text-sm">
                                        {filteredTickets.map((ticket: any) => {
                                            const isAllDay = ticket.selectedDates.length > 1;
                                            return (
                                                <tr key={ticket._id} className="hover:bg-[#AE8638]/5 transition-colors">
                                                    <td className="p-4 font-mono text-gray-400 align-top">{ticket.bookingReference}</td>
                                                    <td className="p-4 align-top">
                                                        <div className="font-medium text-white">{ticket.buyerDetails.name}</div>
                                                        <div className="text-xs text-gray-500">{ticket.buyerDetails.contact}</div>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {ticket.selectedDates.slice(0, 3).map((d: string) => (
                                                                <span key={d} className="bg-white/5 px-1 rounded text-[10px] text-gray-400">{new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                                            ))}
                                                            {ticket.selectedDates.length > 3 && <span className="text-[10px] text-gray-500">+{ticket.selectedDates.length - 3} more</span>}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-top">
                                                        <Badge variant="outline" className={`text-[10px] border-${isAllDay ? 'purple' : 'blue'}-500/50 text-${isAllDay ? 'purple' : 'blue'}-400`}>
                                                            {isAllDay ? 'SEASON' : 'DAILY'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 align-top">
                                                        <Badge className={`text-[10px] ${ticket.paymentStatus === 'SUCCESS' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                                            {ticket.paymentStatus}
                                                        </Badge>
                                                        <div className="text-[10px] text-gray-500 mt-1">
                                                            Check-in: {ticket.checkIns?.length || 0}/{ticket.selectedDates.length}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right text-white font-mono align-top">₹{ticket.amountPaid}</td>
                                                </tr>
                                            );
                                        })}
                                        {filteredTickets.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                                    No bookings found matching your search.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <Card className="bg-black border border-[#AE8638]/30">
                            <CardHeader>
                                <CardTitle className="text-[#AE8638] text-sm">Event Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500">Dates</p>
                                    <div className="flex items-center gap-2 text-white">
                                        <Calendar className="w-3 h-3 text-[#AE8638]" />
                                        <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                {event.venue && (
                                    <div>
                                        <p className="text-xs text-gray-500">Venue</p>
                                        <div className="flex items-center gap-2 text-white">
                                            <MapPin className="w-3 h-3 text-[#AE8638]" />
                                            <span>{event.venue}</span>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-gray-500">Ticket Price</p>
                                    <p className="text-white font-bold">₹{event.ticketConfig.price}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {event.ticketConfig.offers && event.ticketConfig.offers.length > 0 && (
                            <Card className="bg-black border border-[#AE8638]/30">
                                <CardHeader>
                                    <CardTitle className="text-[#AE8638] text-sm">Active Offers</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {event.ticketConfig.offers.map((offer: any, idx: number) => (
                                        <div key={idx} className="p-2 bg-[#AE8638]/5 border border-[#AE8638]/20 rounded">
                                            <p className="font-bold text-[#AE8638] text-xs">{offer.code}</p>
                                            <p className="text-xs text-gray-400">{offer.discountPercentage}% off - {offer.description}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
