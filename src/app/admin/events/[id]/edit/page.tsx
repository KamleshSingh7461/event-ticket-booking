'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Event Data
    const [formData, setFormData] = useState<any>({
        title: '',
        description: '',
        type: 'OFFLINE',
        venue: '',
        banner: '',
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

    useEffect(() => {
        if (params.id) {
            fetchEventDetails();
        }
    }, [params.id]);

    const fetchEventDetails = async () => {
        try {
            const res = await fetch(`/api/events/${params.id}`);
            const data = await res.json();
            if (data.success) {
                const event = data.data;
                // Format dates for input type="datetime-local"
                // datetime-local expects YYYY-MM-DDThh:mm
                const formatDateTime = (dateStr: string) => {
                    if (!dateStr) return '';
                    const d = new Date(dateStr);
                    const pad = (n: number) => n < 10 ? '0' + n : n;
                    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                };

                setFormData({
                    ...event,
                    venue: event.venue || '',
                    banner: event.banner || '',
                    startDate: formatDateTime(event.startDate),
                    endDate: formatDateTime(event.endDate),
                    ticketConfig: {
                        ...event.ticketConfig,
                        offers: event.ticketConfig.offers || []
                    },
                    subHeadings: event.subHeadings || []
                });
            } else {
                toast.error('Event not found');
                router.push('/admin/events');
            }
        } catch (error) {
            console.error('Failed to fetch event', error);
            toast.error('Failed to load event details');
        } finally {
            setLoading(false);
        }
    };

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

    // Offers Management
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

    // Subheadings Management
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
        setSaving(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('type', formData.type);
        data.append('venue', formData.venue);
        data.append('startDate', formData.startDate);
        data.append('endDate', formData.endDate);
        data.append('ticketConfig', JSON.stringify(formData.ticketConfig));
        data.append('subHeadings', JSON.stringify(formData.subHeadings));

        // Only append banner if it's a new file. If it's a string, we don't need to send it back as the backend preserves it if not present,
        // OR we can send it but backend handles file vs string logic already.
        // My backend logic handles both, so sending it is fine.
        if (formData.banner instanceof File) {
            data.append('banner', formData.banner);
        } else if (typeof formData.banner === 'string') {
            // If we send the existing URL string, backend logic `else if (typeof formData.get('banner') === 'string')` handles it
            data.append('banner', formData.banner);
        }

        try {
            const res = await fetch(`/api/events/${params.id}`, {
                method: 'PUT',
                body: data
            });
            const resData = await res.json();
            if (resData.success) {
                toast.success('Event Updated Successfully!');
                router.push('/admin/events');
            } else {
                toast.error(resData.error);
            }
        } catch (err) {
            toast.error('Failed to update event');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading event details...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            {/* ... (Header remains same) */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-3xl font-bold">Edit Event</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Details</CardTitle>
                        <CardDescription>General information about the event.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Event Title</Label>
                                <Input name="title" value={formData.title} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Event Type</Label>
                                <Select onValueChange={(v) => setFormData({ ...formData, type: v })} value={formData.type}>
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
                            <Label>Banner Image</Label>
                            <Input
                                type="file"
                                name="banner"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setFormData({ ...formData, banner: e.target.files[0] });
                                    }
                                }}
                            />
                            {/* Preview logic: if string, show it. If File, create object URL */}
                            {formData.banner && (
                                <div className="mt-2 relative h-48 w-full rounded-lg overflow-hidden border">
                                    <img
                                        src={formData.banner instanceof File ? URL.createObjectURL(formData.banner) : formData.banner}
                                        alt="Banner Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">Upload a new banner to replace the existing one.</p>
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

                {/* Ticket Config */}
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
                            <div className="flex justify-between items-center bg-muted/50 p-2 rounded">
                                <Label>Offers / Discounts</Label>
                                <Button type="button" size="sm" variant="outline" onClick={addOffer}>
                                    <Plus className="w-4 h-4 mr-1" /> Add Offer
                                </Button>
                            </div>
                            {formData.ticketConfig.offers.map((offer: any, idx: number) => (
                                <div key={idx} className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <Input placeholder="Code" value={offer.code} onChange={(e) => updateOffer(idx, 'code', e.target.value)} />
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

                {/* Additional Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center bg-muted/50 p-2 rounded">
                                <Label>Sub Headings</Label>
                                <Button type="button" size="sm" variant="outline" onClick={addSubHeading}>
                                    <Plus className="w-4 h-4 mr-1" /> Add Section
                                </Button>
                            </div>
                            {formData.subHeadings.map((sub: any, idx: number) => (
                                <div key={idx} className="space-y-2 border p-4 rounded-lg">
                                    <div className="flex justify-between">
                                        <Label>Section {idx + 1}</Label>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeSubHeading(idx)} className="text-destructive h-6">Remove</Button>
                                    </div>
                                    <Input placeholder="Title (e.g., Terms & Conditions)" value={sub.title} onChange={(e) => updateSubHeading(idx, 'title', e.target.value)} />
                                    <Input placeholder="Content" value={sub.content} onChange={(e) => updateSubHeading(idx, 'content', e.target.value)} />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" size="lg" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
