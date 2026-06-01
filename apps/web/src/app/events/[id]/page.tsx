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
        banner: event.banner || null,
        mobileBanner: event.mobileBanner || null,
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
        <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white selection:bg-[#AE8638] selection:text-black">
            <Navbar />
            
            <div className="relative h-auto min-h-[300px] md:h-[500px] w-full bg-black overflow-hidden flex flex-col border-b border-white/5">
                <div className="absolute top-24 left-4 z-30 md:top-28">
                    <BackButton className="text-white hover:text-black bg-white/10 backdrop-blur-md hover:bg-[#AE8638] p-2 rounded-full transition-colors border border-white/20 shadow-lg" />
                </div>
                {serializedEvent.banner || serializedEvent.mobileBanner ? (
                    <div className="absolute inset-0 z-0 bg-black">
                        <picture>
                            {serializedEvent.mobileBanner && (
                                <source media="(max-width: 768px)" srcSet={serializedEvent.mobileBanner} />
                            )}
                            <img
                                src={serializedEvent.banner || serializedEvent.mobileBanner}
                                alt={serializedEvent.title}
                                className="w-full h-full object-cover mix-blend-screen opacity-50"
                            />
                        </picture>
                        {/* Gradient Fade to Background */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center z-0 overflow-hidden">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full max-h-[300px] bg-[#AE8638]/20 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />
                    </div>
                )}

                <div className="container relative z-20 flex-1 flex flex-col justify-end pb-12 pt-32 text-white">
                    <span className="bg-[#AE8638]/20 text-[#AE8638] border border-[#AE8638]/50 backdrop-blur-md w-fit px-4 py-1.5 rounded-full text-xs font-bold mb-6 uppercase tracking-widest shadow-[0_0_15px_rgba(174,134,56,0.3)]">
                        {serializedEvent.type}
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 leading-tight max-w-4xl">
                        {serializedEvent.title}
                    </h1>
                    <div className="flex flex-wrap gap-y-4 gap-x-8 text-gray-300 text-sm md:text-base font-medium">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-[#AE8638]" />
                            {new Date(serializedEvent.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        {serializedEvent.type === 'OFFLINE' && (
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-[#AE8638]" />
                                {serializedEvent.venue}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <main className="container py-16 grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-20">
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
                    <div className="sticky top-28 bg-[#111111] border border-white/10 p-8 shadow-[0_0_30px_rgba(174,134,56,0.1)] rounded-2xl space-y-8 backdrop-blur-xl">
                        <div className="flex flex-col gap-2 border-b border-white/10 pb-8">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-medium">Standard Access</span>
                                <span className="text-4xl font-bold text-white">
                                    {serializedEvent.ticketConfig.currency || '₹'} {
                                        serializedEvent.ticketConfig.price === 0 && serializedEvent.dailyConfig?.some((c: any) => c.price !== undefined && c.price !== null && c.price > 0)
                                            ? 'Prices Vary'
                                            : serializedEvent.ticketConfig.price.toLocaleString()
                                    }
                                </span>
                            </div>
                            {serializedEvent.ticketConfig.allDayPrice && (
                                <div className="flex justify-between items-center pt-4">
                                    <span className="text-gray-400 text-sm font-medium">Full Season Pass</span>
                                    <span className="text-2xl font-bold text-white">
                                        {serializedEvent.ticketConfig.currency || '₹'} {serializedEvent.ticketConfig.allDayPrice.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {serializedEvent.ticketConfig.offers && serializedEvent.ticketConfig.offers.length > 0 && (
                            <div className="bg-[#AE8638]/5 border border-[#AE8638]/20 p-5 rounded-xl">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#AE8638] mb-3">Available Incentives</p>
                                <ul className="text-sm text-gray-300 font-light space-y-2">
                                    {serializedEvent.ticketConfig.offers.map((offer: any, idx: number) => (
                                        <li key={idx} className="flex items-center gap-3">
                                            <span className="w-1.5 h-1.5 bg-[#AE8638] rounded-full shadow-[0_0_5px_#AE8638]" />
                                            {offer.description} <span className="font-bold text-white">({offer.discountPercentage}% off)</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex flex-col gap-4 pt-4">
                            <Button size="lg" className="w-full h-16 bg-[#AE8638] text-black hover:bg-[#F7EF8A] font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(174,134,56,0.4)] hover:shadow-[0_0_30px_rgba(174,134,56,0.6)] transition-all" asChild>
                                <Link href={`/checkout/${serializedEvent._id}`}>
                                    <Ticket className="mr-3 w-6 h-6" />
                                    Acquire Allocation
                                </Link>
                            </Button>
                            <p className="text-xs text-center text-gray-500 font-medium tracking-wide uppercase">
                                Encrypted transaction via secure gateway.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Gallery Section */}
            {serializedEvent.gallery && serializedEvent.gallery.length > 0 && (
                <div className="w-full pb-24 border-t border-white/5 pt-20 bg-black/50">
                    <div className="container mb-12">
                        <h2 className="text-3xl font-bold text-white tracking-tight">Event <span className="text-[#AE8638]">Gallery</span></h2>
                    </div>
                    <EventGallery images={serializedEvent.gallery} />
                </div>
            )}

            <Footer />
        </div>
    );
}
