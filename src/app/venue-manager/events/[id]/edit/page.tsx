'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [event, setEvent] = useState<any>(null);
    const [originalQuantity, setOriginalQuantity] = useState(0);
    const [newQuantity, setNewQuantity] = useState(0);

    useEffect(() => {
        fetchEvent();
    }, []);

    const fetchEvent = async () => {
        try {
            const res = await fetch(`/api/events/${params.id}`);
            const data = await res.json();
            if (data.success) {
                setEvent(data.data);
                setOriginalQuantity(data.data.ticketConfig.quantity);
                setNewQuantity(data.data.ticketConfig.quantity);
            } else {
                toast.error('Failed to load event');
            }
        } catch (error) {
            console.error('Error fetching event:', error);
            toast.error('Error loading event');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setNewQuantity(val);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newQuantity < originalQuantity) {
            toast.error('You can only increase the ticket quantity.');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/events/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticketConfig: { quantity: newQuantity } })
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Ticket quantity updated successfully');
                setOriginalQuantity(newQuantity);
                // router.back(); // Optional: Stay on page or go back
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Failed to update event');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading event details...</div>;
    if (!event) return <div className="p-8 text-center">Event not found</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
            </Button>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Event: {event.title}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Read Only Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Event Details (Read Only)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Event Type</Label>
                                <Input value={event.type} disabled className="bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input value={new Date(event.startDate).toLocaleString()} disabled className="bg-muted" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={event.description} disabled className="bg-muted" />
                        </div>
                    </CardContent>
                </Card>

                {/* Ticket Config - Editable Quantity Only */}
                <Card className="border-primary/50">
                    <CardHeader className="bg-primary/5">
                        <CardTitle>Ticket Configuration</CardTitle>
                        <CardDescription>You can increase the total number of tickets available.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Price</Label>
                                <Input value={`${event.ticketConfig.currency} ${event.ticketConfig.price}`} disabled className="bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <Label>Current Total Quantity</Label>
                                <Input
                                    type="number"
                                    value={newQuantity}
                                    onChange={handleQuantityChange}
                                    min={originalQuantity}
                                    className="font-bold text-lg"
                                />
                                <p className="text-xs text-muted-foreground">Original: {originalQuantity}. Cannot decrease.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" size="lg" disabled={saving || newQuantity < originalQuantity}>
                        {saving ? 'Saving...' : 'Update Quantity'} <Save className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
