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
        <div className="min-h-screen flex flex-col bg-black">
            <Navbar />

            <main className="flex-1 container py-8">
                <Button variant="ghost" className="mb-6 text-[#AE8638] hover:text-white hover:bg-[#AE8638]/20" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                <div className="max-w-2xl mx-auto">
                    {/* Ticket Card */}
                    <Card className="mb-6 bg-black border border-[#AE8638] overflow-hidden shadow-[0_0_20px_rgba(174,134,56,0.3)]">
                        {/* Event Banner */}
                        {ticket.event?.banner && (
                            <div className="w-full h-48 sm:h-64 relative">
                                <img
                                    src={ticket.event.banner}
                                    alt={ticket.event.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                                <div className="absolute bottom-4 left-6 right-6">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1 shadow-black drop-shadow-lg">{ticket.event?.title}</h3>
                                    <p className="text-white/80 text-sm shadow-black drop-shadow-md line-clamp-1">{ticket.event?.description}</p>
                                </div>
                            </div>
                        )}

                        {!ticket.event?.banner && (
                            <CardHeader className="text-center bg-[#AE8638] text-black">
                                <CardTitle className="text-2xl font-bold">{ticket.event?.title}</CardTitle>
                                <p className="text-sm opacity-90">{ticket.event?.description}</p>
                            </CardHeader>
                        )}


                        <CardContent className="pt-8">
                            {/* Status Badge */}
                            <div className="flex justify-center mb-6">
                                <Badge variant="outline" className={`text-base px-4 py-1 ${ticket.isRedeemed ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-green-500 text-green-500 bg-green-500/10'}`}>
                                    {ticket.isRedeemed ? 'ALREADY SCANNED (USED)' : 'VALID FOR ENTRY'}
                                </Badge>
                            </div>

                            {/* QR Code */}
                            <div className="flex justify-center mb-8 relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#AE8638]/20 to-transparent blur-xl"></div>
                                {qrCodeUrl && (
                                    <div className="p-4 bg-white border-4 border-[#AE8638] rounded-lg relative z-10 shadow-lg">
                                        <img src={qrCodeUrl} alt="Ticket QR Code" className="w-64 h-64" />
                                    </div>
                                )}
                            </div>

                            {/* Ticket Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-white px-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-[#AE8638]/20 rounded-lg text-[#AE8638]">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Event Date</p>
                                        <p className="font-semibold text-lg">{new Date(ticket.event?.startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>

                                {ticket.event?.type === 'OFFLINE' && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-[#AE8638]/20 rounded-lg text-[#AE8638]">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Location</p>
                                            <p className="font-semibold text-lg">{ticket.event?.venue}</p>
                                        </div>
                                    </div>
                                )}

                                {/* New Fields: Entry Time & Validity */}
                                {ticket.event?.entryTime && (
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-[#AE8638]/20 rounded-lg text-[#AE8638]">
                                            <Download className="w-5 h-5 rotate-180" /> {/* Simulating Entry Icon */}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Entry Starts</p>
                                            <p className="font-semibold text-lg">{ticket.event?.entryTime}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-[#AE8638]/20 rounded-lg text-[#AE8638]">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Pass Type</p>
                                        <p className="font-semibold text-lg">
                                            {/* Deduce Type based on data available if not explicitly stored */}
                                            All Access Pass
                                        </p>
                                        <p className="text-xs text-[#AE8638]">{ticket.selectedDates?.length} Day(s) Access</p>
                                    </div>
                                </div>
                            </div>

                            {/* Buyer Info */}
                            <div className="border-t border-[#AE8638]/20 pt-6 space-y-3 px-4">
                                <h4 className="font-semibold text-[#AE8638] mb-2">Ticket Holder</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Name</p>
                                        <p className="text-white">{ticket.buyerDetails.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="text-white break-words">{ticket.buyerDetails.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="border-t border-[#AE8638]/20 mt-6 pt-6 px-4 pb-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Amount Paid</span>
                                    <span className="text-3xl font-bold text-[#AE8638]">₹{ticket.amountPaid.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-gray-500">Booking ID</span>
                                    <span className="text-xs font-mono text-gray-600">{ticket._id}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 p-6 bg-[#AE8638]/5">
                                <Button onClick={handleDownload} className="flex-1 bg-[#AE8638] hover:bg-[#AE8638]/90 text-black font-semibold">
                                    <Download className="w-4 h-4 mr-2" /> Download
                                </Button>
                                {/* Print can wait or be secondary */}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-black border border-[#AE8638]/20">
                        <CardHeader>
                            <CardTitle className="text-[#AE8638]">Important Instructions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-gray-400">
                            {ticket.event?.entryTime && <p>• Entry begins strictly at <span className="text-white font-bold">{ticket.event?.entryTime}</span>. Early arrivals will not be permitted.</p>}
                            <p>• Please present this QR code at the entrance for verification.</p>
                            <p>• Each ticket allows entry for one person only.</p>
                            <p>• Do not share this QR code. Once scanned, duplicates will be rejected.</p>
                            <p>• Government issued ID proof may be required for verification.</p>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
}
