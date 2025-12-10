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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
    _id: string;
    bookingReference: string;
    event: { title: string };
    user: { name: string; email: string };
    amountPaid: number;
    paymentStatus: 'SUCCESS' | 'PENDING' | 'FAILED';
    createdAt: string;
    payuTransactionId?: string;
}

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
        const interval = setInterval(fetchTransactions, 5000); // Poll every 5 seconds for "live" updates
        return () => clearInterval(interval);
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await fetch('/api/admin/transactions');
            const data = await res.json();
            if (data.success) {
                setTransactions(data.data);
            } else {
                toast.error(data.error);
            }
        } catch (err) {
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8" /></div>;
    }

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold">Transaction History</h1>

            <Card>
                <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Reference ID</TableHead>
                                    <TableHead>Event</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>PayU ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No transactions found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((txn) => (
                                        <TableRow key={txn._id}>
                                            <TableCell className="whitespace-nowrap">{new Date(txn.createdAt).toLocaleString()}</TableCell>
                                            <TableCell className="font-mono text-xs whitespace-nowrap">{txn.bookingReference}</TableCell>
                                            <TableCell className="min-w-[150px]">{txn.event?.title || 'Unknown Event'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col min-w-[120px]">
                                                    <span>{txn.user?.name || 'Guest'}</span>
                                                    <span className="text-xs text-muted-foreground">{txn.user?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>₹{txn.amountPaid}</TableCell>
                                            <TableCell>
                                                <Badge variant={txn.paymentStatus === 'SUCCESS' ? 'default' : txn.paymentStatus === 'FAILED' ? 'destructive' : 'secondary'}>
                                                    {txn.paymentStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs whitespace-nowrap">{txn.payuTransactionId || '-'}</TableCell>
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
