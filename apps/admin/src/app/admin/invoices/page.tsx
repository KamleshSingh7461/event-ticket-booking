'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Invoice {
    _id: string;
    invoiceNumber: string;
    bookingReference: string;
    event: { title: string };
    user: { name: string; email: string };
    totalAmount: number;
    subtotal: number;
    gstAmount: number;
    status: string;
    createdAt: string;
}

export default function AdminInvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await fetch('/api/admin/invoices');
            const data = await res.json();
            if (data.success) {
                setInvoices(data.data);
            } else {
                toast.error(data.error);
            }
        } catch (err) {
            toast.error('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const filteredInvoices = invoices.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.event?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-[#AE8638]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Invoices</h1>
                    <p className="text-gray-400">Manage and track all fiscal records.</p>
                </div>
                <Button
                    onClick={() => window.open('/api/invoices/bulk-download', '_blank')}
                    className="bg-[#AE8638] text-black hover:bg-[#AE8638]/90 font-bold"
                >
                    <Download className="w-4 h-4 mr-2" /> Bulk Export (PDF)
                </Button>
            </div>

            <div className="flex items-center gap-2 max-w-sm bg-black/40 border border-[#AE8638]/20 rounded-md px-3 py-1">
                <Search className="w-4 h-4 text-gray-500" />
                <Input 
                    placeholder="Search by Invoice #, Ref, Name..." 
                    className="bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-gray-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Card className="bg-black border-[#AE8638]/20 shadow-xl overflow-hidden">
                <CardHeader className="bg-[#AE8638]/5 border-b border-[#AE8638]/10">
                    <CardTitle className="text-white text-lg">Transaction History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-[#AE8638]/10 hover:bg-transparent">
                                    <TableHead className="text-[#AE8638] font-bold">Invoice #</TableHead>
                                    <TableHead className="text-[#AE8638] font-bold">Date</TableHead>
                                    <TableHead className="text-[#AE8638] font-bold">Event</TableHead>
                                    <TableHead className="text-[#AE8638] font-bold">Customer</TableHead>
                                    <TableHead className="text-[#AE8638] font-bold text-right">Subtotal</TableHead>
                                    <TableHead className="text-[#AE8638] font-bold text-right">GST (18%)</TableHead>
                                    <TableHead className="text-[#AE8638] font-bold text-right">Total</TableHead>
                                    <TableHead className="text-[#AE8638] font-bold text-center">Status</TableHead>
                                    <TableHead className="text-[#AE8638] font-bold text-center">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInvoices.length === 0 ? (
                                    <TableRow className="hover:bg-transparent">
                                        <TableCell colSpan={9} className="text-center py-12 text-gray-500 italic">
                                            No invoices found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredInvoices.map((inv) => (
                                        <TableRow key={inv._id} className="border-[#AE8638]/10 hover:bg-[#AE8638]/5 transition-colors">
                                            <TableCell className="font-mono text-xs text-white">
                                                {inv.invoiceNumber}
                                                <div className="text-[10px] text-gray-500">{inv.bookingReference}</div>
                                            </TableCell>
                                            <TableCell className="text-gray-300 text-xs whitespace-nowrap">
                                                {new Date(inv.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-white font-medium min-w-[150px]">
                                                {inv.event?.title || 'Event Deleted'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-xs">
                                                    <span className="text-white font-medium">{inv.user?.name || 'Guest'}</span>
                                                    <span className="text-gray-500">{inv.user?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-gray-400 text-xs">₹{inv.subtotal.toFixed(2)}</TableCell>
                                            <TableCell className="text-right text-gray-400 text-xs">₹{inv.gstAmount.toFixed(2)}</TableCell>
                                            <TableCell className="text-right text-white font-bold">₹{inv.totalAmount.toFixed(2)}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge className="bg-green-900/40 text-green-400 border-green-500/30 hover:bg-green-900/60 uppercase text-[10px]">
                                                    {inv.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-[#AE8638] hover:bg-[#AE8638]/20 h-8 w-8"
                                                    onClick={() => window.open(`/api/invoices/download/${inv._id}`, '_blank')}
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
