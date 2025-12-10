
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, IndianRupee, Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function VenueManagerReportsPage() {
    const [timeRange, setTimeRange] = useState('30');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        ticketsSold: 0,
        averageTicketPrice: 0,
        topEvent: { title: 'N/A', sales: 0 },
        eventPerformance: [],
        salesTrend: []
    });

    useEffect(() => {
        fetchReports();
    }, [timeRange]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/venue-manager/reports');
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch reports:", error);
            toast.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        // Simple CSV Export
        const headers = ['Event Title', 'Tickets Sold', 'Revenue', 'Total Capacity', 'Utilization %'];
        // @ts-ignore
        const rows = stats.eventPerformance.map((e: any) => [
            e.title,
            e.sold,
            e.revenue,
            e.total,
            ((e.sold / e.total) * 100).toFixed(2) + '%'
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map((e: any) => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `venue_reports_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-[#AE8638] animate-pulse">Loading Reports...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
                    <p className="text-gray-400 mt-1">Performance insights for your events</p>
                </div>
                <div className="flex gap-3">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[150px] bg-black border-[#AE8638]/30 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-[#AE8638]/30 text-white">
                            <SelectItem value="30">Last 30 Days</SelectItem>
                            <SelectItem value="90">Last 90 Days</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={handleExport}
                        className="bg-[#AE8638] hover:bg-[#AE8638]/90 text-black font-bold"
                    >
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                </div>
            </header>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-black border border-[#AE8638]/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-[#AE8638]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-[#AE8638] flex items-center gap-1 mt-1">
                            Lifetime revenue
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-black border border-[#AE8638]/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Tickets Sold</CardTitle>
                        <Users className="h-4 w-4 text-[#AE8638]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.ticketsSold}</div>
                        <p className="text-xs text-[#AE8638] flex items-center gap-1 mt-1">
                            Confirmed bookings
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-black border border-[#AE8638]/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Avg. Ticket Price</CardTitle>
                        <BarChart3 className="h-4 w-4 text-[#AE8638]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₹{stats.averageTicketPrice}</div>
                        <p className="text-xs text-gray-500 mt-1">Per booking</p>
                    </CardContent>
                </Card>

                <Card className="bg-black border border-[#AE8638]/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Top Event</CardTitle>
                        <Calendar className="h-4 w-4 text-[#AE8638]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-white line-clamp-1" title={stats.topEvent.title}>{stats.topEvent.title}</div>
                        <p className="text-xs text-[#AE8638] mt-1">{stats.topEvent.sales} tickets sold</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Event Performance Table */}
                <Card className="lg:col-span-2 bg-black border border-[#AE8638]/30">
                    <CardHeader>
                        <CardTitle className="text-[#AE8638]">Event Performance</CardTitle>
                        <CardDescription className="text-gray-400">Sales breakdown by event</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {/* @ts-ignore */}
                            {stats.eventPerformance && stats.eventPerformance.map((event: any, idx: number) => {
                                const percentage = event.total > 0 ? (event.sold / event.total) * 100 : 0;
                                return (
                                    <div key={idx} className="flex items-center justify-between p-4 border border-[#AE8638]/20 rounded-lg hover:bg-[#AE8638]/5 transition">
                                        <div className="flex-1 min-w-0 mr-4">
                                            <h3 className="font-semibold text-white truncate">{event.title}</h3>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="w-full max-w-xs bg-gray-800 rounded-full h-2">
                                                    <div
                                                        className="bg-[#AE8638] h-2 rounded-full"
                                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                                    {event.sold}/{event.total} sold
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-[#AE8638]">₹{event.revenue.toLocaleString()}</div>
                                            <Badge variant="outline" className={`mt-1 border-${percentage > 80 ? '[#AE8638] text-[#AE8638]' : 'gray-600 text-gray-400'}`}>
                                                {Math.round(percentage)}% Filled
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                            {stats.eventPerformance.length === 0 && (
                                <p className="text-center text-gray-500 py-8">No performance data available.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Trend Bar Chart */}
                <Card className="bg-black border border-[#AE8638]/30">
                    <CardHeader>
                        <CardTitle className="text-[#AE8638]">Sales Trend</CardTitle>
                        <CardDescription className="text-gray-400">Last 30 Days Activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-end justify-between gap-1 pb-2 border-b border-[#AE8638]/20">
                            {/* @ts-ignore */}
                            {stats.salesTrend && stats.salesTrend.map((value: number, idx: number) => {
                                // Assuming value can be large, normalize for display
                                // @ts-ignore
                                const max = Math.max(...stats.salesTrend) || 1;
                                const height = (value / max) * 100;
                                return (
                                    <div
                                        key={idx}
                                        className="flex-1 bg-[#AE8638]/40 hover:bg-[#AE8638] transition-all rounded-t relative group"
                                        style={{ height: `${Math.max(height, 5)}%` }}
                                    >
                                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                                            {value} sold
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                            <span>30 Days Ago</span>
                            <span>Today</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
