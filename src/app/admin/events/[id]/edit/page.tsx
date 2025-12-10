
'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowLeft, RefreshCw, Save, Image as ImageIcon, Calendar, CreditCard, MapPin, Type } from 'lucide-react';

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // VM Management
    const [venueManagers, setVenueManagers] = useState<any[]>([]);
    const [resending, setResending] = useState(false);

    // Event Data
    const [formData, setFormData] = useState<any>({
        title: '',
        description: '',
        type: 'OFFLINE',
        venue: '',
        venueManager: '',
        banner: '',
        startDate: '',
        endDate: '',
        ticketConfig: {
            price: 0,
            currency: 'INR',
            quantity: 100,
            offers: []
        },
        subHeadings: [],
        gallery: [],
        schedule: []
    });

    useEffect(() => {
        if (params.id) {
            fetchEventDetails();
            fetchVenueManagers();
        }
    }, [params.id]);

    const fetchVenueManagers = async () => {
        try {
            const res = await fetch('/api/admin/venue-managers');
            const data = await res.json();
            if (data.success) {
                setVenueManagers(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch venue managers', error);
        }
    };

    const fetchEventDetails = async () => {
        try {
            const res = await fetch(`/api/events/${params.id}`);
            const data = await res.json();
            if (data.success) {
                const event = data.data;
                const formatDateTime = (dateStr: string) => {
                    if (!dateStr) return '';
                    const d = new Date(dateStr);
                    const pad = (n: number) => n < 10 ? '0' + n : n;
                    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                };

                setFormData({
                    ...event,
                    venue: event.venue || '',
                    venueManager: event.venueManager || '',
                    banner: event.banner || '',
                    startDate: formatDateTime(event.startDate),
                    endDate: formatDateTime(event.endDate),
                    ticketConfig: {
                        ...event.ticketConfig,
                        offers: event.ticketConfig.offers || []
                    },
                    subHeadings: event.subHeadings || [],
                    gallery: event.gallery || [],
                    schedule: event.schedule || []
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

    const handleResendCredentials = async () => {
        if (!formData.venueManager || formData.venueManager === 'unassigned') return;
        if (!confirm('Are you sure? This will RESET the user\'s password and email them new credentials.')) return;

        setResending(true);
        try {
            const res = await fetch('/api/auth/resend-credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: formData.venueManager })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Credentials sent successfully!');
            } else {
                toast.error(data.error || 'Failed to send credentials');
            }
        } catch (error) {
            toast.error('Error sending credentials');
        } finally {
            setResending(false);
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

    const addScheduleImage = () => {
        setFormData({
            ...formData,
            schedule: [...formData.schedule, '']
        });
    };

    const updateScheduleImage = (index: number, value: string) => {
        const newSchedule = [...formData.schedule];
        newSchedule[index] = value;
        setFormData({ ...formData, schedule: newSchedule });
    };

    const removeScheduleImage = (index: number) => {
        const newSchedule = formData.schedule.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, schedule: newSchedule });
    };

    const addGalleryImage = () => {
        setFormData({
            ...formData,
            gallery: [...formData.gallery, '']
        });
    };

    const updateGalleryImage = (index: number, value: string) => {
        const newGallery = [...formData.gallery];
        newGallery[index] = value;
        setFormData({ ...formData, gallery: newGallery });
    };

    const removeGalleryImage = (index: number) => {
        const newGallery = formData.gallery.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, gallery: newGallery });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('type', formData.type);
        data.append('venue', formData.venue);
        if (formData.venueManager && formData.venueManager !== 'unassigned') {
            data.append('venueManager', formData.venueManager);
        }
        data.append('startDate', formData.startDate);
        data.append('endDate', formData.endDate);
        if (formData.entryTime) data.append('entryTime', formData.entryTime);
        data.append('ticketConfig', JSON.stringify(formData.ticketConfig));
        data.append('subHeadings', JSON.stringify(formData.subHeadings));
        data.append('gallery', JSON.stringify(formData.gallery));
        data.append('schedule', JSON.stringify(formData.schedule));

        if (formData.banner instanceof File) {
            data.append('banner', formData.banner);
        } else if (typeof formData.banner === 'string') {
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
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-[#AE8638]">
                <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#AE8638]/20">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="text-[#AE8638] hover:text-[#AE8638] hover:bg-[#AE8638]/10"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#AE8638] to-[#F7EF8A] bg-clip-text text-transparent">
                                Edit Event
                            </h1>
                            <p className="text-gray-400 mt-1">Refine event details and settings</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="border-[#AE8638]/30 text-gray-400 hover:text-white hover:bg-[#AE8638]/10 hover:border-[#AE8638]/50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="bg-[#AE8638] hover:bg-[#AE8638]/90 text-black font-bold shadow-[0_0_15px_rgba(174,134,56,0.2)]"
                        >
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                <form className="space-y-8">
                    {/* Basic Details */}
                    <Card className="bg-neutral-900/50 border border-[#AE8638]/20 shadow-xl">
                        <CardHeader className="border-b border-[#AE8638]/10">
                            <div className="flex items-center gap-2">
                                <Type className="w-5 h-5 text-[#AE8638]" />
                                <CardTitle className="text-white">Basic Information</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6 text-gray-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[#AE8638]">Event Title</Label>
                                    <Input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="bg-black border-[#AE8638]/30 focus:border-[#AE8638] focus:ring-[#AE8638]/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[#AE8638]">Event Type</Label>
                                    <Select
                                        onValueChange={(v) => setFormData({ ...formData, type: v })}
                                        value={formData.type}
                                    >
                                        <SelectTrigger className="bg-black border-[#AE8638]/30 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-900 border-[#AE8638]/30 text-white">
                                            <SelectItem value="ONLINE" className="focus:bg-[#AE8638] focus:text-black">Online</SelectItem>
                                            <SelectItem value="OFFLINE" className="focus:bg-[#AE8638] focus:text-black">Offline (Venue)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Venue Manager */}
                            <div className="space-y-2 p-4 rounded-lg bg-black/20 border border-[#AE8638]/10">
                                <Label className="text-[#AE8638]">Venue Manager</Label>
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                    <div className="flex-1 w-full">
                                        <Select
                                            onValueChange={(v) => setFormData({ ...formData, venueManager: v })}
                                            value={formData.venueManager || ''}
                                        >
                                            <SelectTrigger className="bg-black border-[#AE8638]/30 text-white">
                                                <SelectValue placeholder="Assign Manager" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-neutral-900 border-[#AE8638]/30 text-white">
                                                <SelectItem value="unassigned" className="text-gray-400">-- Unassigned --</SelectItem>
                                                {venueManagers.map((vm) => (
                                                    <SelectItem key={vm._id} value={vm._id} className="focus:bg-[#AE8638] focus:text-black">
                                                        {vm.name} <span className="text-xs opacity-70">({vm.email})</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {formData.venueManager && formData.venueManager !== 'unassigned' && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleResendCredentials}
                                            disabled={resending}
                                            className="border-[#AE8638]/50 text-[#AE8638] hover:bg-[#AE8638] hover:text-black"
                                        >
                                            <RefreshCw className={`w-4 h-4 mr-2 ${resending ? 'animate-spin' : ''}`} />
                                            {resending ? 'Sending...' : 'Resend Login'}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[#AE8638]">Banner URL</Label>
                                <Input
                                    type="url"
                                    name="banner"
                                    value={formData.banner}
                                    onChange={handleInputChange}
                                    className="bg-black border-[#AE8638]/30 focus:border-[#AE8638] focus:ring-[#AE8638]/20"
                                    placeholder="https://"
                                />
                                {formData.banner && (
                                    <div className="mt-3 relative h-48 w-full rounded-lg overflow-hidden border border-[#AE8638]/20 group">
                                        <img
                                            src={formData.banner}
                                            alt="Preview"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[#AE8638]">Description</Label>
                                <Textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="min-h-[120px] bg-black border-[#AE8638]/30 focus:border-[#AE8638] text-white"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[#AE8638]">Start Date</Label>
                                    <Input
                                        type="datetime-local"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                        className="bg-black border-[#AE8638]/30 text-white scheme-dark"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[#AE8638]">End Date</Label>
                                    <Input
                                        type="datetime-local"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        required
                                        className="bg-black border-[#AE8638]/30 text-white scheme-dark"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[#AE8638]">Entry Time</Label>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-full md:w-1/3">
                                        <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                        <Input
                                            type="time"
                                            name="entryTime"
                                            value={formData.entryTime || ''}
                                            onChange={handleInputChange}
                                            className="pl-10 bg-black border-[#AE8638]/30 text-white scheme-dark"
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500">24h Format (e.g. 18:30)</span>
                                </div>
                            </div>

                            {formData.type === 'OFFLINE' && (
                                <div className="space-y-2">
                                    <Label className="text-[#AE8638]">Venue Location</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                        <Input
                                            name="venue"
                                            value={formData.venue}
                                            onChange={handleInputChange}
                                            required
                                            className="pl-10 bg-black border-[#AE8638]/30 text-white"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Ticket Config */}
                    <Card className="bg-neutral-900/50 border border-[#AE8638]/20 shadow-xl">
                        <CardHeader className="border-b border-[#AE8638]/10">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-[#AE8638]" />
                                <CardTitle className="text-white">Ticketing</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[#AE8638]">Daily Price</Label>
                                    <Input type="number" name="price" value={formData.ticketConfig.price} onChange={handleTicketConfigChange} required className="bg-black border-[#AE8638]/30 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[#AE8638]">Full Access Price</Label>
                                    <Input type="number" name="allDayPrice" value={formData.ticketConfig.allDayPrice || ''} onChange={handleTicketConfigChange} className="bg-black border-[#AE8638]/30 text-white" placeholder="Optional" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[#AE8638]">Currency</Label>
                                    <Input name="currency" value={formData.ticketConfig.currency} onChange={handleTicketConfigChange} className="bg-black border-[#AE8638]/30 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[#AE8638]">Daily Capacity</Label>
                                    <Input type="number" name="quantity" value={formData.ticketConfig.quantity} onChange={handleTicketConfigChange} required className="bg-black border-[#AE8638]/30 text-white" />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-[#AE8638]/10">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[#AE8638]">Offers & Discounts</Label>
                                    <Button type="button" size="sm" onClick={addOffer} className="bg-[#AE8638]/10 text-[#AE8638] hover:bg-[#AE8638] hover:text-black border border-[#AE8638]/50">
                                        <Plus className="w-4 h-4 mr-1" /> Add Offer
                                    </Button>
                                </div>
                                {formData.ticketConfig.offers.map((offer: any, idx: number) => (
                                    <div key={idx} className="flex flex-col sm:flex-row gap-3 bg-black/40 p-3 rounded-lg border border-[#AE8638]/10">
                                        <div className="flex-1">
                                            <Input placeholder="Code" value={offer.code} onChange={(e) => updateOffer(idx, 'code', e.target.value)} className="bg-neutral-900 border-[#AE8638]/20 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <Input type="number" placeholder="%" value={offer.discountPercentage} onChange={(e) => updateOffer(idx, 'discountPercentage', e.target.value)} className="bg-neutral-900 border-[#AE8638]/20 text-white" />
                                        </div>
                                        <div className="flex-[2]">
                                            <Input placeholder="Description" value={offer.description} onChange={(e) => updateOffer(idx, 'description', e.target.value)} className="bg-neutral-900 border-[#AE8638]/20 text-white" />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeOffer(idx)} className="text-red-500 hover:bg-red-950/20">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Media */}
                    <Card className="bg-neutral-900/50 border border-[#AE8638]/20 shadow-xl">
                        <CardHeader className="border-b border-[#AE8638]/10">
                            <div className="flex items-center gap-2">
                                <ImageIcon className="w-5 h-5 text-[#AE8638]" />
                                <CardTitle className="text-white">Media & Visuals</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-6">
                            {/* Schedule */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[#AE8638]">Schedule Graphics</Label>
                                    <Button type="button" size="sm" onClick={addScheduleImage} className="bg-[#AE8638]/10 text-[#AE8638] hover:bg-[#AE8638] hover:text-black border border-[#AE8638]/50">
                                        <Plus className="w-4 h-4 mr-1" /> Add
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {formData.schedule.map((url: string, idx: number) => (
                                        <div key={idx} className="flex gap-3 items-start bg-black/40 p-3 rounded-lg border border-[#AE8638]/10">
                                            <div className="flex-1 space-y-2">
                                                <Input
                                                    value={url}
                                                    onChange={(e) => updateScheduleImage(idx, e.target.value)}
                                                    placeholder="URL"
                                                    className="bg-neutral-900 border-[#AE8638]/20 text-white text-xs"
                                                />
                                                {url && <img src={url} className="h-32 object-contain rounded-md border border-[#AE8638]/10 w-full bg-black/50" />}
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeScheduleImage(idx)} className="text-red-500 hover:bg-red-950/20">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Gallery */}
                            <div className="space-y-4 pt-4 border-t border-[#AE8638]/10">
                                <div className="flex justify-between items-center">
                                    <Label className="text-[#AE8638]">Gallery</Label>
                                    <Button type="button" size="sm" onClick={addGalleryImage} className="bg-[#AE8638]/10 text-[#AE8638] hover:bg-[#AE8638] hover:text-black border border-[#AE8638]/50">
                                        <Plus className="w-4 h-4 mr-1" /> Add
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.gallery.map((url: string, idx: number) => (
                                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-[#AE8638]/10 aspect-square">
                                            <img src={url} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center p-2 gap-2">
                                                <Input
                                                    value={url}
                                                    onChange={(e) => updateGalleryImage(idx, e.target.value)}
                                                    className="h-8 text-xs bg-black/80 border-none text-white w-full"
                                                />
                                                <Button type="button" variant="destructive" size="icon" onClick={() => removeGalleryImage(idx)} className="h-8 w-8">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional */}
                    <Card className="bg-neutral-900/50 border border-[#AE8638]/20 shadow-xl">
                        <CardHeader className="border-b border-[#AE8638]/10">
                            <div className="flex items-center gap-2">
                                <Type className="w-5 h-5 text-[#AE8638]" />
                                <CardTitle className="text-white">Extra Content</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="flex justify-between items-center">
                                <Label className="text-[#AE8638]">Sub-sections</Label>
                                <Button type="button" size="sm" onClick={addSubHeading} className="bg-[#AE8638]/10 text-[#AE8638] hover:bg-[#AE8638] hover:text-black border border-[#AE8638]/50">
                                    <Plus className="w-4 h-4 mr-1" /> Add
                                </Button>
                            </div>
                            {formData.subHeadings.map((sub: any, idx: number) => (
                                <div key={idx} className="space-y-3 bg-black/40 p-4 rounded-lg border border-[#AE8638]/10">
                                    <div className="flex justify-between">
                                        <Label className="text-gray-400">Section {idx + 1}</Label>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeSubHeading(idx)} className="text-red-500 hover:bg-red-950/20 h-6">Remove</Button>
                                    </div>
                                    <Input
                                        placeholder="Title (e.g. Terms)"
                                        value={sub.title}
                                        onChange={(e) => updateSubHeading(idx, 'title', e.target.value)}
                                        className="bg-neutral-900 border-[#AE8638]/20 text-white"
                                    />
                                    <Textarea
                                        placeholder="Content"
                                        value={sub.content}
                                        onChange={(e) => updateSubHeading(idx, 'content', e.target.value)}
                                        className="min-h-[80px] bg-neutral-900 border-[#AE8638]/20 text-white"
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4 sticky bottom-6 z-10 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-[#AE8638]/20 shadow-2xl">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.back()}
                            className="text-gray-400 hover:text-white"
                        >
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            size="lg"
                            disabled={saving}
                            className="bg-[#AE8638] hover:bg-[#AE8638]/90 text-black font-bold shadow-[0_0_20px_rgba(174,134,56,0.3)] w-40"
                        >
                            {saving ? 'Saving...' : 'Update Event'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ClockIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
