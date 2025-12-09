'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Edit, Users, Plus } from 'lucide-react';

export default function VenueManagerEventsPage() {
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        // In real app: fetch only events created by this venue manager
        // For now, fetch all events (will filter by createdBy in production)
        fetch('/api/events')
            .then(res => res.json())
            .then(data => {
                if (data.success) setEvents(data.data);
            });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">My Events</h1>
                            <p className="text-sm text-muted-foreground">Manage events you've created</p>
                        </div>
                        <Link href="/venue-manager/events/create">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" /> Create Event
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <Card key={event._id} className="flex flex-col hover:shadow-lg transition">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                                    <Badge variant={event.type === 'ONLINE' ? 'secondary' : 'default'}>
                                        {event.type}
                                    </Badge>
                                </div>
                                <CardDescription className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(event.startDate).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-2 text-sm">
                                {event.type === 'OFFLINE' && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="w-3 h-3" /> {event.venue}
                                    </div>
                                )}
                                <div className="font-semibold text-primary text-lg">
                                    {event.ticketConfig.currency} {event.ticketConfig.price}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t pt-4">
                                <Link href={`/venue-manager/events/${event._id}`}>
                                    <Button variant="outline" size="sm">
                                        <Edit className="w-4 h-4 mr-1" /> Manage
                                    </Button>
                                </Link>
                                <Link href={`/venue-manager/events/${event._id}/coordinators`}>
                                    <Button variant="ghost" size="sm">
                                        <Users className="w-4 h-4 mr-1" /> Team
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}
