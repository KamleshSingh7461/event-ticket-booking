import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Search, ArrowRight } from 'lucide-react';
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
        <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white selection:bg-[#AE8638] selection:text-black">
            <Navbar />

            {/* Premium Hero Section */}
            <div className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden border-b border-white/5">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-[#AE8638]/10 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="container flex flex-col items-center text-center max-w-4xl mx-auto px-4 relative z-10">
                    <div className="inline-flex items-center gap-2 border border-[#AE8638]/30 bg-[#AE8638]/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#AE8638] mb-8">
                        Event Directory
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 text-white leading-tight">
                        Global Engagements
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 mb-12 font-light max-w-2xl">
                        Discover and register for industry-leading conferences, seminars, and exclusive corporate events worldwide.
                    </p>

                    {/* Glassmorphism Search Bar */}
                    <div className="w-full max-w-2xl relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#AE8638]/40 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                        <form action="/events" method="GET" className="relative flex flex-col sm:flex-row items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-2 gap-2 shadow-2xl">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="search"
                                    defaultValue={search || ''}
                                    placeholder="Search by event name, location, or keyword..."
                                    className="w-full pl-12 h-14 text-lg bg-transparent border-none text-white placeholder:text-gray-500 focus-visible:ring-0 outline-none rounded-lg"
                                />
                            </div>
                            <Button type="submit" className="w-full sm:w-auto h-14 px-8 bg-[#AE8638] hover:bg-[#F7EF8A] text-black font-bold text-base rounded-lg transition-colors shadow-[0_0_20px_rgba(174,134,56,0.3)]">
                                Search
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            <main className="flex-1 container py-16 md:py-24 relative z-20">
                {/* Events Grid */}
                {events.length === 0 ? (
                    <div className="text-center py-24 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-[0_0_30px_rgba(174,134,56,0.1)]">
                            <Calendar className="w-8 h-8 text-[#AE8638]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">No Active Events Found</h3>
                        <p className="text-gray-400 mb-8 font-light">The schedule is currently clear for your search parameters.</p>
                        <Link href="/events">
                            <Button variant="outline" className="border-white/20 text-white bg-transparent hover:bg-white/10 rounded-xl font-bold px-8 h-12 uppercase tracking-widest text-xs">Clear Search</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event: any) => (
                            <Link href={event.isSoldOut ? '#' : `/events/${event._id}`} key={event._id} className={event.isSoldOut ? 'cursor-not-allowed opacity-60' : 'group'}>
                                <Card className="h-full bg-[#111111] border border-white/10 hover:border-[#AE8638]/50 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-[0_10px_40px_rgba(174,134,56,0.15)] flex flex-col hover:-translate-y-2">
                                    <div className="relative h-64 overflow-hidden bg-black">
                                        {event.banner ? (
                                            <img
                                                src={event.banner}
                                                alt={event.title}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                                                <Calendar className="w-12 h-12 text-[#AE8638]/50" />
                                            </div>
                                        )}
                                        
                                        {/* Gradient Overlay for text legibility */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-80" />

                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <span className="bg-black/60 backdrop-blur-md border border-white/10 text-[#AE8638] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                                                {event.type}
                                            </span>
                                            {event.isSoldOut && (
                                                <span className="bg-red-950/80 backdrop-blur-md border border-red-500/50 text-red-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                                                    Sold Out
                                                </span>
                                            )}
                                            {event.isSellingFast && !event.isSoldOut && (
                                                <span className="bg-orange-900/80 backdrop-blur-md border border-orange-500/50 text-orange-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                                                    Selling Fast
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <CardContent className="p-8 flex-1 flex flex-col justify-between relative z-10 bg-[#111111]">
                                        <div>
                                            <h3 className="font-bold text-2xl text-white leading-tight mb-4 group-hover:text-[#AE8638] transition-colors">
                                                {event.title}
                                            </h3>
                                            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                                                {event.description}
                                            </p>
                                        </div>
                                        
                                        <div className="space-y-4 pt-6 mt-6 border-t border-white/10">
                                            <div className="flex items-center text-sm text-gray-400">
                                                <Calendar className="w-4 h-4 mr-3 text-[#AE8638]" />
                                                {new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                            {event.type === 'OFFLINE' && (
                                                <div className="flex items-center text-sm text-gray-400">
                                                    <MapPin className="w-4 h-4 mr-3 text-[#AE8638]" />
                                                    <span className="truncate">{event.venue}</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between items-center pt-4">
                                                <span className="text-2xl font-bold text-white">
                                                    {event.ticketConfig?.currency || '₹'} {event.ticketConfig?.price?.toLocaleString()}
                                                </span>
                                                {!event.isSoldOut && (
                                                   <div className="w-10 h-10 rounded-full border border-[#AE8638]/30 flex items-center justify-center group-hover:bg-[#AE8638] group-hover:text-black transition-colors">
                                                     <ArrowRight className="w-5 h-5" />
                                                   </div>
                                                )}
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
