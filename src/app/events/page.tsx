import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Ticket, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import { Input } from '@/components/ui/input';

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
        <div className="min-h-screen flex flex-col bg-gray-50/50">
            <Navbar />

            {/* Hero Section */}
            <div className="relative bg-primary/90 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="container relative z-10 py-16 md:py-24 flex flex-col items-center text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
                        Discover & Experience
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-8 drop-shadow-md">
                        Book tickets for the biggest sports events, concerts, and workshops happening around you.
                    </p>

                    {/* Simulated Search Bar (Visual Only for now) */}
                    <div className="w-full max-w-md flex gap-2 p-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-xl">
                        <div className="flex-1 flex items-center px-4">
                            <Search className="w-5 h-5 text-white/70 mr-2" />
                            <input
                                type="text"
                                placeholder="Search events..."
                                className="bg-transparent border-none outline-none text-white placeholder:text-white/60 w-full"
                            />
                        </div>
                        <Button className="rounded-full px-6">Find</Button>
                    </div>
                </div>
            </div>

            <main className="flex-1 container py-12 md:py-16 -mt-8 relative z-20">
                {/* Statistics / Filter Bar Placeholder */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {/* Could add quick stats or filters here in future */}
                </div>

                {/* Events Grid */}
                {events.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Events</h3>
                        <p className="text-muted-foreground mb-6">Check back later for new announcements.</p>
                        <Link href="/">
                            <Button variant="outline">Back to Home</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event: any) => (
                            <Link href={`/events/${event._id}`} key={event._id} className="group">
                                <Card className="h-full border-0 shadow-md group-hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white flex flex-col transform group-hover:-translate-y-1">
                                    {/* Image Section */}
                                    <div className="relative h-56 w-full overflow-hidden bg-gray-200">
                                        {event.banner ? (
                                            <img
                                                src={event.banner}
                                                alt={event.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary via-purple-600 to-blue-600 flex items-center justify-center">
                                                <Calendar className="w-16 h-16 text-white/40" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4">
                                            <Badge variant="secondary" className="backdrop-blur-md bg-white/90 text-gray-900 font-bold shadow-sm">
                                                {event.ticketConfig.currency} {event.ticketConfig.price}
                                            </Badge>
                                        </div>
                                        <div className="absolute top-4 left-4">
                                            <Badge className={`${event.type === 'ONLINE' ? 'bg-green-500' : 'bg-blue-600'} hover:bg-opacity-90`}>
                                                {event.type}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <CardContent className="flex-1 p-6">
                                        <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(event.startDate).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                            {event.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                                            {event.description}
                                        </p>

                                        {event.type === 'OFFLINE' && event.venue && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span className="truncate">{event.venue}</span>
                                            </div>
                                        )}
                                    </CardContent>

                                    <CardFooter className="p-6 pt-0 mt-auto">
                                        <div className="w-full pt-4 border-t flex items-center justify-between group-hover:text-primary transition-colors">
                                            <span className="text-sm font-medium">Get Tickets</span>
                                            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
