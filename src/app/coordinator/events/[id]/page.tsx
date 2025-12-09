'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Ticket, Scan, ArrowLeft } from 'lucide-react';
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
                // Mock stats - in production, fetch from tickets API
                setStats({ totalTickets: 150, verified: 89, pending: 61 });
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
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-slate-400 mb-2">Loading event details...</div>
                    <div className="text-xs text-slate-500">Event ID: {params.id}</div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="text-red-400 text-xl">{error || 'Event not found'}</div>
                    <p className="text-slate-400">The event you're looking for doesn't exist or you don't have access to it.</p>
                    <Button onClick={() => router.push('/coordinator/dashboard')} className="bg-primary">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <header className="bg-slate-900 border-b border-slate-800">
                <div className="container mx-auto px-6 py-4">
                    <Button
                        variant="ghost"
                        className="mb-4 text-slate-400 hover:text-white"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold">{event.title}</h1>
                            <p className="text-sm text-slate-400 mt-1">{event.description}</p>
                        </div>
                        <Badge variant={event.type === 'ONLINE' ? 'secondary' : 'default'}>
                            {event.type}
                        </Badge>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Event Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                Event Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-slate-300">
                            <div>
                                <p className="text-xs text-slate-400">Start Date</p>
                                <p className="font-medium">{new Date(event.startDate).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">End Date</p>
                                <p className="font-medium">{new Date(event.endDate).toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {event.type === 'OFFLINE' && (
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    Venue Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-300">{event.venue}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Verification Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-sm text-slate-400">Total Tickets</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white flex items-center gap-2">
                                <Ticket className="w-6 h-6 text-slate-400" />
                                {stats.totalTickets}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-sm text-slate-400">Verified</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-400">{stats.verified}</div>
                            <div className="text-xs text-slate-400 mt-1">
                                {Math.round((stats.verified / stats.totalTickets) * 100)}% complete
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-sm text-slate-400">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
                            <div className="text-xs text-slate-400 mt-1">Awaiting entry</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Bar */}
                <Card className="bg-slate-900 border-slate-800 mb-8">
                    <CardHeader>
                        <CardTitle className="text-white">Verification Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full bg-slate-800 rounded-full h-4">
                            <div
                                className="bg-gradient-to-r from-green-500 to-green-400 h-4 rounded-full transition-all duration-500"
                                style={{ width: `${(stats.verified / stats.totalTickets) * 100}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-sm text-slate-400">
                            <span>{stats.verified} verified</span>
                            <span>{stats.pending} remaining</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-slate-900 border-slate-800 hover:border-primary/50 transition">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Scan className="w-5 h-5 text-primary" />
                                Start Verification
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-400 mb-4">
                                Open the QR scanner to verify tickets for this event
                            </p>
                            <Link href={`/verify?event=${event._id}`}>
                                <Button className="w-full bg-primary hover:bg-primary/90">
                                    <Scan className="w-4 h-4 mr-2" /> Open Scanner
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800 hover:border-primary/50 transition">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Attendee List
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-400 mb-4">
                                View all ticket holders for this event
                            </p>
                            <Button variant="outline" className="w-full border-slate-700 text-white hover:bg-slate-800">
                                View Attendees
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
