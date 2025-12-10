
'use client';

import { useState, useEffect } from 'react';
import { useRouter as useNextRouter, useParams as useNextParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, Info, RotateCcw } from 'lucide-react';

export default function EditEventPage() {
    const router = useNextRouter();
    const params = useNextParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [event, setEvent] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);

    // Form State
    const [price, setPrice] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(0);
    const [dateOverrides, setDateOverrides] = useState<Record<string, number>>({});
    const [dateRange, setDateRange] = useState<string[]>([]);

    useEffect(() => {
        if (params.id) {
            fetchEvent();
        }
    }, [params.id]);

    const fetchEvent = async () => {
        try {
            const res = await fetch(`/api/venue-manager/events/${params.id}`);
            const data = await res.json();

            if (data.success) {
                const evt = data.data.event;
                setEvent(evt);
                setStats(data.data.stats);
                setPrice(evt.ticketConfig.price);
                setQuantity(evt.ticketConfig.quantity);
                setDateOverrides(evt.ticketConfig.dateSpecificCapacities || {});

                // Generate date range
                const dates = [];
                let d = new Date(evt.startDate);
                const end = new Date(evt.endDate);
                while (d <= end) {
                    dates.push(d.toDateString());
                    d.setDate(d.getDate() + 1);
                }
                setDateRange(dates);

            } else {
                toast.error('Failed to load event');
                router.back();
            }
        } catch (error) {
            console.error('Error fetching event:', error);
            toast.error('Error loading event details');
        } finally {
            setLoading(false);
        }
    };

    const handleOverrideChange = (date: string, val: string) => {
        const num = parseInt(val);
        if (isNaN(num)) return; // Handle empty/invalid
        setDateOverrides(prev => ({
            ...prev,
            [date]: num
        }));
    };

    const clearOverride = (date: string) => {
        const newOverrides = { ...dateOverrides };
        delete newOverrides[date];
        setDateOverrides(newOverrides);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/venue-manager/events/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketConfig: {
                        // price: Number(price), // Removed: VM cannot update price
                        quantity: Number(quantity),
                        dateSpecificCapacities: dateOverrides
                    }
                })
            });

            const data = await res.json();
            if (data.success) {
                toast.success('Event Updated Successfully');
                router.push(`/venue-manager/events/${params.id}`);
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to update event');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <p className="text-[#AE8638] animate-pulse">Loading Event...</p>
        </div>
    );

    if (!event) return null;

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="text-[#AE8638] hover:bg-[#AE8638]/10 hover:text-[#AE8638]"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Edit Ticket Configuration</h1>
                        <p className="text-gray-400 text-sm">Update pricing and capacity for {event.title}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Read-Only Info */}
                    <Card className="bg-black border border-[#AE8638]/30">
                        <CardHeader>
                            <CardTitle className="text-[#AE8638] text-sm">Event Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-500 text-xs">Dates</Label>
                                <p className="text-sm text-white">{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <Label className="text-gray-500 text-xs">Total Sold</Label>
                                <p className="text-sm font-bold text-green-400">{stats?.totalSold || 0} Tickets</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Global Settings */}
                    <Card className="bg-black border border-[#AE8638]/30">
                        <CardHeader>
                            <CardTitle className="text-[#AE8638] text-sm">Global Settings</CardTitle>
                            <CardDescription className="text-gray-500">Default settings for all days.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-white">Ticket Price ({event.ticketConfig.currency})</Label>
                                    <Input
                                        type="number"
                                        value={price}
                                        disabled
                                        className="bg-muted text-gray-400 border-[#AE8638]/10 cursor-not-allowed"
                                    />
                                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                        <Info className="w-3 h-3" /> Set by Admin. Cannot be changed.
                                    </p>
                                </div>

                                {event.ticketConfig.allDayPrice && (
                                    <div className="space-y-2">
                                        <Label className="text-white">All Day Price ({event.ticketConfig.currency})</Label>
                                        <Input
                                            type="number"
                                            value={event.ticketConfig.allDayPrice}
                                            disabled
                                            className="bg-muted text-gray-400 border-[#AE8638]/10 cursor-not-allowed"
                                        />
                                        <p className="text-[10px] text-gray-500">Set by Admin.</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-white">Default Daily Capacity</Label>
                                    <Input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="bg-black border-[#AE8638]/30 text-white focus:ring-[#AE8638]"
                                        min="1"
                                    />
                                    <p className="text-[10px] text-gray-500">Max tickets per day by default.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Per-Day Overrides */}
                    <Card className="bg-black border border-[#AE8638]/30">
                        <CardHeader>
                            <CardTitle className="text-[#AE8638] text-sm">Daily Capacity Overrides</CardTitle>
                            <CardDescription className="text-gray-500">Set specific ticket limits for specific dates. Leave blank to use Default Capacity.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {dateRange.map((dateStr) => {
                                    const hasOverride = dateOverrides.hasOwnProperty(dateStr);
                                    const val = hasOverride ? dateOverrides[dateStr] : '';
                                    const usage = stats?.dailyBreakdown?.[dateStr] || 0;

                                    return (
                                        <div key={dateStr} className={`p-3 rounded border ${hasOverride ? 'border-[#AE8638]/50 bg-[#AE8638]/10' : 'border-[#AE8638]/10 bg-white/5'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <Label className="text-white text-xs font-semibold">{new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</Label>
                                                {hasOverride && (
                                                    <Button type="button" variant="ghost" size="icon" className="h-4 w-4 text-gray-400 hover:text-white" onClick={() => clearOverride(dateStr)}>
                                                        <RotateCcw className="w-3 h-3" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <Input
                                                    type="number"
                                                    placeholder={`${quantity}`} // Placeholder shows default
                                                    value={val}
                                                    onChange={(e) => handleOverrideChange(dateStr, e.target.value)}
                                                    className={`h-8 bg-black border-${hasOverride ? '[#AE8638]' : 'gray-700'} text-white text-sm`}
                                                />
                                                <div className="flex justify-between text-[10px] text-gray-500">
                                                    <span>Sold: {usage}</span>
                                                    <span>Left: {(hasOverride ? (val as number) : quantity) - usage}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="border-[#AE8638]/30 text-gray-400 hover:text-white hover:bg-[#AE8638]/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-[#AE8638] hover:bg-[#AE8638]/90 text-black font-bold"
                        >
                            {saving ? 'Saving...' : 'Save Changes'} <Save className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
