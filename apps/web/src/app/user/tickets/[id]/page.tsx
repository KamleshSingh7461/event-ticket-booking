'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, Download, ArrowLeft, Loader2 } from 'lucide-react';
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
            <div className="min-h-screen flex flex-col bg-white">
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-black" />
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-xl text-gray-500 mb-6">Ticket not found</p>
                        <Button onClick={() => router.push('/user/dashboard')} className="rounded-none bg-black text-white hover:bg-gray-800 uppercase tracking-widest text-xs font-bold px-8 h-12">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <main className="flex-1 p-6 md:p-12">
                <Button variant="ghost" className="mb-8 text-gray-500 hover:text-black hover:bg-gray-100 rounded-none uppercase tracking-widest text-xs font-bold" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                <div className="max-w-2xl mx-auto space-y-8">
                    {/* Ticket Card */}
                    <Card className="bg-white border border-gray-200 rounded-none shadow-sm overflow-hidden">
                        {/* Event Banner */}
                        {ticket.event?.banner && (
                            <div className="w-full h-48 sm:h-64 relative border-b border-gray-200">
                                <img
                                    src={ticket.event.banner}
                                    alt={ticket.event.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 mix-blend-multiply"></div>
                                <div className="absolute bottom-6 left-8 right-8">
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">{ticket.event?.title}</h3>
                                    <p className="text-white/90 text-sm line-clamp-1">{ticket.event?.description}</p>
                                </div>
                            </div>
                        )}

                        {!ticket.event?.banner && (
                            <CardHeader className="text-center bg-gray-50 border-b border-gray-200 py-10">
                                <CardTitle className="text-3xl font-bold text-black mb-2">{ticket.event?.title}</CardTitle>
                                <p className="text-gray-500 max-w-md mx-auto">{ticket.event?.description}</p>
                            </CardHeader>
                        )}


                        <CardContent className="pt-10 px-8">
                            {/* Status Badge */}
                            <div className="flex justify-center mb-8">
                                <Badge variant="outline" className={`text-xs font-bold tracking-widest uppercase px-6 py-2 rounded-none border-2 ${ticket.isRedeemed ? 'border-gray-300 text-gray-500 bg-gray-50' : 'border-black text-black bg-white'}`}>
                                    {ticket.isRedeemed ? 'ALREADY SCANNED (USED)' : 'VALID FOR ENTRY'}
                                </Badge>
                            </div>

                            {/* QR Code */}
                            <div className="flex justify-center mb-10">
                                {qrCodeUrl && (
                                    <div className="p-4 bg-white border-2 border-gray-200 rounded-none">
                                        <img src={qrCodeUrl} alt="Ticket QR Code" className="w-64 h-64" />
                                    </div>
                                )}
                            </div>

                            {/* Ticket Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 border-t border-gray-100 pt-10">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-none text-gray-600">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Event Date</p>
                                        <p className="font-semibold text-black text-lg">{new Date(ticket.event?.startDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                    </div>
                                </div>

                                {ticket.event?.type === 'OFFLINE' && (
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-none text-gray-600">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Location</p>
                                            <p className="font-semibold text-black text-lg">{ticket.event?.venue}</p>
                                        </div>
                                    </div>
                                )}

                                {/* New Fields: Entry Time & Validity */}
                                {ticket.event?.entryTime && (
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-none text-gray-600">
                                            <Download className="w-5 h-5 rotate-180" /> {/* Simulating Entry Icon */}
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Entry Starts</p>
                                            <p className="font-semibold text-black text-lg">{ticket.event?.entryTime}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-none text-gray-600">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Pass Type</p>
                                        <p className="font-semibold text-black text-lg">
                                            {/* Deduce Type based on data available if not explicitly stored */}
                                            Season Pass (For all 9 days)
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">{ticket.selectedDates?.length} Day(s) Access</p>
                                    </div>
                                </div>
                            </div>

                            {/* Buyer Info */}
                            <div className="border-t border-gray-100 pt-8 pb-8 space-y-4">
                                <h4 className="font-bold text-black uppercase tracking-widest text-xs mb-4">Ticket Holder</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 border border-gray-200">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Name</p>
                                        <p className="text-black font-semibold">{ticket.buyerDetails.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Email</p>
                                        <p className="text-black font-semibold break-words">{ticket.buyerDetails.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="border-t border-gray-100 pt-8 pb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-500 uppercase tracking-widest text-xs font-bold">Amount Paid</span>
                                    <span className="text-3xl font-black text-black">₹{ticket.amountPaid.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Booking Reference</span>
                                    <span className="text-sm font-mono font-bold text-gray-900">{ticket._id}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-6 border-t border-gray-200">
                                <Button onClick={handleDownload} className="w-full bg-black hover:bg-gray-800 text-white font-bold h-14 rounded-none uppercase tracking-widest text-sm transition-colors">
                                    <Download className="w-5 h-5 mr-3" /> Download Ticket
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-gray-200 rounded-none shadow-sm">
                        <CardHeader className="border-b border-gray-100 pb-4">
                            <CardTitle className="text-black uppercase tracking-widest text-sm font-bold">Important Instructions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-3 text-sm text-gray-600 font-medium">
                            {ticket.event?.entryTime && <p>• Entry begins strictly at <span className="text-black font-bold">{ticket.event?.entryTime}</span>. Early arrivals will not be permitted.</p>}
                            <p>• Please present this QR code at the entrance for verification.</p>
                            <p>• Each ticket allows entry for one person only.</p>
                            <p>• Do not share this QR code. Once scanned, duplicates will be rejected.</p>
                            <p>• Government issued ID proof may be required for verification.</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
