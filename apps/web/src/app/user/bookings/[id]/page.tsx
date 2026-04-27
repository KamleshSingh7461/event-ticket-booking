'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Calendar, MapPin, User, Mail, Phone, CreditCard, ArrowLeft, QrCode, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function UserBookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferData, setTransferData] = useState({ name: '', email: '', phone: '' });

    const handleTransfer = async () => {
        if (!transferData.name || !transferData.email) {
            toast.error('Name and Email are required to transfer.');
            return;
        }
        setIsTransferring(true);
        try {
            const res = await fetch('/api/tickets/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketId: booking._id,
                    newBuyerDetails: transferData
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Ticket Transferred Successfully! The new owner will receive an email shortly.');
                router.push('/user/dashboard');
            } else {
                toast.error(data.error || 'Failed to transfer ticket');
            }
        } catch (error) {
            toast.error('An error occurred while transferring');
        } finally {
            setIsTransferring(false);
        }
    };

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
            <div className="min-h-screen flex flex-col bg-white">
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-black" />
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex flex-col bg-white">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-xl text-gray-500 mb-6">Booking not found</p>
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

                <div className="max-w-4xl mx-auto">
                    <div className="mb-8 border-b border-gray-200 pb-6">
                        <h1 className="text-3xl font-bold mb-2 text-black tracking-tight">Booking Details</h1>
                        <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Booking ID: <span className="font-mono text-gray-900">{booking._id}</span></p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Event Info */}
                            <Card className="rounded-none shadow-sm border border-gray-200 bg-white">
                                <CardHeader className="border-b border-gray-100">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-black uppercase tracking-widest text-sm font-bold">Event Information</CardTitle>
                                        <Badge variant="outline" className={`rounded-none border-2 font-bold tracking-widest text-xs px-3 py-1 uppercase ${booking.event?.type === 'ONLINE' ? 'border-blue-500 text-blue-500' : 'border-black text-black'}`}>
                                            {booking.event?.type}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-black">{booking.event?.title}</h3>
                                        <p className="text-gray-500 mt-2">{booking.event?.description}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 border border-gray-200">
                                        <div className="flex items-start gap-3">
                                            <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Start Date</p>
                                                <p className="font-semibold text-black">{new Date(booking.event?.startDate).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">End Date</p>
                                                <p className="font-semibold text-black">{new Date(booking.event?.endDate).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {booking.event?.type === 'OFFLINE' && (
                                        <div className="flex items-start gap-3 pt-6 border-t border-gray-100">
                                            <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Venue</p>
                                                <p className="font-semibold text-black">{booking.event?.venue}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Buyer Details */}
                            <Card className="rounded-none shadow-sm border border-gray-200 bg-white">
                                <CardHeader className="border-b border-gray-100">
                                    <CardTitle className="text-black uppercase tracking-widest text-sm font-bold">Ticket Holder Information</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-center gap-3">
                                            <User className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Name</p>
                                                <p className="font-semibold text-black">{booking.buyerDetails.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Email</p>
                                                <p className="font-semibold text-black break-all">{booking.buyerDetails.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Phone</p>
                                                <p className="font-semibold text-black">{booking.buyerDetails.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Payment Summary */}
                            <Card className="rounded-none shadow-sm border border-gray-200 bg-white">
                                <CardHeader className="border-b border-gray-100 bg-gray-50">
                                    <CardTitle className="text-black uppercase tracking-widest text-sm font-bold">Payment Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Ticket Price</span>
                                        <span className="font-bold text-black">₹{booking.amountPaid.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-6 flex justify-between items-center">
                                        <span className="text-xs text-gray-900 uppercase tracking-widest font-black">Total Paid</span>
                                        <span className="text-2xl font-black text-black">₹{booking.amountPaid.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 pt-4">
                                        <CreditCard className="w-5 h-5 text-gray-400" />
                                        <Badge variant="outline" className={`rounded-none border-2 font-bold tracking-widest text-xs px-3 py-1 uppercase ${booking.paymentStatus === 'SUCCESS' ? 'border-black text-black bg-white' : 'border-gray-300 text-gray-500'}`}>
                                            {booking.paymentStatus}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Ticket Status */}
                            <Card className="rounded-none shadow-sm border border-gray-200 bg-white">
                                <CardHeader className="border-b border-gray-100">
                                    <CardTitle className="text-black uppercase tracking-widest text-sm font-bold">Ticket Status</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                        <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Status</span>
                                        <Badge variant="outline" className={`rounded-none border-2 font-bold tracking-widest text-xs px-3 py-1 uppercase ${booking.isRedeemed ? 'border-gray-300 text-gray-500' : 'border-black text-black'}`}>
                                            {booking.isRedeemed ? 'Used' : 'Valid'}
                                        </Badge>
                                    </div>
                                    {booking.isRedeemed && (
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold block mb-1">Used On</span>
                                            <span className="text-sm font-medium text-black">{new Date(booking.redeemedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-xs text-gray-500 uppercase tracking-widest font-bold block mb-1">Booked On</span>
                                        <span className="text-sm font-medium text-black">{new Date(booking.createdAt).toLocaleString()}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            {!booking.isRedeemed && (
                                <Card className="rounded-none shadow-sm border border-gray-200 bg-white">
                                    <CardHeader className="border-b border-gray-100 bg-gray-50">
                                        <CardTitle className="text-black uppercase tracking-widest text-sm font-bold">Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-4">
                                        <Link href={`/user/tickets/${booking._id}`} className="block">
                                            <Button className="w-full h-12 rounded-none border-2 border-black bg-white text-black hover:bg-gray-100 font-bold uppercase tracking-widest text-xs">
                                                <QrCode className="w-4 h-4 mr-2" /> View Ticket & QR
                                            </Button>
                                        </Link>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="w-full h-12 rounded-none bg-black text-white hover:bg-gray-800 font-bold uppercase tracking-widest text-xs">
                                                    <Send className="w-4 h-4 mr-2" /> Secure Transfer
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="rounded-none border-gray-200 sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle className="text-xl font-bold text-black uppercase tracking-widest">Transfer Ticket</DialogTitle>
                                                    <DialogDescription className="text-gray-500">
                                                        Transfer this ticket to a friend securely. This action will permanently invalidate your current QR code and send a new Entry OTP & QR Code directly to their email.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-6 py-6 border-y border-gray-100 my-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs uppercase tracking-widest font-bold text-black">Friend's Full Name</Label>
                                                        <Input 
                                                            className="rounded-none border-gray-200 h-12 focus-visible:ring-1 focus-visible:ring-black"
                                                            placeholder="John Doe" 
                                                            value={transferData.name} 
                                                            onChange={e => setTransferData({ ...transferData, name: e.target.value })} 
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs uppercase tracking-widest font-bold text-black">Friend's Email</Label>
                                                        <Input 
                                                            className="rounded-none border-gray-200 h-12 focus-visible:ring-1 focus-visible:ring-black"
                                                            type="email" 
                                                            placeholder="john@example.com" 
                                                            value={transferData.email} 
                                                            onChange={e => setTransferData({ ...transferData, email: e.target.value })} 
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs uppercase tracking-widest font-bold text-black">Friend's Phone (Optional)</Label>
                                                        <Input 
                                                            className="rounded-none border-gray-200 h-12 focus-visible:ring-1 focus-visible:ring-black"
                                                            type="tel" 
                                                            placeholder="+1 234 567 8900" 
                                                            value={transferData.phone} 
                                                            onChange={e => setTransferData({ ...transferData, phone: e.target.value })} 
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button 
                                                        onClick={handleTransfer} 
                                                        disabled={isTransferring} 
                                                        className="w-full h-12 rounded-none bg-black text-white hover:bg-gray-800 font-bold uppercase tracking-widest text-xs"
                                                    >
                                                        {isTransferring ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Confirm Transfer'}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
