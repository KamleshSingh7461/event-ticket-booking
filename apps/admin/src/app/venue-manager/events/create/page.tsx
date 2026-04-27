'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

export default function VenueManagerCreateEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({
        title: '',
        description: '',
        type: 'OFFLINE',
        venue: '',
        startDate: '',
        endDate: '',
        ticketConfig: {
            price: 0,
            currency: 'INR',
            quantity: 100,
            offers: []
        },
        subHeadings: []
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleTicketConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            ticketConfig: { ...formData.ticketConfig, [name]: value }
        });
    };

    const addOffer = () => {
        setFormData({
            ...formData,
            ticketConfig: {
                ...formData.ticketConfig,
                offers: [...formData.ticketConfig.offers, { code: '', discountPercentage: 0, description: '' }]
            }
        });
    };

    const updateOffer = (index: number, field: string, value: any) => {
        const newOffers = [...formData.ticketConfig.offers];
        newOffers[index] = { ...newOffers[index], [field]: value };
        setFormData({
            ...formData,
            ticketConfig: { ...formData.ticketConfig, offers: newOffers }
        });
    };

    const removeOffer = (index: number) => {
        const newOffers = formData.ticketConfig.offers.filter((_: any, i: number) => i !== index);
        setFormData({
            ...formData,
            ticketConfig: { ...formData.ticketConfig, offers: newOffers }
        });
    };

    const addSubHeading = () => {
        setFormData({
            ...formData,
            subHeadings: [...formData.subHeadings, { title: '', content: '' }]
        });
    };

    const updateSubHeading = (index: number, field: string, value: any) => {
        const newSub = [...formData.subHeadings];
        newSub[index] = { ...newSub[index], [field]: value };
        setFormData({ ...formData, subHeadings: newSub });
    };

    const removeSubHeading = (index: number) => {
        const newSub = formData.subHeadings.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, subHeadings: newSub });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Event Created Successfully!');
                router.push('/venue-manager/events');
            } else {
                toast.error(data.error);
            }
        } catch (err) {
            toast.error('Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="container mx-auto px-6 py-4">
                    <h1 className="text-2xl font-bold">Create New Event</h1>
                    <p className="text-sm text-muted-foreground">Fill in the details for your event</p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Details</CardTitle>
                            <CardDescription>General information about the event.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Event Title</Label>
                                    <Input name="title" value={formData.title} onChange={handleInputChange} required placeholder="Summer Music Fest" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Event Type</Label>
                                    <Select onValueChange={(v) => setFormData({ ...formData, type: v })} defaultValue={formData.type}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ONLINE">Online</SelectItem>
                                            <SelectItem value="OFFLINE">Offline (Venue)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input name="description" value={formData.description} onChange={handleInputChange} required />
                            </div>

                            {formData.type === 'OFFLINE' && (
                                <div className="space-y-2">
                                    <Label>Venue Address</Label>
                                    <Input name="venue" value={formData.venue} onChange={handleInputChange} required />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date & Time</Label>
                                    <Input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date & Time</Label>
                                    <Input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleInputChange} required />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ticket Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Price</Label>
                                    <Input type="number" name="price" value={formData.ticketConfig.price} onChange={handleTicketConfigChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Currency</Label>
                                    <Input name="currency" value={formData.ticketConfig.currency} onChange={handleTicketConfigChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Total Quantity</Label>
                                    <Input type="number" name="quantity" value={formData.ticketConfig.quantity} onChange={handleTicketConfigChange} required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                    <Label>Offers / Discounts</Label>
                                    <Button type="button" size="sm" variant="outline" onClick={addOffer}>
                                        <Plus className="w-4 h-4 mr-1" /> Add Offer
                                    </Button>
                                </div>
                                {formData.ticketConfig.offers.map((offer: any, idx: number) => (
                                    <div key={idx} className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <Input placeholder="Code (e.g., SUMMER10)" value={offer.code} onChange={(e) => updateOffer(idx, 'code', e.target.value)} />
                                        </div>
                                        <div className="flex-1">
                                            <Input type="number" placeholder="Discount %" value={offer.discountPercentage} onChange={(e) => updateOffer(idx, 'discountPercentage', e.target.value)} />
                                        </div>
                                        <div className="flex-[2]">
                                            <Input placeholder="Description" value={offer.description} onChange={(e) => updateOffer(idx, 'description', e.target.value)} />
                                        </div>
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeOffer(idx)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" size="lg" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Event'}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}
