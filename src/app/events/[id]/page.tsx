import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import BackButton from '@/components/BackButton';
import EventGallery from '@/components/EventGallery';
import EventDetailsTabs from '@/components/EventDetailsTabs';

async function getEvent(id: string) {
    await dbConnect();
    try {
        console.log('Fetching event with ID:', id);
        const event = await Event.findById(id).lean();
        if (!event) {
            console.log('Event not found in DB');
            return null;
        }
        return event;
    } catch (error) {
        return null;
    }
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) {
        notFound();
    }

    // Workaround for serialization issue with Mongoose lean() dates and ObjectIds
    const serializedEvent = {
        ...event,
        _id: event._id.toString(),
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        venueManager: event.venueManager?.toString(),
        subHeadings: event.subHeadings?.map((sub: any) => ({
            ...sub,
            _id: sub._id?.toString(),
        })),
        ticketConfig: {
            ...event.ticketConfig,
            offers: event.ticketConfig?.offers?.map((offer: any) => ({
                ...offer,
                _id: offer._id?.toString(),
            })),
        },
    };

    return (
        <div className="min-h-screen flex flex-col bg-black">
            <Navbar />
            <div className="relative h-auto min-h-[300px] md:h-[450px] w-full bg-black overflow-hidden flex flex-col relative">
                <div className="absolute top-24 left-4 z-30 md:top-28">
                    <BackButton className="text-[#AE8638] hover:text-[#AE8638]/80 bg-black/40 hover:bg-black/60 p-2 rounded-full transition-colors backdrop-blur-sm border border-[#AE8638]/20" />
                </div>
                {serializedEvent.banner ? (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={serializedEvent.banner}
                            alt={serializedEvent.title}
                            className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#AE8638]/10 font-bold text-9xl select-none bg-black z-0">
                        EVENT
                    </div>
                )}

                <div className="container relative z-20 flex-1 flex flex-col justify-end pb-8 pt-32 md:pb-12">
                    <span className="bg-[#AE8638] text-black w-fit px-3 py-1 rounded-full text-xs md:text-sm font-bold mb-3 md:mb-4 shadow-lg uppercase tracking-wider">
                        {serializedEvent.type}
                    </span>
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-3 md:mb-6 leading-tight drop-shadow-xl">
                        {serializedEvent.title}
                    </h1>
                    <div className="flex flex-wrap gap-y-3 gap-x-6 text-white/90 text-sm md:text-lg font-medium">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#AE8638]" />
                            {new Date(serializedEvent.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        {serializedEvent.type === 'OFFLINE' && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-[#AE8638]" />
                                {serializedEvent.venue}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <main className="container py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <EventDetailsTabs
                        description={serializedEvent.description}
                        schedule={serializedEvent.schedule || []}
                        subHeadings={serializedEvent.subHeadings || []}
                    />
                </div>

                {/* Sidebar / Booking Card */}
                <div className="relative">
                    <div className="sticky top-24 rounded-2xl border border-[#AE8638]/20 bg-black p-6 shadow-xl shadow-[#AE8638]/5 space-y-6">
                        <div className="flex flex-col gap-2 border-b border-[#AE8638]/10 pb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Price per ticket</span>
                                <span className="text-3xl font-bold text-[#AE8638]">
                                    {serializedEvent.ticketConfig.currency} {serializedEvent.ticketConfig.price}
                                </span>
                            </div>
                            {serializedEvent.ticketConfig.allDayPrice && (
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-gray-400 text-sm">All Day Pass</span>
                                    <span className="text-xl font-bold text-[#AE8638]">
                                        {serializedEvent.ticketConfig.currency} {serializedEvent.ticketConfig.allDayPrice}
                                    </span>
                                </div>
                            )}
                        </div>

                        {serializedEvent.ticketConfig.offers && serializedEvent.ticketConfig.offers.length > 0 && (
                            <div className="bg-[#AE8638]/10 border border-[#AE8638]/20 p-3 rounded-lg">
                                <p className="text-sm text-[#AE8638] font-medium">Offers Available:</p>
                                <ul className="text-sm text-[#AE8638]/80">
                                    {serializedEvent.ticketConfig.offers.map((offer: any, idx: number) => (
                                        <li key={idx}>{offer.description} ({offer.discountPercentage}% off)</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex flex-col gap-4">
                            <Button size="lg" className="w-full text-lg h-12 bg-[#AE8638] text-black hover:bg-[#AE8638]/90 font-bold" asChild>
                                <Link href={`/checkout/${serializedEvent._id}`}>
                                    <Ticket className="mr-2 w-5 h-5" />
                                    Book Tickets Now
                                </Link>
                            </Button>
                            <p className="text-xs text-center text-gray-500">
                                Secure payment via PayU. Instant confirmation.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Gallery Section */}
            {serializedEvent.gallery && serializedEvent.gallery.length > 0 && (
                <div className="w-full pb-12 border-t border-[#AE8638]/20 pt-10 bg-black">
                    <EventGallery images={serializedEvent.gallery} />
                </div>
            )}

            <Footer />
        </div>
    );
}
