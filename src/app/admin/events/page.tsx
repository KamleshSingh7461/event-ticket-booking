
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Plus, Calendar, MapPin, Edit, Trash2, BarChart3, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

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
        quantity: number;
    };
    sold?: number;
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredEvents(events);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredEvents(events.filter(e => e.title.toLowerCase().includes(query) || e.venue.toLowerCase().includes(query)));
        }
    }, [searchQuery, events]);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events');
            const data = await res.json();
            if (data.success) {
                setEvents(data.data);
                setFilteredEvents(data.data);
            }
        } catch (err) {
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;

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
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-[#AE8638] animate-pulse">Loading Events...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Manage Events</h1>
                    <p className="text-gray-400 mt-1">Create and oversee all events on the platform</p>
                </div>
                <Link href="/admin/events/create">
                    <Button className="bg-[#AE8638] hover:bg-[#AE8638]/90 text-black font-bold">
                        <Plus className="w-4 h-4 mr-2" /> Create Event
                    </Button>
                </Link>
            </div>

            {/* Search Bar */}
            <div className="mb-8 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-black border-[#AE8638]/30 text-white focus:ring-[#AE8638]"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.length === 0 ? (
                    <div className="col-span-full text-center py-20 border border-dashed border-gray-800 rounded-lg">
                        <p className="text-gray-500">No events found matching your criteria.</p>
                        {searchQuery && <Button variant="link" onClick={() => setSearchQuery('')} className="text-[#AE8638]">Clear Search</Button>}
                    </div>
                ) : (
                    filteredEvents.map((event) => (
                        <Card key={event._id} className="bg-black border border-[#AE8638]/30 hover:border-[#AE8638] transition-all duration-300 flex flex-col overflow-hidden group">
                            <div className="h-48 relative bg-gray-900 overflow-hidden">
                                {event.banner ? (
                                    <img src={event.banner} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-700">
                                        <Calendar className="w-12 h-12 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <Badge variant={(event.type === 'ONLINE') ? 'secondary' : 'default'} className="bg-black/70 backdrop-blur-md text-[#AE8638] border border-[#AE8638]/50">
                                        {event.type}
                                    </Badge>
                                </div>
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl font-bold text-white line-clamp-1" title={event.title}>{event.title}</CardTitle>
                                </div>
                                <CardDescription className="flex items-center gap-2 text-gray-400 text-xs">
                                    <Calendar className="w-3 h-3 text-[#AE8638]" />
                                    {new Date(event.startDate).toLocaleDateString()}
                                    {event.type === 'OFFLINE' && (
                                        <>
                                            <span className="mx-1 text-gray-600">•</span>
                                            <MapPin className="w-3 h-3 text-[#AE8638]" />
                                            <span className="truncate max-w-[150px]">{event.venue}</span>
                                        </>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4 pt-2">
                                <div className="flex justify-between items-center text-sm border-t border-gray-800 pt-3">
                                    <div>
                                        <p className="text-gray-500 text-xs uppercase tracking-wider">Price</p>
                                        <p className="font-medium text-[#AE8638]">{event.ticketConfig.currency} {event.ticketConfig.price}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 text-xs uppercase tracking-wider">Capacity</p>
                                        <p className="font-medium text-white">{event.ticketConfig.quantity} / day</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center gap-2 border-t border-gray-800 pt-4 bg-gray-950/30">
                                <Link href={`/admin/events/${event._id}/bookings`} className="flex-1">
                                    <Button size="sm" className="w-full bg-[#AE8638]/10 text-[#AE8638] hover:bg-[#AE8638] hover:text-black border border-[#AE8638]/30">
                                        <BarChart3 className="w-4 h-4 mr-2" /> Stats
                                    </Button>
                                </Link>
                                <div className="flex gap-2">
                                    <Link href={`/admin/events/${event._id}/edit`}>
                                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-950/30" onClick={() => handleDelete(event._id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
