'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserPlus, Trash2, Mail } from 'lucide-react';

export default function VenueManagerCoordinatorsPage() {
    const [coordinators, setCoordinators] = useState<any[]>([]);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newCoordinator, setNewCoordinator] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        fetchCoordinators();
    }, []);

    const fetchCoordinators = async () => {
        try {
            // Fetch only this venue manager's coordinators
            const res = await fetch('/api/venue-manager/coordinators');
            const data = await res.json();
            if (data.success) {
                setCoordinators(data.data || []);
            }
        } catch (err) {
            toast.error('Failed to load coordinators');
        }
    };

    const handleAddCoordinator = async (e: React.FormEvent) => {
        e.preventDefault();
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
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this coordinator?')) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Coordinator removed');
                fetchCoordinators();
            }
        } catch (err) {
            toast.error('Failed to remove coordinator');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Manage Coordinators</h1>
                            <p className="text-sm text-muted-foreground">Add and manage your event coordinators</p>
                        </div>
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <UserPlus className="w-4 h-4 mr-2" /> Add Coordinator
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Coordinator</DialogTitle>
                                    <DialogDescription>Create a coordinator account for your team</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddCoordinator} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input value={newCoordinator.name} onChange={(e) => setNewCoordinator({ ...newCoordinator, name: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input type="email" value={newCoordinator.email} onChange={(e) => setNewCoordinator({ ...newCoordinator, email: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Password</Label>
                                        <Input type="password" value={newCoordinator.password} onChange={(e) => setNewCoordinator({ ...newCoordinator, password: e.target.value })} required />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Add Coordinator</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Coordinators</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coordinators.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No coordinators yet. Add one to get started!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    coordinators.map((coord) => (
                                        <TableRow key={coord._id}>
                                            <TableCell className="font-medium">{coord.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-3 h-3 text-muted-foreground" />
                                                    {coord.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="default">Active</Badge>
                                            </TableCell>
                                            <TableCell>{new Date(coord.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(coord._id)}>
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
            </main>
        </div>
    );
}
