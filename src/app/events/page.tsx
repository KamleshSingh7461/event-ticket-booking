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

async function getEvents() {
    await dbConnect();
    const events = await Event.find({ isActive: true })
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

export default async function EventsPage() {
    const events = await getEvents();

    return (
        <div className="min-h-screen flex flex-col bg-black">
            <Navbar />

            {/* Hero Section */}
            <div className="relative bg-black text-white overflow-hidden border-b border-[#AE8638]/20">
                <div className="absolute inset-0 bg-[#AE8638]/5 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                <div className="container relative z-10 py-16 md:py-24 flex flex-col items-center text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg text-white">
                        Discover & <span className="text-[#AE8638]">Experience</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-8 drop-shadow-md">
                        Book tickets for the biggest sports events, concerts, and workshops happening around you.
                    </p>

                    {/* Simulated Search Bar */}
                    <div className="w-full max-w-md flex gap-2 p-1 bg-white/5 backdrop-blur-md rounded-full border border-[#AE8638]/30 shadow-[0_0_20px_rgba(174,134,56,0.1)] hover:border-[#AE8638]/50 transition-colors">
                        <div className="flex-1 flex items-center px-4">
                            <Search className="w-5 h-5 text-[#AE8638] mr-2" />
                            <input
                                type="text"
                                placeholder="Search events..."
                                className="bg-transparent border-none outline-none text-white placeholder:text-gray-500 w-full"
                            />
                        </div>
                        <Button className="rounded-full px-6 bg-[#AE8638] text-black hover:bg-[#AE8638]/90 font-bold">Find</Button>
                    </div>
                </div>
            </div>

            <main className="flex-1 container py-12 md:py-16 relative z-20">
                {/* Events Grid */}
                {events.length === 0 ? (
                    <div className="text-center py-20 bg-black rounded-2xl border border-[#AE8638]/30">
                        <div className="w-16 h-16 bg-[#AE8638]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#AE8638]/20">
                            <Calendar className="w-8 h-8 text-[#AE8638]" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Events</h3>
                        <p className="text-gray-400 mb-6">Check back later for new announcements.</p>
                        <Link href="/">
                            <Button variant="outline" className="border-[#AE8638] text-[#AE8638] hover:bg-[#AE8638] hover:text-black">Back to Home</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event: any) => (
                            <Link href={event.isSoldOut ? '#' : `/events/${event._id}`} key={event._id} className={`group ${event.isSoldOut ? 'cursor-not-allowed opacity-70 grayscale' : ''}`}>
                                <Card className="h-full border border-[#AE8638]/20 bg-black hover:border-[#AE8638] hover:shadow-[0_0_20px_rgba(174,134,56,0.15)] transition-all duration-300 overflow-hidden flex flex-col transform hover:-translate-y-1">
                                    {/* Image Section */}
                                    <div className="relative h-56 w-full overflow-hidden bg-gray-900 border-b border-[#AE8638]/10">
                                        {event.banner ? (
                                            <img
                                                src={event.banner}
                                                alt={event.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-[#AE8638]/20 flex items-center justify-center">
                                                <Calendar className="w-16 h-16 text-[#AE8638]/20" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4">
                                            <Badge className="bg-black/80 backdrop-blur-md border border-[#AE8638]/50 text-[#AE8638] font-bold shadow-lg">
                                                {event.ticketConfig.currency} {event.ticketConfig.price}
                                            </Badge>
                                        </div>
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <Badge className={event.type === 'ONLINE' ? 'bg-green-900/80 text-green-400 border-green-500/50' : 'bg-[#AE8638]/80 text-black font-bold border-[#AE8638]'}>
                                                {event.type}
                                            </Badge>
                                            {event.isSoldOut && (
                                                <Badge className="bg-red-600 text-white font-bold border-red-500 animate-pulse">
                                                    SOLD OUT
                                                </Badge>
                                            )}
                                            {event.isSellingFast && !event.isSoldOut && (
                                                <Badge className="bg-orange-500 text-white font-bold border-orange-400 animate-pulse">
                                                    SELLING FAST 🔥
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <CardContent className="flex-1 p-6">
                                        <div className="flex items-center gap-2 text-sm text-[#AE8638] font-medium mb-2">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(event.startDate).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-[#AE8638] transition-colors">
                                            {event.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                                            {event.description}
                                        </p>

                                        {event.type === 'OFFLINE' && event.venue && (
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                                <MapPin className="w-4 h-4 text-gray-600" />
                                                <span className="truncate">{event.venue}</span>
                                            </div>
                                        )}
                                    </CardContent>

                                    <CardFooter className="p-6 pt-0 mt-auto">
                                        <div className="w-full pt-4 border-t border-[#AE8638]/20 flex items-center justify-between text-gray-400 group-hover:text-[#AE8638] transition-colors">
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
