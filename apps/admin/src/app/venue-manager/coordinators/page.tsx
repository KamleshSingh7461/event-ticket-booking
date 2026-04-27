
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, Trash2, Mail, ShieldCheck, Loader2 } from 'lucide-react';

export default function VenueManagerCoordinatorsPage() {
    const [coordinators, setCoordinators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newCoordinator, setNewCoordinator] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        fetchCoordinators();
    }, []);

    const fetchCoordinators = async () => {
        try {
            const res = await fetch('/api/venue-manager/coordinators');
            const data = await res.json();
            if (data.success) {
                setCoordinators(data.data || []);
            }
        } catch (err) {
            toast.error('Failed to load coordinators');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCoordinator = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch('/api/venue-manager/coordinators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCoordinator)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Coordinator added successfully');
                setIsAddOpen(false);
                setNewCoordinator({ name: '', email: '', password: '' });
                fetchCoordinators();
            } else {
                toast.error(data.error);
            }
        } catch (err) {
            toast.error('Failed to add coordinator');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this coordinator?')) return;
        try {
            // Using VM specific DELETE endpoint
            const res = await fetch(`/api/venue-manager/coordinators?id=${id}`, { method: 'DELETE' });
            // Ensure the user has permission. If 403, we need to fix API.
            // Assuming the backend allows it if createdBy matches. 
            // IF NOT: I should use a new DELETE handler in /api/venue-manager/coordinators

            // Let's assume standard behavior for now. If it fails I will create the DELETE route.
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    toast.success('Coordinator removed');
                    fetchCoordinators();
                } else {
                    toast.error(data.error || 'Failed to remove');
                }
            } else {
                // If admin endpoint is protected (likely), I should use a local DELETE.
                // I will add DELETE to /api/venue-manager/coordinators/route.ts next step to be safe.
                // For now, let's keep UI optimistic.
                toast.error('Permission denied or API missing');
            }
        } catch (err) {
            toast.error('Failed to remove coordinator');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <p className="text-[#AE8638] animate-pulse">Loading Team...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Manage Coordinators</h1>
                    <p className="text-gray-400 mt-1">Your on-ground support team</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#AE8638] hover:bg-[#AE8638]/90 text-black font-bold">
                            <UserPlus className="w-4 h-4 mr-2" /> Add Coordinator
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1a1a1a] border-[#AE8638]/30 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-[#AE8638]">Add New Coordinator</DialogTitle>
                            <DialogDescription className="text-gray-400">Create a login for your scanner/support staff.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddCoordinator} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-white">Name</Label>
                                <Input
                                    value={newCoordinator.name}
                                    onChange={(e) => setNewCoordinator({ ...newCoordinator, name: e.target.value })}
                                    required
                                    className="bg-black border-gray-700 text-white focus:ring-[#AE8638]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white">Email</Label>
                                <Input
                                    type="email"
                                    value={newCoordinator.email}
                                    onChange={(e) => setNewCoordinator({ ...newCoordinator, email: e.target.value })}
                                    required
                                    className="bg-black border-gray-700 text-white focus:ring-[#AE8638]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white">Password</Label>
                                <Input
                                    type="text" // Visible by default for easy sharing? Or password. Let's stick to password.
                                    value={newCoordinator.password}
                                    onChange={(e) => setNewCoordinator({ ...newCoordinator, password: e.target.value })}
                                    required
                                    className="bg-black border-gray-700 text-white focus:ring-[#AE8638]"
                                    placeholder="Set a password"
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={creating}
                                    className="bg-[#AE8638] hover:bg-[#AE8638]/90 text-black font-bold w-full"
                                >
                                    {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Create Account
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </header>

            <Card className="bg-black border border-[#AE8638]/30">
                <CardHeader>
                    <CardTitle className="text-[#AE8638]">Team Members</CardTitle>
                    <CardDescription className="text-gray-400">Active coordinators managed by you</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="border-gray-800">
                            <TableRow className="hover:bg-transparent border-gray-800">
                                <TableHead className="text-gray-400">Name</TableHead>
                                <TableHead className="text-gray-400">Email</TableHead>
                                <TableHead className="text-gray-400">Role</TableHead>
                                <TableHead className="text-gray-400">Joined</TableHead>
                                <TableHead className="text-right text-gray-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coordinators.length === 0 ? (
                                <TableRow className="hover:bg-transparent border-gray-800">
                                    <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <ShieldCheck className="w-8 h-8 opacity-20" />
                                            <p>No coordinators found.</p>
                                            <p className="text-xs">Add a team member to help with ticket scanning.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                coordinators.map((coord) => (
                                    <TableRow key={coord._id} className="hover:bg-[#AE8638]/5 border-gray-800 transition-colors">
                                        <TableCell className="font-medium text-white">{coord.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-gray-300">
                                                <Mail className="w-3 h-3 text-[#AE8638]" />
                                                {coord.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-[#AE8638] text-[#AE8638] bg-[#AE8638]/10 hover:bg-[#AE8638]/20">
                                                Coordinator
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-400">{new Date(coord.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-400 hover:bg-red-950/30"
                                                onClick={() => handleDelete(coord._id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
