import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Ticket, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import TicketModel from '@/models/Ticket';

async function getEvents(searchQuery?: string) {
    await dbConnect();
    
    const query: any = { isActive: true };
    if (searchQuery) {
        query.$or = [
            { title: { $regex: searchQuery, $options: 'i' } },
            { venue: { $regex: searchQuery, $options: 'i' } },
            { description: { $regex: searchQuery, $options: 'i' } }
        ];
    }

    const events = await Event.find(query)
        .sort({ startDate: 1 })
        .lean();

    // Fetch sold count for each event
    const eventsWithStats = await Promise.all(events.map(async (event) => {
        const soldCount = await TicketModel.countDocuments({
            event: event._id,
            paymentStatus: 'SUCCESS'
        });

        const totalCapacity = event.ticketConfig.quantity || 100; // Default to 100 if not set
        const percentSold = (soldCount / totalCapacity) * 100;

        return {
            ...event,
            _id: event._id.toString(),
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
            venueManager: event.venueManager?.toString(),
            isSoldOut: soldCount >= totalCapacity,
            isSellingFast: percentSold >= 70 && soldCount < totalCapacity,
            percentSold
        };
    }));

    return eventsWithStats;
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
    const { search } = await searchParams;
    const events = await getEvents(search);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            {/* Corporate Hero Section */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="container py-20 md:py-32 flex flex-col items-center text-center max-w-4xl mx-auto px-4">
                    <div className="inline-block border border-black px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-black mb-8">
                        Event Directory
                    </div>
                    <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6 text-black leading-tight">
                        Global Engagements
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 mb-12 font-light">
                        Discover and register for industry-leading conferences, seminars, and exclusive corporate events worldwide.
                    </p>

                    {/* Stark Search Bar */}
                    <div className="w-full">
                        <form action="/events" method="GET" className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="search"
                                    defaultValue={search || ''}
                                    placeholder="Search by event name, location, or keyword..."
                                    className="w-full pl-12 h-14 text-base bg-white border border-gray-200 text-black placeholder:text-gray-400 focus:ring-1 focus:ring-black outline-none rounded-none"
                                />
                            </div>
                            <Button type="submit" className="h-14 px-10 bg-black text-white hover:bg-gray-800 font-semibold rounded-none w-full sm:w-auto">
                                Search
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            <main className="flex-1 container py-16 md:py-24 relative z-20">
                {/* Events Grid */}
                {events.length === 0 ? (
                    <div className="text-center py-24 bg-gray-50 border border-gray-200">
                        <div className="w-16 h-16 bg-white flex items-center justify-center mx-auto mb-6 border border-gray-200">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-black mb-2">No Active Events</h3>
                        <p className="text-gray-500 mb-8 font-light">The schedule is currently clear. Please check back later.</p>
                        <Link href="/">
                            <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white rounded-none font-semibold px-8 h-12">Return to Dashboard</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event: any) => (
                            <Link href={event.isSoldOut ? '#' : `/events/${event._id}`} key={event._id} className={`group flex flex-col ${event.isSoldOut ? 'cursor-not-allowed opacity-50 grayscale' : ''}`}>
                                <Card className="h-full border border-gray-200 bg-white hover:border-black rounded-none shadow-none transition-colors flex flex-col">
                                    {/* Image Section */}
                                    <div className="relative h-60 w-full overflow-hidden bg-gray-100">
                                        {event.banner ? (
                                            <img
                                                src={event.banner}
                                                alt={event.title}
                                                className="w-full h-full object-cover mix-blend-multiply"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Calendar className="w-12 h-12 text-gray-300" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <span className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                                                {event.type}
                                            </span>
                                            {event.isSoldOut && (
                                                <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                                                    SOLD OUT
                                                </span>
                                            )}
                                            {event.isSellingFast && !event.isSoldOut && (
                                                <span className="bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                                                    SELLING FAST
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <CardContent className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold text-black mb-3 leading-tight group-hover:text-gray-600 transition-colors">
                                                {event.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm line-clamp-2 mb-6 font-light leading-relaxed">
                                                {event.description}
                                            </p>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-gray-100 mt-auto">
                                            <div className="flex items-center text-sm text-gray-500 font-medium">
                                                <Calendar className="w-4 h-4 mr-3 text-black" />
                                                {new Date(event.startDate).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            {event.type === 'OFFLINE' && event.venue && (
                                                <div className="flex items-center text-sm text-gray-500 font-medium">
                                                    <MapPin className="w-4 h-4 mr-3 text-black" />
                                                    <span className="truncate">{event.venue}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center pt-4">
                                                <span className="text-lg font-medium text-black">
                                                    {event.ticketConfig.currency} {event.ticketConfig.price.toLocaleString()}
                                                </span>
                                                <span className="text-sm font-semibold text-black uppercase tracking-wider group-hover:underline">
                                                    Register &rarr;
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
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
