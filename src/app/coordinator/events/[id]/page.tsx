'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Ticket, Scan, ArrowLeft, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CoordinatorEventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<any>(null);
    const [stats, setStats] = useState({ totalTickets: 0, verified: 0, pending: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (params.id) {
            fetchEventDetails();
        }
    }, [params.id]);

    const fetchEventDetails = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/events/${params.id}`);
            const data = await res.json();
            if (data.success) {
                setEvent(data.data);

                // Fetch Real Stats
                const statsRes = await fetch(`/api/events/${params.id}/stats`);
                const statsData = await statsRes.json();
                if (statsData.success) {
                    setStats(statsData.data);
                }
            } else {
                setError(data.error || 'Event not found');
                toast.error(data.error || 'Event not found');
            }
        } catch (err) {
            setError('Failed to load event');
            toast.error('Failed to load event');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-[#AE8638] mb-2 animate-pulse">Loading event details...</div>
                    <div className="text-xs text-gray-500">Event ID: {params.id}</div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="text-red-400 text-xl">{error || 'Event not found'}</div>
                    <p className="text-gray-400">The event you're looking for doesn't exist or you don't have access to it.</p>
                    <Button onClick={() => router.push('/coordinator/dashboard')} className="bg-gradient-to-r from-[#AE8638] to-[#D4AF37] text-black font-semibold hover:shadow-lg hover:shadow-[#AE8638]/50">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const progressPercentage = stats.totalTickets > 0 ? (stats.verified / stats.totalTickets) * 100 : 0;

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header with Event Banner */}
            <header className="relative bg-gradient-to-br from-black via-[#AE8638]/10 to-black border-b border-[#AE8638]/20 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
                <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 relative z-10">
                    <Button
                        variant="ghost"
                        className="mb-4 text-gray-400 hover:text-[#AE8638] hover:bg-[#AE8638]/10 border border-transparent hover:border-[#AE8638]/30"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#AE8638] to-[#D4AF37] bg-clip-text text-transparent mb-2">
                                {event.title}
                            </h1>
                            <p className="text-sm md:text-base text-gray-400 max-w-2xl">{event.description}</p>
                        </div>
                        <Badge className={`${event.type === 'ONLINE' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-[#AE8638]/20 text-[#AE8638] border-[#AE8638]/30'} border px-4 py-2 text-sm font-semibold`}>
                            {event.type}
                        </Badge>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
                {/* Event Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                    <Card className="bg-black/40 backdrop-blur-md border border-[#AE8638]/20 shadow-xl hover:border-[#AE8638]/40 transition-all group">
                        <CardHeader>
                            <CardTitle className="text-[#AE8638] flex items-center gap-2 text-lg md:text-xl">
                                <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Event Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 rounded-lg bg-[#AE8638]/5 border border-[#AE8638]/10">
                                <p className="text-xs text-gray-400 mb-1">Start Date</p>
                                <p className="font-semibold text-white">{new Date(event.startDate).toLocaleString()}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-[#AE8638]/5 border border-[#AE8638]/10">
                                <p className="text-xs text-gray-400 mb-1">End Date</p>
                                <p className="font-semibold text-white">{new Date(event.endDate).toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {event.type === 'OFFLINE' && (
                        <Card className="bg-black/40 backdrop-blur-md border border-[#AE8638]/20 shadow-xl hover:border-[#AE8638]/40 transition-all group">
                            <CardHeader>
                                <CardTitle className="text-[#AE8638] flex items-center gap-2 text-lg md:text-xl">
                                    <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Venue Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-white font-medium">{event.venue}</p>
                                <p className="text-xs text-gray-400 mt-2">Physical venue for this event</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Verification Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                    <Card className="bg-gradient-to-br from-black/60 to-[#AE8638]/5 backdrop-blur-md border border-[#AE8638]/20 shadow-xl hover:shadow-2xl hover:shadow-[#AE8638]/20 transition-all">
                        <CardHeader>
                            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                                <Ticket className="w-4 h-4" />
                                Total Tickets
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-white">{stats.totalTickets}</div>
                            <p className="text-xs text-gray-500 mt-1">All purchased tickets</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/10 to-black/60 backdrop-blur-md border border-green-500/30 shadow-xl hover:shadow-2xl hover:shadow-green-500/20 transition-all">
                        <CardHeader>
                            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                Verified
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-green-400">{stats.verified}</div>
                            <div className="text-xs text-gray-400 mt-1">
                                {Math.round(progressPercentage)}% complete
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-500/10 to-black/60 backdrop-blur-md border border-yellow-500/30 shadow-xl hover:shadow-2xl hover:shadow-yellow-500/20 transition-all">
                        <CardHeader>
                            <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-yellow-400" />
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-yellow-400">{stats.pending}</div>
                            <div className="text-xs text-gray-400 mt-1">Awaiting entry</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Bar */}
                <Card className="bg-black/40 backdrop-blur-md border border-[#AE8638]/20 shadow-xl mb-6 md:mb-8">
                    <CardHeader>
                        <CardTitle className="text-[#AE8638] text-lg md:text-xl">Verification Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full bg-black/50 rounded-full h-6 border border-[#AE8638]/20 overflow-hidden">
                            <div
                                className="absolute inset-0 bg-gradient-to-r from-green-500 via-[#AE8638] to-[#D4AF37] h-full transition-all duration-700 ease-out"
                                style={{ width: `${progressPercentage}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-lg">
                                {Math.round(progressPercentage)}%
                            </div>
                        </div>
                        <div className="flex justify-between mt-3 text-sm">
                            <span className="text-green-400 font-semibold">{stats.verified} verified</span>
                            <span className="text-yellow-400 font-semibold">{stats.pending} remaining</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <Card className="bg-gradient-to-br from-[#AE8638]/20 to-black/60 backdrop-blur-md border border-[#AE8638]/40 shadow-xl hover:shadow-2xl hover:shadow-[#AE8638]/30 transition-all group">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-lg md:text-xl">
                                <Scan className="w-5 h-5 text-[#AE8638] group-hover:scale-110 transition-transform" />
                                Start Verification
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-400 mb-4">
                                Open the QR scanner to verify tickets for this event
                            </p>
                            <Link href={`/verify?event=${event._id}`}>
                                <Button className="w-full bg-gradient-to-r from-[#AE8638] to-[#D4AF37] text-black font-bold hover:shadow-lg hover:shadow-[#AE8638]/50 transition-all">
                                    <Scan className="w-4 h-4 mr-2" /> Open Scanner
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="bg-black/40 backdrop-blur-md border border-[#AE8638]/20 shadow-xl hover:border-[#AE8638]/40 transition-all group">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-lg md:text-xl">
                                <Users className="w-5 h-5 text-[#AE8638] group-hover:scale-110 transition-transform" />
                                Attendee List
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-400 mb-4">
                                View all ticket holders for this event
                            </p>
                            <Button variant="outline" className="w-full border-[#AE8638]/30 text-[#AE8638] hover:bg-[#AE8638]/10 hover:border-[#AE8638] transition-all">
                                View Attendees
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
