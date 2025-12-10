'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Plus, Calendar, MapPin, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Event {
    _id: string;
    title: string;
    startDate: string;
    venue: string;
    type: string;
    banner?: string;
    ticketConfig: {
        price: number;
        currency: string;
    };
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events');
            const data = await res.json();
            if (data.success) {
                setEvents(data.data);
            }
        } catch (err) {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Event deleted');
                fetchEvents();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Failed to delete event');
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Events</h1>
                <Link href="/admin/events/create">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" /> Create Event
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground bg-white border rounded-lg">
                        No events found. Create your first one!
                    </div>
                ) : (
                    events.map((event) => (
                        <Card key={event._id} className="flex flex-col overflow-hidden">
                            <div className="h-48 relative bg-gray-100">
                                {event.banner ? (
                                    <img src={event.banner} alt={event.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <Calendar className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <Badge variant={event.type === 'ONLINE' ? 'secondary' : 'default'} className="bg-white/90 hover:bg-white text-black shadow-sm backdrop-blur-sm">
                                        {event.type}
                                    </Badge>
                                </div>
                            </div>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="line-clamp-1" title={event.title}>{event.title}</CardTitle>
                                </div>
                                <CardDescription className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(event.startDate).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-2 text-sm text-muted-foreground">
                                {event.type === 'OFFLINE' && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3" /> {event.venue}
                                    </div>
                                )}
                                <div className="font-semibold text-primary">
                                    {event.ticketConfig.currency} {event.ticketConfig.price}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 border-t pt-4">
                                <Link href={`/admin/events/${event._id}/edit`}>
                                    <Button variant="outline" size="sm">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(event._id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
