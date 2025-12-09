'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserPlus, Trash2, RefreshCw, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export default function EventCoordinatorsPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const [event, setEvent] = useState<any>(null);
    const [coordinators, setCoordinators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // New Coordinator Form Data (No Password Needed)
    const [newCoordinator, setNewCoordinator] = useState({
        name: '',
        email: ''
    });

    useEffect(() => {
        fetchData();
    }, [eventId]);

    const fetchData = async () => {
        try {
            // Fetch event details
            const eventRes = await fetch(`/api/events/${eventId}`);
            const eventData = await eventRes.json();
            if (eventData.success) {
                setEvent(eventData.data);
            }

            // Fetch assigned coordinators with stats
            const assignedRes = await fetch(`/api/events/${eventId}/coordinators`);
            const assignedData = await assignedRes.json();

            if (assignedData.success) {
                // assignedData.data will be [{ _id, name, email, stats: { ticketsScanned: 0 } }]
                setCoordinators(assignedData.data || []);
            } else {
                toast.error(assignedData.error || 'Failed to load coordinators');
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCoordinator = async (coordinatorId: string) => {
        if (!confirm("Are you sure? This will remove the coordinator from this event.")) return;

        try {
            const res = await fetch(`/api/events/${eventId}/coordinators`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coordinatorId })
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Coordinator removed successfully');
                fetchData();
            } else {
                toast.error(data.error || 'Failed to remove coordinator');
            }
        } catch (error) {
            toast.error('Failed to remove coordinator');
        }
    };

    const handleCreateCoordinator = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!newCoordinator.name || !newCoordinator.email) {
            toast.error('All fields are required');
            return;
        }

        try {
            toast.loading("Creating coordinator and sending credentials...");

            // Call the Event-Specific Coordinator API
            const res = await fetch(`/api/events/${eventId}/coordinators`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCoordinator)
                // We send { name, email }. Password is generated backend.
            });

            const data = await res.json();
            toast.dismiss();

            if (data.success) {
                toast.success('Coordinator added & credentials emailed!');
                setNewCoordinator({ name: '', email: '' });
                setShowCreateForm(false);
                fetchData();
            } else {
                toast.error(data.error || 'Failed to add coordinator');
            }
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to create coordinator');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="container mx-auto px-6 py-4">
                    <Link href={`/venue-manager/events/`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Events
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Event Team</h1>
                        <p className="text-muted-foreground">
                            Managing coordinators for: <span className="font-semibold text-foreground">{event?.title}</span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={fetchData}>
                            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                        </Button>
                        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            {showCreateForm ? 'Cancel' : 'Add Coordinator'}
                        </Button>
                    </div>
                </div>

                {/* Create Form */}
                {showCreateForm && (
                    <Card className="mb-8 border-primary/20 shadow-md">
                        <CardHeader className="bg-primary/5">
                            <CardTitle>Add New Coordinator</CardTitle>
                            <CardDescription>
                                Create a new account. Login credentials will be automatically emailed to them.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleCreateCoordinator} className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 space-y-2 w-full">
                                    <Label>Full Name</Label>
                                    <Input
                                        value={newCoordinator.name}
                                        onChange={(e) => setNewCoordinator({ ...newCoordinator, name: e.target.value })}
                                        placeholder="Jane Doe"
                                        required
                                    />
                                </div>
                                <div className="flex-1 space-y-2 w-full">
                                    <Label>Email Address</Label>
                                    <Input
                                        type="email"
                                        value={newCoordinator.email}
                                        onChange={(e) => setNewCoordinator({ ...newCoordinator, email: e.target.value })}
                                        placeholder="jane@example.com"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full md:w-auto">
                                    Add & Send Invite
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Coordinators List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coordinators.map((coord) => (
                        <Card key={coord._id} className="group hover:border-primary/50 transition-colors">
                            <CardHeader className="flex flex-row justify-between items-start pb-2">
                                <div>
                                    <CardTitle className="text-lg">{coord.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{coord.email}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive -mt-2 -mr-2" onClick={() => handleRemoveCoordinator(coord._id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 mt-2 p-3 bg-muted/50 rounded-lg">
                                    <QrCode className="w-8 h-8 text-primary opacity-80" />
                                    <div>
                                        <p className="text-2xl font-bold leading-none">{coord.stats?.ticketsScanned || 0}</p>
                                        <p className="text-xs text-muted-foreground font-medium">Tickets Scanned</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {coordinators.length === 0 && !showCreateForm && (
                        <div className="col-span-full text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
                            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                <UserPlus className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium">No Coordinators Assigned</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                Add coordinators to this event to help with ticket verification and management.
                            </p>
                            <Button variant="outline" className="mt-4" onClick={() => setShowCreateForm(true)}>
                                Add First Coordinator
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
