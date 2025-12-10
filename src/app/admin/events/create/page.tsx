'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, UserPlus, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreateEventPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [existingManagers, setExistingManagers] = useState<any[]>([]);

    // Event Data
    const [formData, setFormData] = useState<any>({
        title: '',
        description: '',
        type: 'OFFLINE',
        venue: '',
        banner: '', // Added banner
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

    // ...

    // Schedule Management
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

    // ...



    // Venue Manager Assignment (Super Admin Only)
    const [managerMode, setManagerMode] = useState<'create' | 'existing'>('create');
    const [managerDetails, setManagerDetails] = useState({
        name: '',
        email: '',
        id: ''
    });

    useEffect(() => {
        if (session?.user?.role === 'SUPER_ADMIN') {
            fetchExistingManagers();
        }
    }, [session]);

    const fetchExistingManagers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success) {
                const managers = data.data.filter((u: any) => u.role === 'VENUE_MANAGER');
                setExistingManagers(managers);
            }
        } catch (error) {
            console.error('Failed to fetch managers', error);
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

    // Gallery Management
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
        setLoading(true);

        const data = new FormData();

        // Append basic fields
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('type', formData.type);
        data.append('venue', formData.venue);
        data.append('startDate', formData.startDate);
        data.append('endDate', formData.endDate);
        if (formData.entryTime) data.append('entryTime', formData.entryTime);

        // Append complex fields
        data.append('ticketConfig', JSON.stringify(formData.ticketConfig));
        data.append('subHeadings', JSON.stringify(formData.subHeadings));
        data.append('gallery', JSON.stringify(formData.gallery));
        data.append('scheduleImage', formData.scheduleImage);

        // Append Banner File if exists
        if (formData.banner instanceof File) {
            data.append('banner', formData.banner);
        } else if (typeof formData.banner === 'string') {
            data.append('banner', formData.banner);
        }

        // Attach Manager Details if Super Admin
        if (session?.user?.role === 'SUPER_ADMIN') {
            const managerData = {
                mode: managerMode,
                ...managerDetails
            };
            data.append('venueManagerDetails', JSON.stringify(managerData));
        }

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                // Content-Type header is explicitly NOT set to let browser set boundary
                body: data
            });
            const resData = await res.json();
            if (resData.success) {
                toast.success('Event Created Successfully!');
                router.push('/admin/events');
            } else {
                toast.error(resData.error);
            }
        } catch (err) {
            toast.error('Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Create New Event</h1>
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
                            <Label>Banner Image URL</Label>
                            <Input
                                type="url"
                                name="banner"
                                value={formData.banner}
                                onChange={handleInputChange}
                                placeholder="https://res.cloudinary.com/your-cloud/image/upload/..."
                            />
                            {formData.banner && (
                                <div className="mt-2 relative h-48 w-full rounded-lg overflow-hidden border">
                                    <img
                                        src={formData.banner}
                                        alt="Banner Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = '';
                                            e.currentTarget.alt = 'Invalid image URL';
                                        }}
                                    />
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">Enter the Cloudinary URL for the event banner.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                className="min-h-[100px]"
                            />
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

                        <div className="space-y-2">
                            <Label>Entry Time (HH:mm)</Label>
                            <Input
                                type="time"
                                name="entryTime"
                                value={formData.entryTime || ''}
                                onChange={handleInputChange}
                                placeholder="18:00"
                                className="w-full md:w-1/3"
                            />
                            <p className="text-xs text-muted-foreground">Time (24h) from when entry is allowed. Verification before this time will be rejected.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Venue Manager Assignment (Only for Super Admin) */}
                {session?.user?.role === 'SUPER_ADMIN' && (
                    <Card className="border-primary/50">
                        <CardHeader className="bg-primary/5">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Assign Venue Manager
                            </CardTitle>
                            <CardDescription>Create a new manager account or assign an existing one.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Tabs value={managerMode} onValueChange={(v: any) => setManagerMode(v)} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="create">Create New Manager</TabsTrigger>
                                    <TabsTrigger value="existing">Select Existing</TabsTrigger>
                                </TabsList>
                                <TabsContent value="create" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Manager Name</Label>
                                            <Input
                                                value={managerDetails.name}
                                                onChange={(e) => setManagerDetails({ ...managerDetails, name: e.target.value })}
                                                placeholder="John Doe"
                                                required={managerMode === 'create'}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Manager Email</Label>
                                            <Input
                                                type="email"
                                                value={managerDetails.email}
                                                onChange={(e) => setManagerDetails({ ...managerDetails, email: e.target.value })}
                                                placeholder="manager@example.com"
                                                required={managerMode === 'create'}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-sm text-green-600 flex items-center gap-2">
                                        <UserPlus className="w-4 h-4" />
                                        Credentials will be emailed automatically.
                                    </p>
                                </TabsContent>
                                <TabsContent value="existing" className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Select Manager</Label>
                                        <Select
                                            value={managerDetails.id}
                                            onValueChange={(v) => setManagerDetails({ ...managerDetails, id: v })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a manager" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {existingManagers.map((m: any) => (
                                                    <SelectItem key={m._id} value={m._id}>{m.name} ({m.email})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                )}

                {/* Ticket Config */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ticket Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label>Price (Daily)</Label>
                                <Input type="number" name="price" value={formData.ticketConfig.price} onChange={handleTicketConfigChange} required placeholder="Per day cost" />
                            </div>
                            <div className="space-y-2">
                                <Label>All Day Price (Optional)</Label>
                                <Input type="number" name="allDayPrice" value={formData.ticketConfig.allDayPrice || ''} onChange={handleTicketConfigChange} placeholder="Full event access cost" />
                            </div>
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <Input name="currency" value={formData.ticketConfig.currency} onChange={handleTicketConfigChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Daily Capacity (Tickets/Day)</Label>
                                <Input type="number" name="quantity" value={formData.ticketConfig.quantity} onChange={handleTicketConfigChange} required placeholder="e.g. 500" />
                                <p className="text-[10px] text-gray-500 pt-1">Max tickets allowed per date.</p>
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

                {/* Media & Visuals (Schedule & Gallery) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Media & Schedule</CardTitle>
                        <CardDescription>Add schedule graphics and event gallery.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Schedule Images */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center bg-muted/50 p-2 rounded">
                                <Label>Schedule Graphics</Label>
                                <Button type="button" size="sm" variant="outline" onClick={addScheduleImage}>
                                    <Plus className="w-4 h-4 mr-1" /> Add Schedule URL
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {formData.schedule.map((url: string, idx: number) => (
                                    <div key={idx} className="flex gap-2 items-start">
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                value={url}
                                                onChange={(e) => updateScheduleImage(idx, e.target.value)}
                                                placeholder={`Schedule Image URL #${idx + 1}`}
                                            />
                                            {url && (
                                                <div className="relative h-32 w-full max-w-sm rounded border overflow-hidden bg-muted">
                                                    <img src={url} className="w-full h-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                </div>
                                            )}
                                        </div>
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeScheduleImage(idx)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                {formData.schedule.length === 0 && <p className="text-sm text-muted-foreground italic">No schedule graphics added.</p>}
                            </div>
                            <p className="text-xs text-muted-foreground">URLs for the schedule graphics (displayed in modal).</p>
                        </div>

                        {/* Gallery */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center bg-muted/50 p-2 rounded">
                                <Label>Event Gallery</Label>
                                <Button type="button" size="sm" variant="outline" onClick={addGalleryImage}>
                                    <Plus className="w-4 h-4 mr-1" /> Add Image URL
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {formData.gallery.map((url: string, idx: number) => (
                                    <div key={idx} className="flex gap-2 items-start">
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                value={url}
                                                onChange={(e) => updateGalleryImage(idx, e.target.value)}
                                                placeholder={`Image URL #${idx + 1}`}
                                            />
                                            {url && (
                                                <div className="relative h-20 w-32 rounded border overflow-hidden bg-muted">
                                                    <img src={url} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                </div>
                                            )}
                                        </div>
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeGalleryImage(idx)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                {formData.gallery.length === 0 && <p className="text-sm text-muted-foreground italic">No gallery images added.</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                        <CardDescription>Add custom sections like Rules, Lineup, etc.</CardDescription>
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
                                    <Textarea
                                        placeholder="Content"
                                        value={sub.content}
                                        onChange={(e) => updateSubHeading(idx, 'content', e.target.value)}
                                        className="min-h-[100px]"
                                    />
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
        </div>
    );
}
