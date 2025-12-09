import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Ticket, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';

async function getEvents() {
    await dbConnect();
    const events = await Event.find({ isActive: true })
        .sort({ startDate: 1 })
        .lean();

    return events.map(event => ({
        ...event,
        _id: event._id.toString(),
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        venueManager: event.venueManager?.toString()
    }));
}

export default async function EventsPage() {
    const events = await getEvents();

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            <main className="flex-1 container py-8 md:py-12">
                {/* Header */}
                <div className="mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-3">All Events</h1>
                    <p className="text-base md:text-lg text-muted-foreground">
                        Discover and book tickets for upcoming events
                    </p>
                </div>

                {/* Events Grid */}
                {events.length === 0 ? (
                    <div className="text-center py-12 md:py-16">
                        <p className="text-lg md:text-xl text-muted-foreground mb-4">No events available at the moment</p>
                        <Link href="/">
                            <Button>Go Home</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {events.map((event: any) => (
                            <Card key={event._id} className="hover:shadow-lg transition-shadow overflow-hidden">
                                <div className="h-40 md:h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                    <Calendar className="w-12 h-12 md:w-16 md:h-16 text-primary/40" />
                                </div>

                                <CardHeader className="p-4 md:p-6">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <CardTitle className="text-lg md:text-xl line-clamp-2">{event.title}</CardTitle>
                                        <Badge variant={event.type === 'ONLINE' ? 'secondary' : 'default'} className="flex-shrink-0 text-xs">
                                            {event.type}
                                        </Badge>
                                    </div>
                                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                                        {event.description}
                                    </p>
                                </CardHeader>

                                <CardContent className="p-4 md:p-6 pt-0 space-y-3 md:space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs md:text-sm">
                                            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                            <span className="truncate">{new Date(event.startDate).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}</span>
                                        </div>

                                        {event.type === 'OFFLINE' && event.venue && (
                                            <div className="flex items-center gap-2 text-xs md:text-sm">
                                                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                <span className="truncate">{event.venue}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-primary">
                                            <IndianRupee className="w-4 h-4 flex-shrink-0" />
                                            <span>{event.ticketConfig.price.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <Link href={`/events/${event._id}`} className="block">
                                        <Button className="w-full text-sm md:text-base" size="sm">
                                            <Ticket className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
