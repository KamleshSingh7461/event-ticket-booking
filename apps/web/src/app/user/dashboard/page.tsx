
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Ticket, Calendar, Download, QrCode, Search, Loader2, TrendingUp, ExternalLink, MapPin, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function UserDashboard() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalBookings: 0,
        upcomingEvents: 0,
        totalSpent: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = bookings.filter(booking =>
                booking.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.buyerDetails.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredBookings(filtered);
        } else {
            setFilteredBookings(bookings);
        }
    }, [searchTerm, bookings]);

    const fetchData = async () => {
        try {
            const [statsRes, bookingsRes] = await Promise.all([
                fetch('/api/user/stats'),
                fetch('/api/user/bookings')
            ]);

            const statsData = await statsRes.json();
            const bookingsData = await bookingsRes.json();

            if (statsData.success) setStats(statsData.data);
            if (bookingsData.success) {
                setBookings(bookingsData.data);
                setFilteredBookings(bookingsData.data);
            }
        } catch (err) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-black" />
                <p className="text-black font-semibold tracking-widest uppercase text-sm">Loading Data...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 text-black font-sans selection:bg-black selection:text-white">
            <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-200 pb-8">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold text-black tracking-tight mb-2">
                            Overview
                        </h1>
                        <p className="text-gray-500 text-lg">Manage your registrations and passes.</p>
                    </div>
                    <Link href="/events">
                        <Button className="bg-black hover:bg-gray-800 text-white font-bold px-8 py-6 text-md shadow-sm transition-all rounded-none">
                            Browse Events
                        </Button>
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white border border-gray-200 hover:border-black transition-all duration-300 group overflow-hidden rounded-none shadow-sm">
                        <CardContent className="p-8 relative">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Ticket className="w-24 h-24 text-black" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-gray-500 font-bold tracking-widest text-xs uppercase mb-3">Total Passes</p>
                                <h3 className="text-5xl font-black text-black mb-2">{stats.totalBookings}</h3>
                                <p className="text-gray-400 text-sm font-medium">Lifetime events attended</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200 hover:border-black transition-all duration-300 group overflow-hidden rounded-none shadow-sm">
                        <CardContent className="p-8 relative">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Calendar className="w-24 h-24 text-black" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-gray-500 font-bold tracking-widest text-xs uppercase mb-3">Upcoming</p>
                                <h3 className="text-5xl font-black text-black mb-2">{stats.upcomingEvents}</h3>
                                <p className="text-gray-400 text-sm font-medium">Scheduled future events</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200 hover:border-black transition-all duration-300 group overflow-hidden rounded-none shadow-sm">
                        <CardContent className="p-8 relative">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <TrendingUp className="w-24 h-24 text-black" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-gray-500 font-bold tracking-widest text-xs uppercase mb-3">Investment</p>
                                <h3 className="text-5xl font-black text-black mb-2">₹{stats.totalSpent.toLocaleString()}</h3>
                                <p className="text-gray-400 text-sm font-medium">Total value purchased</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Ticket Management */}
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
                            My Passes
                        </h2>

                        <div className="relative w-full md:w-96 group">
                            <div className="relative bg-white flex items-center p-1 border border-gray-200 focus-within:border-black transition-colors shadow-sm">
                                <Search className="w-5 h-5 text-gray-400 ml-3" />
                                <Input
                                    className="border-none bg-transparent focus-visible:ring-0 text-black placeholder:text-gray-400 rounded-none h-10"
                                    placeholder="Search by event or name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {filteredBookings.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-none p-20 text-center shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-none flex items-center justify-center mx-auto mb-6">
                                <Ticket className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-2">No Passes Found</h3>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                You haven't registered for any events matching your search. Explore our directory to start.
                            </p>
                            <Link href="/events">
                                <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white rounded-none uppercase tracking-widest text-xs font-bold px-8 h-12">
                                    Explore Directory
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {filteredBookings.map((booking) => (
                                <div key={booking._id} className="relative group perspective-1000">
                                    <div className="relative overflow-hidden rounded-none bg-white border border-gray-200 shadow-sm transition-all duration-300 hover:border-black hover:shadow-md">
                                        <div className="p-8 flex flex-col h-full relative z-10">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <Badge className={`mb-3 rounded-none uppercase tracking-widest text-[10px] font-bold px-3 py-1 ${booking.isRedeemed
                                                            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                            : 'bg-black text-white hover:bg-gray-800 border-transparent'
                                                        }`}>
                                                        {booking.isRedeemed ? 'REDEEMED' : 'VALID PASS'}
                                                    </Badge>
                                                    <h3 className="text-2xl font-bold text-black leading-tight mb-2 line-clamp-2 min-h-[4rem] flex items-center">{booking.event.title}</h3>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-3xl font-black text-black">₹{booking.amountPaid}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Paid</div>
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div className="h-px w-full bg-gray-100 my-4"></div>

                                            {/* Details */}
                                            <div className="grid grid-cols-2 gap-6 mb-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-none border border-gray-200 bg-gray-50 flex items-center justify-center">
                                                        <Calendar className="w-5 h-5 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Date</p>
                                                        <p className="font-semibold text-black text-sm">
                                                            {new Date(booking.event.startDate).toLocaleDateString(undefined, {
                                                                month: 'short', day: 'numeric', year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-none border border-gray-200 bg-gray-50 flex items-center justify-center">
                                                        <Ticket className="w-5 h-5 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Reference</p>
                                                        <p className="font-mono text-black font-bold tracking-wider text-sm">
                                                            #{booking.bookingReference?.slice(-6).toUpperCase() || booking._id.slice(-6).toUpperCase()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="mt-auto grid grid-cols-2 gap-4">
                                                <Link href={`/user/tickets/${booking._id}`}>
                                                    <Button className="w-full bg-black text-white font-bold h-12 hover:bg-gray-800 transition-colors border border-black rounded-none uppercase tracking-widest text-xs">
                                                        <QrCode className="w-4 h-4 mr-2" /> Ticket
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-gray-200 text-black h-12 hover:bg-gray-50 hover:border-black transition-colors rounded-none uppercase tracking-widest text-xs font-bold"
                                                    onClick={async () => {
                                                        try {
                                                            const res = await fetch(`/api/invoices/by-ref/${booking.bookingReference}`);
                                                            const inv = await res.json();
                                                            if (inv.success && inv.invoice?._id) {
                                                                window.open(`/api/invoices/download/${inv.invoice._id}`, '_blank');
                                                            } else {
                                                                toast.error('Invoice not found');
                                                            }
                                                        } catch (err) {
                                                            toast.error('Error fetching invoice');
                                                        }
                                                    }}
                                                >
                                                    <FileText className="w-4 h-4 mr-2" /> Invoice
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Account Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-gray-200">
                    <Link href="/user/settings">
                        <div className="group bg-white border border-gray-200 p-8 rounded-none flex items-center justify-between cursor-pointer hover:border-black transition-all shadow-sm">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 border border-gray-200 bg-gray-50 flex items-center justify-center group-hover:bg-black transition-colors">
                                    <Clock className="w-6 h-6 text-gray-500 group-hover:text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-black">History & Settings</h4>
                                    <p className="text-gray-500 text-sm mt-1">View past events and manage profile</p>
                                </div>
                            </div>
                            <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" />
                        </div>
                    </Link>

                    <div className="group bg-gray-50 border border-gray-200 p-8 rounded-none flex items-center justify-between opacity-60 cursor-not-allowed">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 border border-gray-200 bg-white flex items-center justify-center">
                                <Ticket className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-600">Loyalty Program</h4>
                                <p className="text-gray-500 text-sm mt-1">Enterprise feature coming soon</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
