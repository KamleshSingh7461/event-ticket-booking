'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, Mail, Phone, CreditCard, ArrowLeft, QrCode, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function UserBookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchBooking();
        }
    }, [params.id]);

    const fetchBooking = async () => {
        try {
            const res = await fetch(`/api/tickets/${params.id}`);
            const data = await res.json();
            if (data.success) {
                setBooking(data.data);
            } else {
                toast.error('Booking not found');
            }
        } catch (err) {
            toast.error('Failed to load booking');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                <Footer />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-xl text-muted-foreground mb-4">Booking not found</p>
                        <Button onClick={() => router.push('/user/dashboard')}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                        </Button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <main className="flex-1 container py-8">
                <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold mb-2">Booking Details</h1>
                        <p className="text-muted-foreground">Booking ID: {booking._id}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Event Info */}
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle>Event Information</CardTitle>
                                        <Badge variant={booking.event?.type === 'ONLINE' ? 'secondary' : 'default'}>
                                            {booking.event?.type}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold">{booking.event?.title}</h3>
                                        <p className="text-muted-foreground mt-1">{booking.event?.description}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-2">
                                            <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Start Date</p>
                                                <p className="font-medium">{new Date(booking.event?.startDate).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">End Date</p>
                                                <p className="font-medium">{new Date(booking.event?.endDate).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {booking.event?.type === 'OFFLINE' && (
                                        <div className="flex items-start gap-2 pt-2 border-t">
                                            <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Venue</p>
                                                <p className="font-medium">{booking.event?.venue}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Buyer Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ticket Holder Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Name</p>
                                                <p className="font-medium">{booking.buyerDetails.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="font-medium">{booking.buyerDetails.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Phone</p>
                                                <p className="font-medium">{booking.buyerDetails.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Payment Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Ticket Price</span>
                                        <span className="font-medium">₹{booking.amountPaid.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between">
                                        <span className="font-semibold">Total Paid</span>
                                        <span className="text-xl font-bold text-primary">₹{booking.amountPaid.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                                        <Badge variant={booking.paymentStatus === 'SUCCESS' ? 'default' : 'secondary'}>
                                            {booking.paymentStatus}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Ticket Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ticket Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span>Status</span>
                                        <Badge variant={booking.isRedeemed ? 'secondary' : 'default'}>
                                            {booking.isRedeemed ? 'Used' : 'Valid'}
                                        </Badge>
                                    </div>
                                    {booking.isRedeemed && (
                                        <div className="text-sm text-muted-foreground">
                                            Used on: {new Date(booking.redeemedAt).toLocaleString()}
                                        </div>
                                    )}
                                    <div className="text-sm text-muted-foreground">
                                        Booked on: {new Date(booking.createdAt).toLocaleString()}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            {!booking.isRedeemed && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Link href={`/user/tickets/${booking._id}`}>
                                            <Button className="w-full">
                                                <QrCode className="w-4 h-4 mr-2" /> View Ticket & QR Code
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
