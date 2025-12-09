'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserPlus, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function EventCoordinatorsPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const [event, setEvent] = useState<any>(null);
    const [coordinators, setCoordinators] = useState<any[]>([]);
    const [availableCoordinators, setAvailableCoordinators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newCoordinator, setNewCoordinator] = useState({
        name: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        fetchData();
    }, [eventId]);

    const fetchData = async () => {
        try {
            // Fetch event details
            const eventRes = await fetch(`/api/events/${eventId}`);
            const eventData = await eventRes.json();
            console.log('Event data:', eventData);
            if (eventData.success) {
                setEvent(eventData.data);
            }

            // Fetch coordinators created by this venue manager
            const coordRes = await fetch('/api/venue-manager/coordinators');
            const coordData = await coordRes.json();
            console.log('Available coordinators:', coordData);
            if (coordData.success) {
                setAvailableCoordinators(coordData.data || []);
            } else {
                console.error('Failed to fetch coordinators:', coordData.error);
                toast.error(coordData.error || 'Failed to load coordinators');
            }

            // Fetch assigned coordinators for this event
            const assignedRes = await fetch(`/api/events/${eventId}/coordinators`);
            const assignedData = await assignedRes.json();
            console.log('Assigned coordinators:', assignedData);
            if (assignedData.success) {
                setCoordinators(assignedData.data || []);
            } else {
                console.error('Failed to fetch assigned coordinators:', assignedData.error);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load coordinators');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignCoordinator = async (coordinatorId: string) => {
        try {
            const res = await fetch(`/api/events/${eventId}/coordinators`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coordinatorId })
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Coordinator assigned successfully');
                fetchData(); // Refresh the lists
            } else {
                toast.error(data.error || 'Failed to assign coordinator');
            }
        } catch (error) {
            toast.error('Failed to assign coordinator');
        }
    };

    const handleRemoveCoordinator = async (coordinatorId: string) => {
        try {
            const res = await fetch(`/api/events/${eventId}/coordinators`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coordinatorId })
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Coordinator removed successfully');
                fetchData(); // Refresh the lists
            } else {
                toast.error(data.error || 'Failed to remove coordinator');
            }
        } catch (error) {
            toast.error('Failed to remove coordinator');
        }
    };

    const handleCreateCoordinator = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newCoordinator.name || !newCoordinator.email || !newCoordinator.password) {
            toast.error('All fields are required');
            return;
        }

        try {
            const res = await fetch('/api/venue-manager/coordinators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCoordinator)
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Coordinator created successfully');
                setNewCoordinator({ name: '', email: '', password: '' });
                setShowCreateForm(false);
                fetchData(); // Refresh to show new coordinator
            } else {
                toast.error(data.error || 'Failed to create coordinator');
            }
        } catch (error) {
            toast.error('Failed to create coordinator');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="container mx-auto px-6 py-4">
                    <Link href={`/venue-manager/events/${eventId}`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Event
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Manage Coordinators</h1>
                            <p className="text-muted-foreground">
                                {event?.title || 'Event'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={fetchData}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                                <UserPlus className="w-4 h-4 mr-2" />
                                {showCreateForm ? 'Cancel' : 'Create Coordinator'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Create Coordinator Form */}
                {showCreateForm && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Create New Coordinator</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateCoordinator} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={newCoordinator.name}
                                        onChange={(e) => setNewCoordinator({ ...newCoordinator, name: e.target.value })}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={newCoordinator.email}
                                        onChange={(e) => setNewCoordinator({ ...newCoordinator, email: e.target.value })}
                                        placeholder="coordinator@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={newCoordinator.password}
                                        onChange={(e) => setNewCoordinator({ ...newCoordinator, password: e.target.value })}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full">Create Coordinator</Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Assigned Coordinators */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Coordinators</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {coordinators.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No coordinators assigned yet</p>
                                    <p className="text-sm mt-2">Assign coordinators from the available list</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {coordinators.map((coordinator) => (
                                        <div key={coordinator._id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <p className="font-medium">{coordinator.name}</p>
                                                <p className="text-sm text-muted-foreground">{coordinator.email}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveCoordinator(coordinator._id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Available Coordinators */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Available Coordinators</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {availableCoordinators.filter(coord =>
                                !coordinators.some(assigned => assigned._id === coord._id)
                            ).length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No coordinators available</p>
                                    <p className="text-sm mt-2">All your coordinators are assigned or create new ones</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {availableCoordinators
                                        .filter(coord => !coordinators.some(assigned => assigned._id === coord._id))
                                        .map((coordinator) => (
                                            <div key={coordinator._id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{coordinator.name}</p>
                                                    <p className="text-sm text-muted-foreground">{coordinator.email}</p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAssignCoordinator(coordinator._id)}
                                                >
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    Assign
                                                </Button>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Info Box */}
                <Card className="mt-6 bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <p className="text-sm text-blue-900">
                            <strong>Note:</strong> Assigned coordinators will be able to verify tickets for this event.
                            They can scan QR codes at the venue entrance to check-in attendees.
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
