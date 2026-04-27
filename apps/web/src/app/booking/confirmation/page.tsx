import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import { Navbar } from '@/components/Navbar';
import QRCode from 'qrcode';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PrintButton } from '@/components/PrintButton';

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ id: string }> }) {
    const { id } = await searchParams;
    if (!id) notFound();

    await dbConnect();
    // Populate event to show details
    const ticket = await Ticket.findById(id).populate('event');

    if (!ticket || ticket.paymentStatus !== 'SUCCESS') {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center">
                <h1 className="text-2xl font-bold text-red-500">Ticket not found or payment failed.</h1>
                <Link href="/" className="mt-4 text-blue-500 underline">Go Home</Link>
            </div>
        );
    }

    const qrDataUrl = await QRCode.toDataURL(ticket.qrCodeHash);

    const event = ticket.event;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">
            <Navbar />
            <main className="container max-w-2xl py-12 flex-1">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none">
                    <div className="bg-green-600 p-6 text-center text-white">
                        <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
                        <p className="text-green-100 mt-2">Your ticket has been sent to {ticket.buyerDetails.email}</p>
                    </div>

                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
                            <p className="text-gray-500">{new Date(event.startDate).toLocaleString()} • {event.venue || 'Online'}</p>
                        </div>

                        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border-2 border-dashed border-gray-300 mb-8">
                            <img src={qrDataUrl} alt="Ticket QR" className="w-48 h-48" />
                            <p className="mt-4 text-sm font-mono text-gray-500 tracking-wider">
                                {ticket.bookingReference}
                            </p>
                        </div>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Guest Name</span>
                                <span className="font-medium">{ticket.buyerDetails.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Ticket Type</span>
                                <span className="font-medium">General Entry</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-500">Amount Paid</span>
                                <span className="font-medium">{event.ticketConfig.currency} {ticket.amountPaid}</span>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-3">
                            <PrintButton />
                            <Button variant="outline" asChild className="w-full">
                                <Link href="/">Book Another</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
