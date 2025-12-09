import { notFound } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Ticket as TicketIcon, IndianRupee, ArrowLeft, Edit } from 'lucide-react';

async function getEventDetails(id: string) {
    await dbConnect();

    const event = await Event.findById(id).lean();
    if (!event) return null;

    // Get ticket statistics
    const tickets = await Ticket.find({ event: id });
    const totalTickets = tickets.length;
    const soldTickets = tickets.filter(t => t.paymentStatus === 'SUCCESS').length;
    const revenue = tickets
        .filter(t => t.paymentStatus === 'SUCCESS')
        .reduce((sum, t) => sum + t.amountPaid, 0);

    return {
        event: {
            ...event,
            _id: event._id.toString(),
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
            venueManager: event.venueManager?.toString()
        },
        stats: {
            totalTickets,
            soldTickets,
            revenue
        }
    };
}

export default async function VenueManagerEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getEventDetails(id);

    if (!data) {
        notFound();
    }

    const { event, stats } = data;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="container mx-auto px-6 py-4">
                    <Link href="/venue-manager/events">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Events
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Event Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                            <div className="flex items-center gap-3">
                                <Badge variant={event.isActive ? 'default' : 'secondary'}>
                                    {event.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                <Badge variant={event.type === 'ONLINE' ? 'secondary' : 'default'}>
                                    {event.type}
                                </Badge>
                            </div>
                        </div>
                        <Link href={`/venue-manager/events/${event._id}/edit`}>
                            <Button>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Event
                            </Button>
                        </Link>
                    </div>
                    <p className="text-muted-foreground">{event.description}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
                            <TicketIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.soldTickets}</div>
                            <p className="text-xs text-muted-foreground">
                                {event.ticketConfig.quantity ? `of ${event.ticketConfig.quantity}` : 'Total sold'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                            <IndianRupee className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">Total earnings</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Attendees</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalTickets}</div>
                            <p className="text-xs text-muted-foreground">Total registrations</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Event Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Event Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Start Date</p>
                                    <p className="font-medium">{new Date(event.startDate).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">End Date</p>
                                    <p className="font-medium">{new Date(event.endDate).toLocaleString()}</p>
                                </div>
                            </div>
                            {event.type === 'OFFLINE' && event.venue && (
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Venue</p>
                                        <p className="font-medium">{event.venue}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ticket Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Price</p>
                                <p className="text-2xl font-bold">
                                    {event.ticketConfig.currency} {event.ticketConfig.price}
                                </p>
                            </div>
                            {event.ticketConfig.quantity && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Capacity</p>
                                    <p className="font-medium">{event.ticketConfig.quantity} tickets</p>
                                </div>
                            )}
                            {event.ticketConfig.offers && event.ticketConfig.offers.length > 0 && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Active Offers</p>
                                    {event.ticketConfig.offers.map((offer: any, idx: number) => (
                                        <div key={idx} className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                                            <p className="font-medium">{offer.code}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {offer.discountPercentage}% off - {offer.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Sections */}
                {event.subHeadings && event.subHeadings.length > 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {event.subHeadings.map((section: any, idx: number) => (
                                <div key={idx}>
                                    <h3 className="font-semibold mb-1">{section.title}</h3>
                                    <p className="text-sm text-muted-foreground">{section.content}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
