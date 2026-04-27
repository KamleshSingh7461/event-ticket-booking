'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, CheckCircle, Calendar, User, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function CoordinatorHistoryPage() {
    const [history, setHistory] = useState<any[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = history.filter(item =>
                item.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.event.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredHistory(filtered);
        } else {
            setFilteredHistory(history);
        }
    }, [searchTerm, history]);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/coordinator/history');
            const data = await res.json();
            if (data.success) {
                setHistory(data.data);
                setFilteredHistory(data.data);
            }
        } catch (err) {
            toast.error('Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <header className="bg-slate-900 border-b border-slate-800">
                <div className="container mx-auto px-6 py-4">
                    <h1 className="text-2xl font-bold">Verification History</h1>
                    <p className="text-sm text-slate-400">All tickets you've verified</p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search by name, email, or event..."
                            className="pl-10 bg-slate-900 border-slate-800 text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-sm text-slate-400">Total Verified</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{history.length}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-sm text-slate-400">Today</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">
                                {history.filter(h => {
                                    const today = new Date().toDateString();
                                    return new Date(h.redeemedAt).toDateString() === today;
                                }).length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-sm text-slate-400">This Week</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">
                                {history.filter(h => {
                                    const weekAgo = new Date();
                                    weekAgo.setDate(weekAgo.getDate() - 7);
                                    return new Date(h.redeemedAt) >= weekAgo;
                                }).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* History Table */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            Verification Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-12 text-slate-400">Loading...</div>
                        ) : filteredHistory.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                {searchTerm ? 'No results found' : 'No verifications yet'}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-800 hover:bg-slate-800/50">
                                            <TableHead className="text-slate-400">Ticket Holder</TableHead>
                                            <TableHead className="text-slate-400">Event</TableHead>
                                            <TableHead className="text-slate-400">Verified At</TableHead>
                                            <TableHead className="text-slate-400">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredHistory.map((item) => (
                                            <TableRow key={item._id} className="border-slate-800 hover:bg-slate-800/50">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-white flex items-center gap-2">
                                                            <User className="w-3 h-3 text-slate-400" />
                                                            {item.buyerName}
                                                        </span>
                                                        <span className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                                                            <Mail className="w-3 h-3" />
                                                            {item.buyerEmail}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-300">{item.event}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-slate-300">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        {new Date(item.redeemedAt).toLocaleString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                                                        Verified
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
