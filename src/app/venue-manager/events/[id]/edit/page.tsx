
'use client';

import { useState, useEffect } from 'react';
import { useRouter as useNextRouter, useParams as useNextParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, Info, RotateCcw, UserPlus, X } from 'lucide-react';

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
    const [availableCoordinators, setAvailableCoordinators] = useState<any[]>([]);
    const [assignedCoordinators, setAssignedCoordinators] = useState<string[]>([]);

    useEffect(() => {
        if (params.id) {
            fetchEvent();
            fetchCoordinators();
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
                setAssignedCoordinators(evt.assignedCoordinators?.map((c: any) => c._id || c) || []);

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

    const fetchCoordinators = async () => {
        try {
            const res = await fetch('/api/venue-manager/coordinators');
            const data = await res.json();
            if (data.success) {
                setAvailableCoordinators(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching coordinators:', error);
        }
    };

    const toggleCoordinator = (coordinatorId: string) => {
        setAssignedCoordinators(prev => {
            if (prev.includes(coordinatorId)) {
                return prev.filter(id => id !== coordinatorId);
            } else {
                return [...prev, coordinatorId];
            }
        });
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
                        price: Number(price), // VM can now update price
                        quantity: Number(quantity),
                        dateSpecificCapacities: dateOverrides
                    },
                    assignedCoordinators
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
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#AE8638]/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#AE8638]/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="text-[#AE8638] hover:bg-[#AE8638]/10 hover:text-[#AE8638] rounded-full"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#AE8638] via-[#D4AF37] to-[#AE8638]">
                                Edit Event Capacity
                            </h1>
                            <p className="text-gray-400 mt-1">Manage pricing and inventory for <span className="text-white font-semibold">{event.title}</span></p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="border-[#AE8638]/30 text-gray-400 hover:text-white hover:bg-[#AE8638]/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="bg-gradient-to-r from-[#AE8638] to-[#8B6B20] hover:from-[#BF953F] hover:to-[#9E7C2B] text-black font-bold shadow-[0_0_20px_rgba(174,134,56,0.3)] transition-all hover:scale-105"
                        >
                            {saving ? (
                                <span className="flex items-center gap-2">Saving...</span>
                            ) : (
                                <span className="flex items-center gap-2">Save Changes <Save className="w-4 h-4" /></span>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Stats & Global Settings */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Summary Card */}
                        <Card className="bg-black/40 backdrop-blur-md border border-[#AE8638]/20 shadow-xl overflow-hidden group hover:border-[#AE8638]/40 transition-colors">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#AE8638] to-transparent opacity-50" />
                            <CardHeader>
                                <CardTitle className="text-[#AE8638] flex items-center gap-2 text-lg">
                                    <Info className="w-5 h-5" /> Quick Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-3 rounded-lg bg-[#AE8638]/10 border border-[#AE8638]/20">
                                    <Label className="text-[#AE8638]/80 text-xs uppercase tracking-wider">Total Sold</Label>
                                    <p className="text-2xl font-bold text-white mt-1">{stats?.totalSold || 0}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                        <Label className="text-gray-400 text-xs">Start Date</Label>
                                        <p className="text-sm font-medium text-white mt-1">{new Date(event.startDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                        <Label className="text-gray-400 text-xs">End Date</Label>
                                        <p className="text-sm font-medium text-white mt-1">{new Date(event.endDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Global Settings Card */}
                        <Card className="bg-black/40 backdrop-blur-md border border-[#AE8638]/20 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-[#AE8638] text-lg">Base Configuration</CardTitle>
                                <CardDescription className="text-gray-500">Default settings applied to all days unless overridden.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Ticket Price ({event.ticketConfig.currency})</Label>
                                    <Input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        className="bg-black/50 border-[#AE8638]/30 text-white focus:border-[#AE8638] focus:ring-1 focus:ring-[#AE8638] h-12 text-lg"
                                        min="0"
                                    />
                                    <p className="text-xs text-gray-500">Base price per single day ticket.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Daily Capacity Limit</Label>
                                    <Input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="bg-black/50 border-[#AE8638]/30 text-white focus:border-[#AE8638] focus:ring-1 focus:ring-[#AE8638] h-12 text-lg"
                                        min="1"
                                    />
                                    <p className="text-xs text-gray-500">Maximum tickets available per day.</p>
                                </div>

                                {event.ticketConfig.allDayPrice && (
                                    <div className="p-3 rounded bg-[#AE8638]/5 border border-[#AE8638]/10">
                                        <div className="flex justify-between items-center mb-1">
                                            <Label className="text-[#AE8638]">Season Pass Price</Label>
                                            <span className="text-white font-bold">{event.ticketConfig.currency} {event.ticketConfig.allDayPrice}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500">Fixed price for all 9 days access.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Coordinator Assignment Card */}
                        <Card className="bg-black/40 backdrop-blur-md border border-[#AE8638]/20 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-[#AE8638] text-lg flex items-center gap-2">
                                    <UserPlus className="w-5 h-5" />
                                    Assign Coordinators
                                </CardTitle>
                                <CardDescription className="text-gray-500">Select coordinators who can scan tickets for this event.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {availableCoordinators.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No coordinators available. Create coordinators first.</p>
                                ) : (
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {availableCoordinators.map((coordinator) => {
                                            const isAssigned = assignedCoordinators.includes(coordinator._id);
                                            return (
                                                <div
                                                    key={coordinator._id}
                                                    onClick={() => toggleCoordinator(coordinator._id)}
                                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${isAssigned
                                                            ? 'bg-[#AE8638]/20 border-[#AE8638] shadow-md'
                                                            : 'bg-white/5 border-white/10 hover:border-[#AE8638]/50'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-white font-medium text-sm">{coordinator.name}</p>
                                                            <p className="text-gray-400 text-xs">{coordinator.email}</p>
                                                        </div>
                                                        {isAssigned && (
                                                            <div className="bg-[#AE8638] text-black px-2 py-1 rounded text-xs font-bold">
                                                                ASSIGNED
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {assignedCoordinators.length > 0 && (
                                    <div className="pt-3 border-t border-[#AE8638]/20">
                                        <p className="text-xs text-gray-400">
                                            {assignedCoordinators.length} coordinator(s) assigned
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Daily Overrides */}
                    <div className="lg:col-span-2">
                        <Card className="bg-black/40 backdrop-blur-md border border-[#AE8638]/20 shadow-xl h-full flex flex-col">
                            <CardHeader className="border-b border-[#AE8638]/10 pb-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-[#AE8638] text-xl">Daily Inventory Management</CardTitle>
                                        <CardDescription className="text-gray-500 mt-1">
                                            Manage capacity for specific dates. Useful for weekends or special events.
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDateOverrides({})}
                                        className="text-xs border-red-900/30 text-red-400 hover:bg-red-950/30 hover:text-red-300"
                                    >
                                        Reset All Overrides
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-6 relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {dateRange.map((dateStr) => {
                                        const hasOverride = dateOverrides.hasOwnProperty(dateStr);
                                        const val = hasOverride ? dateOverrides[dateStr] : '';
                                        const usage = stats?.dailyBreakdown?.[dateStr] || 0;
                                        const currentCap = hasOverride ? (val as number) : quantity;
                                        const remaining = currentCap - usage;
                                        const isLow = remaining < 50; // Low stock warning

                                        return (
                                            <div
                                                key={dateStr}
                                                className={`
                                                    group p-4 rounded-xl border transition-all duration-300
                                                    ${hasOverride
                                                        ? 'bg-[#AE8638]/10 border-[#AE8638]/50 shadow-[0_0_15px_rgba(174,134,56,0.1)]'
                                                        : 'bg-white/5 border-white/5 hover:border-[#AE8638]/30 hover:bg-white/10'
                                                    }
                                                `}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="text-white font-bold text-lg">
                                                            {new Date(dateStr).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                        </h4>
                                                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                                                            {new Date(dateStr).toLocaleDateString(undefined, { weekday: 'long' })}
                                                        </p>
                                                    </div>
                                                    {hasOverride && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-[#AE8638] hover:bg-[#AE8638]/20 rounded-full"
                                                            onClick={() => clearOverride(dateStr)}
                                                            title="Remove Override (Use Default)"
                                                        >
                                                            <RotateCcw className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            placeholder={`Default: ${quantity}`}
                                                            value={val}
                                                            onChange={(e) => handleOverrideChange(dateStr, e.target.value)}
                                                            className={`
                                                                bg-black/50 text-white font-medium border-0 focus:ring-1 
                                                                ${hasOverride ? 'focus:ring-[#AE8638] text-[#AE8638]' : 'focus:ring-gray-500'}
                                                                placeholder:text-gray-600
                                                            `}
                                                        />
                                                        {!hasOverride && (
                                                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                                                <span className="text-[10px] text-gray-600 uppercase">Auto</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between text-xs bg-black/30 p-2 rounded">
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-500">Sold</span>
                                                            <span className="text-white font-bold">{usage}</span>
                                                        </div>
                                                        <div className="h-6 w-px bg-white/10" />
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-gray-500">Available</span>
                                                            <span className={`font-bold ${isLow ? 'text-red-400' : 'text-green-400'}`}>
                                                                {remaining}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
