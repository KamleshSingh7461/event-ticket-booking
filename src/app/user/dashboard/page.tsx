
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Ticket, Calendar, Download, QrCode, Search, Loader2, TrendingUp, ExternalLink, MapPin, Clock } from 'lucide-react';
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
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
                <p className="text-[#D4AF37] font-medium tracking-widest uppercase text-sm">Loading Experience...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-[#D4AF37] selection:text-black">
            {/* Decoration Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-8 space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-[#D4AF37]/20 pb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A]">Dashboard</span>
                        </h1>
                        <p className="text-neutral-400 text-lg">Manage your exclusive access and experiences.</p>
                    </div>
                    <Link href="/">
                        <Button className="bg-[#D4AF37] hover:bg-[#B38B14] text-black font-bold px-8 py-6 text-md shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:scale-105">
                            Browse Events
                        </Button>
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-neutral-900/50 backdrop-blur-md border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300 group overflow-hidden">
                        <CardContent className="p-6 relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Ticket className="w-24 h-24 text-[#D4AF37]" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[#D4AF37] font-medium tracking-widest text-xs uppercase mb-2">Total Tickets</p>
                                <h3 className="text-5xl font-black text-white mb-2">{stats.totalBookings}</h3>
                                <p className="text-neutral-500 text-sm">Lifetime events attended</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-neutral-900/50 backdrop-blur-md border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300 group overflow-hidden">
                        <CardContent className="p-6 relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Calendar className="w-24 h-24 text-[#D4AF37]" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[#D4AF37] font-medium tracking-widest text-xs uppercase mb-2">Upcoming</p>
                                <h3 className="text-5xl font-black text-white mb-2">{stats.upcomingEvents}</h3>
                                <p className="text-neutral-500 text-sm">Scheduled future events</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-neutral-900/50 backdrop-blur-md border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-300 group overflow-hidden">
                        <CardContent className="p-6 relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <TrendingUp className="w-24 h-24 text-[#D4AF37]" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-[#D4AF37] font-medium tracking-widest text-xs uppercase mb-2">Investment</p>
                                <h3 className="text-5xl font-black text-white mb-2">₹{stats.totalSpent.toLocaleString()}</h3>
                                <p className="text-neutral-500 text-sm">Total value purchased</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Ticket Management */}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <span className="w-10 h-1 bg-[#D4AF37] rounded-full inline-block"></span>
                            My Tickets
                        </h2>

                        <div className="relative w-full md:w-96 group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#F7EF8A] rounded-lg opacity-20 group-hover:opacity-30 blur transition-opacity"></div>
                            <div className="relative bg-neutral-900 rounded-lg flex items-center p-1 border border-[#D4AF37]/30">
                                <Search className="w-5 h-5 text-neutral-400 ml-3" />
                                <Input
                                    className="border-none bg-transparent focus-visible:ring-0 text-white placeholder:text-neutral-500"
                                    placeholder="Search your collection..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {filteredBookings.length === 0 ? (
                        <div className="bg-neutral-900/30 border border-dashed border-[#D4AF37]/30 rounded-2xl p-20 text-center">
                            <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Ticket className="w-10 h-10 text-[#D4AF37]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Tickets Found</h3>
                            <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                                You haven't purchased any tickets matching your search. Explore our events to start your journey.
                            </p>
                            <Link href="/">
                                <Button variant="outline" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black">
                                    Explore Events
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                            {filteredBookings.map((booking) => (
                                <div key={booking._id} className="relative group perspective-1000">
                                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 to-black border border-[#D4AF37]/30 shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:border-[#D4AF37] hover:shadow-[0_10px_40px_rgba(212,175,55,0.1)]">

                                        {/* Golden Strip Decoration */}
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#D4AF37] via-[#F7EF8A] to-[#D4AF37]"></div>

                                        <div className="p-8 flex flex-col h-full relative z-10">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <Badge className={`mb-3 ${booking.isRedeemed
                                                            ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-800'
                                                            : 'bg-[#D4AF37] text-black hover:bg-[#B38B14] font-bold'
                                                        }`}>
                                                        {booking.isRedeemed ? 'REDEEMED' : 'VALID PASS'}
                                                    </Badge>
                                                    <h3 className="text-2xl font-bold text-white leading-tight mb-2 line-clamp-2 min-h-[4rem] flex items-center">{booking.event.title}</h3>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-3xl font-black text-[#D4AF37]">₹{booking.amountPaid}</div>
                                                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Paid</div>
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent my-4"></div>

                                            {/* Details */}
                                            <div className="grid grid-cols-2 gap-6 mb-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                                                        <Calendar className="w-5 h-5 text-[#D4AF37]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-neutral-500 uppercase">Date</p>
                                                        <p className="font-semibold text-white">
                                                            {new Date(booking.event.startDate).toLocaleDateString(undefined, {
                                                                month: 'short', day: 'numeric', year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                                                        <Ticket className="w-5 h-5 text-[#D4AF37]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-neutral-500 uppercase">Reference</p>
                                                        <p className="font-mono text-[#D4AF37] tracking-wider text-sm">
                                                            #{booking.bookingReference?.slice(-6).toUpperCase() || booking._id.slice(-6).toUpperCase()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="mt-auto">
                                                <Link href={`/user/tickets/${booking._id}`} className="block">
                                                    <Button className="w-full bg-white text-black font-bold h-12 hover:bg-[#D4AF37] transition-colors border-2 border-transparent">
                                                        <QrCode className="w-4 h-4 mr-2" /> View Ticket Code
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Background Texture */}
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Account Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-[#D4AF37]/20">
                    <Link href="/user/settings">
                        <div className="group bg-neutral-900 border border-[#D4AF37]/20 p-6 rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#D4AF37]/5 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-[#D4AF37] transition-colors">
                                    <Clock className="w-6 h-6 text-white group-hover:text-black" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-white">History & Settings</h4>
                                    <p className="text-neutral-500 text-sm">View past events and manage profile</p>
                                </div>
                            </div>
                            <ExternalLink className="w-5 h-5 text-neutral-600 group-hover:text-[#D4AF37] transition-colors" />
                        </div>
                    </Link>

                    <div className="group bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex items-center justify-between opacity-50 cursor-not-allowed">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center">
                                <Ticket className="w-6 h-6 text-neutral-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-neutral-400">Loyalty Program</h4>
                                <p className="text-neutral-600 text-sm">Coming Soon</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
