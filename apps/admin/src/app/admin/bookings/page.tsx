'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, Calendar, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function GlobalBookingsPage() {
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await fetch('/api/admin/bookings');
            const data = await res.json();
            if (data.success) {
                setTickets(data.data);
            } else {
                toast.error(data.error || 'Failed to fetch bookings');
            }
        } catch (error) {
            toast.error('Error fetching bookings');
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = tickets.filter(t => 
        t.buyerDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.buyerDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.event?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-white">Loading Bookings...</div>;

    return (
        <div className="min-h-screen bg-black p-6 space-y-6 text-white text-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#AE8638]">All Bookings</h1>
                    <p className="text-gray-400 text-xs">View all successful ticket bookings across your events.</p>
                </div>
            </div>

            <Card className="bg-neutral-900 border-[#AE8638]/20">
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <Input 
                                placeholder="Search by name, email, booking ref, or event..." 
                                className="pl-10 bg-black border-[#AE8638]/20 text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto rounded-lg border border-white/10">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-black/50 text-[#AE8638] uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Booking Ref</th>
                                    <th className="px-4 py-3 font-medium">Event</th>
                                    <th className="px-4 py-3 font-medium">Buyer</th>
                                    <th className="px-4 py-3 font-medium">Date(s)</th>
                                    <th className="px-4 py-3 font-medium">Amount</th>
                                    <th className="px-4 py-3 font-medium">Purchased On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredTickets.length > 0 ? (
                                    filteredTickets.map((ticket) => (
                                        <tr key={ticket._id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-4 font-mono text-xs">{ticket.bookingReference}</td>
                                            <td className="px-4 py-4 truncate max-w-[200px]">{ticket.event?.title || 'Unknown Event'}</td>
                                            <td className="px-4 py-4">
                                                <div className="font-medium text-white">{ticket.buyerDetails?.name}</div>
                                                <div className="text-xs text-gray-400">{ticket.buyerDetails?.email}</div>
                                                <div className="text-xs text-gray-500">{ticket.buyerDetails?.contact}</div>
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-300">
                                                {ticket.ticketType === 'MULTI_DAY' ? 'Season Pass' : (
                                                    ticket.selectedDates?.map((d: any) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })).join(', ')
                                                )}
                                            </td>
                                            <td className="px-4 py-4 font-bold text-white">
                                                {ticket.pricing?.currency || 'INR'} {(ticket.pricing?.totalAmount || ticket.amountPaid || 0).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-400">
                                                {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                                                    timeZone: 'Asia/Kolkata',
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            No bookings found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
