import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import BackButton from '@/components/BackButton';

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

    // Workaround for serialization issue with Mongoose lean() dates if passed to Client Components directly
    // But here we are in a Server Component so it's fine to process them.
    const serializedEvent = {
        ...event,
        _id: event._id.toString(),
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        venueManager: event.venueManager?.toString(),
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="relative h-auto min-h-[300px] md:h-[450px] w-full bg-slate-900 overflow-hidden flex flex-col relative">
                <div className="absolute top-24 left-4 z-30 md:top-28">
                    <BackButton className="text-white hover:text-white/80 bg-black/20 hover:bg-black/40 p-2 rounded-full transition-colors backdrop-blur-sm" />
                </div>
                {serializedEvent.banner ? (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={serializedEvent.banner}
                            alt={serializedEvent.title}
                            className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/10 font-bold text-9xl select-none bg-slate-900 z-0">
                        EVENT
                    </div>
                )}

                <div className="container relative z-20 flex-1 flex flex-col justify-end pb-8 pt-32 md:pb-12">
                    <span className="bg-primary text-white w-fit px-3 py-1 rounded-full text-xs md:text-sm font-bold mb-3 md:mb-4 shadow-lg uppercase tracking-wider">
                        {serializedEvent.type}
                    </span>
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-3 md:mb-6 leading-tight drop-shadow-lg">
                        {serializedEvent.title}
                    </h1>
                    <div className="flex flex-wrap gap-y-3 gap-x-6 text-white/90 text-sm md:text-lg font-medium">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            {new Date(serializedEvent.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        {serializedEvent.type === 'OFFLINE' && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                                {serializedEvent.venue}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <main className="container py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">About the Event</h2>
                        <div className="prose dark:prose-invert max-w-none">
                            <p>{serializedEvent.description}</p>
                        </div>
                    </section>

                    {serializedEvent.subHeadings?.map((sub: any, idx: number) => (
                        <section key={idx}>
                            <h3 className="text-xl font-bold mb-2">{sub.title}</h3>
                            <p className="text-muted-foreground">{sub.content}</p>
                        </section>
                    ))}
                </div>

                {/* Sidebar / Booking Card */}
                <div className="relative">
                    <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-muted-foreground">Price per ticket</span>
                            <span className="text-3xl font-bold">
                                {serializedEvent.ticketConfig.currency} {serializedEvent.ticketConfig.price}
                            </span>
                        </div>

                        {serializedEvent.ticketConfig.offers && serializedEvent.ticketConfig.offers.length > 0 && (
                            <div className="mb-6 bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                                <p className="text-sm text-green-600 font-medium">Offers Available:</p>
                                <ul className="text-sm text-green-700">
                                    {serializedEvent.ticketConfig.offers.map((offer: any, idx: number) => (
                                        <li key={idx}>{offer.description} ({offer.discountPercentage}% off)</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex flex-col gap-4">
                            <Button size="lg" className="w-full text-lg h-12" asChild>
                                <Link href={`/checkout/${serializedEvent._id}`}>
                                    <Ticket className="mr-2 w-5 h-5" />
                                    Book Tickets Now
                                </Link>
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                                Secure payment via PayU. Instant confirmation.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
