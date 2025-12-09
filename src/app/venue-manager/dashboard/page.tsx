'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Ticket, IndianRupee, Plus, Eye } from 'lucide-react';

export default function VenueManagerDashboard() {
    const [stats, setStats] = useState({
        myEvents: 0,
        totalTicketsSold: 0,
        totalRevenue: 0,
        activeCoordinators: 0
    });
    const [recentEvents, setRecentEvents] = useState<any[]>([]);
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
                setStats({
                    myEvents: statsData.data.myEvents,
                    totalTicketsSold: statsData.data.totalTicketsSold,
                    totalRevenue: statsData.data.totalRevenue,
                    activeCoordinators: statsData.data.activeCoordinators
                });
            }

            // Fetch recent events
            const eventsRes = await fetch('/api/venue-manager/events');
            const eventsData = await eventsRes.json();

            if (eventsData.success) {
                // Get first 5 events
                setRecentEvents(eventsData.data.slice(0, 5));
            }
        } catch (error) {
            console.error('Failed to fetch venue manager data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/venue-manager/coordinators">
                        <Button className="w-full justify-start" variant="outline">
                            <Users className="w-4 h-4 mr-2" /> Manage Coordinators
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">My Events</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.myEvents}</div>
                            <p className="text-xs text-muted-foreground">Events you manage</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalTicketsSold}</div>
                            <p className="text-xs text-muted-foreground">Across all your events</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                            <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Total earnings</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Coordinators</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeCoordinators}</div>
                            <p className="text-xs text-muted-foreground">Active team members</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Events */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>My Events</CardTitle>
                            <Link href="/venue-manager/events">
                                <Button variant="outline" size="sm">View All</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-8 text-muted-foreground">Loading...</div>
                            ) : recentEvents.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No events yet</div>
                            ) : (
                                recentEvents.map((event) => (
                                    <div key={event._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition">
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{event.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(event.startDate).toLocaleDateString()} • {event.type}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={event.isActive ? 'default' : 'secondary'}>
                                                {event.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <Link href={`/venue-manager/events/${event._id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <Card className="hover:shadow-lg transition cursor-pointer">
                        <CardHeader>
                            <CardTitle className="text-lg">Manage Coordinators</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Add or remove coordinators for your events
                            </p>
                            <Link href="/venue-manager/coordinators">
                                <Button variant="outline" className="w-full">Manage Team</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition cursor-pointer">
                        <CardHeader>
                            <CardTitle className="text-lg">View Reports</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Sales reports and analytics for your events
                            </p>
                            <Link href="/venue-manager/reports">
                                <Button variant="outline" className="w-full">View Reports</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition cursor-pointer">
                        <CardHeader>
                            <CardTitle className="text-lg">Verify Tickets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Scan and verify tickets at the venue
                            </p>
                            <Link href="/verify">
                                <Button variant="outline" className="w-full">Open Scanner</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
