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
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <div className="relative h-auto min-h-[300px] md:h-[450px] w-full bg-gray-100 overflow-hidden flex flex-col border-b border-gray-200">
                <div className="absolute top-24 left-4 z-30 md:top-28">
                    <BackButton className="text-black hover:text-gray-600 bg-white hover:bg-gray-50 p-2 rounded-none transition-colors border border-gray-200 shadow-sm" />
                </div>
                {serializedEvent.banner || serializedEvent.mobileBanner ? (
                    <div className="absolute inset-0 z-0 bg-gray-900">
                        <picture>
                            {serializedEvent.mobileBanner && (
                                <source media="(max-width: 768px)" srcSet={serializedEvent.mobileBanner} />
                            )}
                            <img
                                src={serializedEvent.banner || serializedEvent.mobileBanner}
                                alt={serializedEvent.title}
                                className="w-full h-full object-cover mix-blend-multiply opacity-80"
                            />
                        </picture>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-200 font-bold text-9xl select-none z-0">
                        EVENT
                    </div>
                )}

                <div className="container relative z-20 flex-1 flex flex-col justify-end pb-8 pt-32 md:pb-12 text-white">
                    <span className="bg-white text-black w-fit px-4 py-1.5 rounded-none text-xs font-bold mb-4 uppercase tracking-widest border border-transparent shadow-sm">
                        {serializedEvent.type}
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-medium tracking-tight mb-4 leading-tight">
                        {serializedEvent.title}
                    </h1>
                    <div className="flex flex-wrap gap-y-3 gap-x-8 text-white/90 text-sm md:text-base font-light">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-white" />
                            {new Date(serializedEvent.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        {serializedEvent.type === 'OFFLINE' && (
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-white" />
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
                    <div className="sticky top-24 border border-gray-200 bg-white p-8 shadow-sm rounded-none space-y-6">
                        <div className="flex flex-col gap-2 border-b border-gray-200 pb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Standard Access</span>
                                <span className="text-3xl font-semibold text-black">
                                    {serializedEvent.ticketConfig.currency} {serializedEvent.ticketConfig.price.toLocaleString()}
                                </span>
                            </div>
                            {serializedEvent.ticketConfig.allDayPrice && (
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-gray-500 text-sm font-medium">Full Season Pass</span>
                                    <span className="text-xl font-semibold text-black">
                                        {serializedEvent.ticketConfig.currency} {serializedEvent.ticketConfig.allDayPrice.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {serializedEvent.ticketConfig.offers && serializedEvent.ticketConfig.offers.length > 0 && (
                            <div className="bg-gray-50 border border-gray-200 p-4 rounded-none">
                                <p className="text-xs font-bold uppercase tracking-widest text-black mb-2">Available Incentives</p>
                                <ul className="text-sm text-gray-600 font-light space-y-1">
                                    {serializedEvent.ticketConfig.offers.map((offer: any, idx: number) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <span className="w-1 h-1 bg-black rounded-full" />
                                            {offer.description} ({offer.discountPercentage}% off)
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex flex-col gap-4">
                            <Button size="lg" className="w-full h-14 bg-black text-white hover:bg-gray-800 font-semibold rounded-none" asChild>
                                <Link href={`/checkout/${serializedEvent._id}`}>
                                    <Ticket className="mr-3 w-5 h-5" />
                                    Acquire Allocation
                                </Link>
                            </Button>
                            <p className="text-xs text-center text-gray-400 font-medium">
                                Encrypted transaction via secure gateway.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Gallery Section */}
            {serializedEvent.gallery && serializedEvent.gallery.length > 0 && (
                <div className="w-full pb-16 border-t border-gray-200 pt-16 bg-gray-50">
                    <div className="container mb-8">
                        <h2 className="text-2xl font-semibold text-black">Event Gallery</h2>
                    </div>
                    <EventGallery images={serializedEvent.gallery} />
                </div>
            )}

            <Footer />
        </div>
    );
}
