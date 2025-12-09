'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, Mail, Download, ArrowLeft, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import { toast } from 'sonner';

export default function UserTicketPage() {
    const params = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState<any>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchTicket();
        }
    }, [params.id]);

    const fetchTicket = async () => {
        try {
            const res = await fetch(`/api/tickets/${params.id}`);
            const data = await res.json();
            if (data.success) {
                setTicket(data.data);
                // Generate QR code
                const qrUrl = await QRCode.toDataURL(data.data.qrCodeHash, {
                    width: 300,
                    margin: 2,
                    color: { dark: '#000000', light: '#ffffff' }
                });
                setQrCodeUrl(qrUrl);
            } else {
                toast.error('Ticket not found');
            }
        } catch (err) {
            toast.error('Failed to load ticket');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (qrCodeUrl) {
            const link = document.createElement('a');
            link.href = qrCodeUrl;
            link.download = `ticket-${ticket._id}.png`;
            link.click();
            toast.success('QR Code downloaded');
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

    if (!ticket) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-xl text-muted-foreground mb-4">Ticket not found</p>
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

                <div className="max-w-2xl mx-auto">
                    <Card className="mb-6">
                        <CardHeader className="text-center bg-gradient-to-r from-primary to-primary/80 text-white">
                            <CardTitle className="text-2xl">Event Ticket</CardTitle>
                            <Badge variant={ticket.isRedeemed ? 'secondary' : 'default'} className="mt-2">
                                {ticket.isRedeemed ? 'USED' : 'VALID'}
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {/* QR Code */}
                            <div className="flex justify-center mb-6">
                                {qrCodeUrl && (
                                    <div className="p-4 bg-white border-4 border-primary rounded-lg">
                                        <img src={qrCodeUrl} alt="Ticket QR Code" className="w-64 h-64" />
                                    </div>
                                )}
                            </div>

                            {/* Event Details */}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold">{ticket.event?.title}</h3>
                                    <p className="text-muted-foreground">{ticket.event?.description}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-2">
                                        <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Event Date</p>
                                            <p className="font-medium">{new Date(ticket.event?.startDate).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {ticket.event?.type === 'OFFLINE' && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Venue</p>
                                                <p className="font-medium">{ticket.event?.venue}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Buyer Details */}
                            <div className="border-t pt-4 space-y-3">
                                <h4 className="font-semibold">Ticket Holder</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <span>{ticket.buyerDetails.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">{ticket.buyerDetails.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="border-t mt-4 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Amount Paid</span>
                                    <span className="text-2xl font-bold text-primary">₹{ticket.amountPaid.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-muted-foreground">Booking ID</span>
                                    <span className="text-sm font-mono">{ticket._id}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex gap-3">
                                <Button onClick={handleDownload} className="flex-1">
                                    <Download className="w-4 h-4 mr-2" /> Download QR Code
                                </Button>
                                <Button variant="outline" onClick={() => window.print()} className="flex-1">
                                    Print Ticket
                                </Button>
                            </div>

                            {ticket.isRedeemed && (
                                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Note:</strong> This ticket has been used on {new Date(ticket.redeemedAt).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Important Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>• Please arrive at least 30 minutes before the event starts</p>
                            <p>• This QR code will be scanned at the venue entrance</p>
                            <p>• Keep this ticket safe and do not share the QR code</p>
                            <p>• Screenshots of this ticket are valid for entry</p>
                            <p>• For any queries, contact support@eventzone.com</p>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
}
