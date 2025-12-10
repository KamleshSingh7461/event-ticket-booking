'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, IndianRupee, Calendar } from 'lucide-react';

export default function VenueManagerReportsPage() {
    const [timeRange, setTimeRange] = useState('30');
    const [stats, setStats] = useState({
        totalRevenue: 0,
        ticketsSold: 0,
        averageTicketPrice: 0,
        topEvent: { title: '', sales: 0 }
    });

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch('/api/venue-manager/reports');
                const data = await res.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            }
        };

        fetchReports();
    }, [timeRange]); // Note: Currently API returns all-time data, but timeRange structure kept for future expansion

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                            <p className="text-sm text-muted-foreground">Track your event performance</p>
                        </div>
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Last 7 Days</SelectItem>
                                <SelectItem value="30">Last 30 Days</SelectItem>
                                <SelectItem value="90">Last 90 Days</SelectItem>
                                <SelectItem value="365">Last Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                <TrendingUp className="w-3 h-3" /> +12% from last period
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.ticketsSold}</div>
                            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                <TrendingUp className="w-3 h-3" /> +8% from last period
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Ticket Price</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{stats.averageTicketPrice}</div>
                            <p className="text-xs text-muted-foreground mt-1">Per ticket</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Top Event</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold line-clamp-1">{stats.topEvent.title}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stats.topEvent.sales} tickets sold</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Event Performance */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Event Performance</CardTitle>
                        <CardDescription>Sales breakdown by event</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-4">
                                {/* @ts-ignore */}
                                {stats.eventPerformance && stats.eventPerformance.map((event: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{event.title}</h3>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-2 rounded-full"
                                                        style={{ width: `${(event.sold / event.total) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                                    {event.sold}/{event.total} sold
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <div className="text-lg font-bold">₹{event.revenue.toLocaleString()}</div>
                                            <Badge variant={(event.sold / event.total) > 0.8 ? 'default' : 'secondary'}>
                                                {Math.round((event.sold / event.total) * 100)}%
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Trend</CardTitle>
                        <CardDescription>Daily ticket sales over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-end justify-around gap-2">
                            {/* @ts-ignore */}
                            {stats.salesTrend && stats.salesTrend.map((value: number, idx: number) => (
                                <div key={idx} className="flex-1 bg-primary/20 hover:bg-primary/40 transition rounded-t" style={{ height: `${Math.max((value / 10) * 100, 5)}%` }} title={`${value} tickets`}></div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                            <span>2 weeks ago</span>
                            <span>Today</span>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
