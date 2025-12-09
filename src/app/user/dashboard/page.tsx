'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Ticket, Calendar, Download, QrCode, Search, Loader2, TrendingUp } from 'lucide-react';
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
        fetchBookings();
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

    const fetchBookings = async () => {
        try {
            // Fetch stats from API
            const statsRes = await fetch('/api/user/stats');
            const statsData = await statsRes.json();

            if (statsData.success) {
                setStats(statsData.data);
            }

            // Fetch bookings
            const res = await fetch('/api/user/bookings');
            const data = await res.json();
            if (data.success) {
                setBookings(data.data);
                setFilteredBookings(data.data);
            }
        } catch (err) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">My Dashboard</h1>
                <p className="text-sm md:text-base text-muted-foreground">Manage your bookings and tickets</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                <Card className="hover:shadow-lg transition">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium">Total Bookings</CardTitle>
                        <Ticket className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                        <div className="text-xl md:text-2xl font-bold">{stats.totalBookings}</div>
                        <p className="text-xs text-muted-foreground mt-1">All time</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium">Upcoming Events</CardTitle>
                        <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                        <div className="text-xl md:text-2xl font-bold text-green-600">{stats.upcomingEvents}</div>
                        <p className="text-xs text-muted-foreground mt-1">Not yet attended</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition sm:col-span-2 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium">Total Spent</CardTitle>
                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                        <div className="text-xl md:text-2xl font-bold">₹{stats.totalSpent.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">On tickets</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="mb-4 md:mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search bookings..."
                        className="pl-10 text-sm md:text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Bookings */}
            <Card className="mb-6 md:mb-8">
                <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-base md:text-lg">My Tickets</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="mb-2 text-sm md:text-base">{searchTerm ? 'No bookings found' : 'No bookings yet'}</p>
                            {!searchTerm && (
                                <Link href="/">
                                    <Button className="mt-4 text-sm md:text-base">Browse Events</Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3 md:space-y-4">
                            {filteredBookings.map((booking) => (
                                <div key={booking._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm md:text-base truncate">{booking.event.title}</h3>
                                        <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1 text-xs md:text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(booking.event.startDate).toLocaleDateString()}
                                            </span>
                                            <span>₹{booking.amountPaid.toLocaleString()}</span>
                                            <span className="text-xs">
                                                Booked: {new Date(booking.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                        <Badge variant={booking.isRedeemed ? 'secondary' : 'default'} className="text-xs">
                                            {booking.isRedeemed ? 'Used' : 'Valid'}
                                        </Badge>
                                        {!booking.isRedeemed && (
                                            <Link href={`/user/tickets/${booking._id}`} className="flex-1 sm:flex-none">
                                                <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs md:text-sm">
                                                    <QrCode className="w-3 h-3 md:w-4 md:h-4 mr-1" /> View Ticket
                                                </Button>
                                            </Link>
                                        )}
                                        <Link href={`/user/bookings/${booking._id}`} className="flex-1 sm:flex-none">
                                            <Button size="sm" variant="ghost" className="w-full sm:w-auto text-xs md:text-sm">
                                                Details
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <Card className="hover:shadow-lg transition cursor-pointer">
                    <CardHeader className="p-4 md:p-6">
                        <CardTitle className="text-base md:text-lg">Browse Events</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                        <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                            Discover and book tickets for upcoming events
                        </p>
                        <Link href="/">
                            <Button className="w-full text-sm md:text-base">Explore Events</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition cursor-pointer">
                    <CardHeader className="p-4 md:p-6">
                        <CardTitle className="text-base md:text-lg">Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                        <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                            Update your profile and preferences
                        </p>
                        <Link href="/user/settings">
                            <Button variant="outline" className="w-full text-sm md:text-base">Manage Account</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition cursor-pointer">
                    <CardHeader className="p-4 md:p-6">
                        <CardTitle className="text-base md:text-lg">Download History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                        <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                            Export your booking history as PDF
                        </p>
                        <Button variant="outline" className="w-full text-sm md:text-base" onClick={() => toast.info('Feature coming soon')}>
                            <Download className="w-3 h-3 md:w-4 md:h-4 mr-2" /> Download
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
