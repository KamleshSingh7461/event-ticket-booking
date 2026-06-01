'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PayUForm } from '@/components/PayUForm';
import { Navbar } from '@/components/Navbar';
import { toast } from 'sonner';
import BackButton from '@/components/BackButton';

export default function CheckoutPage() {
    const params = useParams();
    const eventId = params.id as string;
    const router = useRouter();
    const { data: session, status } = useSession();

    const [loading, setLoading] = useState(false);
    const [event, setEvent] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);
    const [bookingType, setBookingType] = useState<'DAILY' | 'ALL_DAY'>('DAILY');

    // Multi-day selection state
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [availableDates, setAvailableDates] = useState<Date[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: 'male',
        address: '',
        state: '',
    });

    const [payuParams, setPayuParams] = useState<any>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            toast.error('Please login to book tickets');
            router.push(`/login?callbackUrl=/checkout/${eventId}`);
            return;
        }

        if (status === 'authenticated' && session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user.name || '',
                email: session.user.email || '',
            }));
        }

        // Fetch event details to show summary
        fetch(`/api/events?id=${eventId}`).then(res => res.json()).then(data => {
            if (data.data) {
                const ev = data.data.find((e: any) => e._id === eventId);
                setEvent(ev);

                // Generate dates
                if (ev.startDate && ev.endDate) {
                    const start = new Date(ev.startDate);
                    const end = new Date(ev.endDate);
                    const dates = [];
                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                        dates.push(new Date(d));
                    }
                    setAvailableDates(dates);
                    // Default select none? or first one? Let's leave empty to force user choice
                }
            }
        });
    }, [eventId, status, session, router]);

    const isDateDisabled = (date: Date) => {
        if (!event) return false;

        const now = new Date();
        const d = new Date(date);
        
        // Reset times for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const compareDate = new Date(d);
        compareDate.setHours(0, 0, 0, 0);

        // 1. Past Dates
        if (compareDate < today) return true;

        // Find daily config for this date
        const config = event.dailyConfig?.find((c: any) => {
            const configDate = new Date(c.date);
            return configDate.toDateString() === d.toDateString();
        });

        // 2. Manual Sold Out (Global or Daily)
        if (event.isSoldOut) return true;
        if (config?.isSoldOut) return true;

        // 3. Start / Cutoff Time (If date is today)
        if (compareDate.getTime() === today.getTime()) {
            const startTime = config?.startTime;
            if (startTime) {
                const [hours, minutes] = startTime.split(':').map(Number);
                const startDate = new Date();
                startDate.setHours(hours, minutes, 0, 0);
                if (now < startDate) return true; // Booking hasn't started yet
            }

            const cutoff = config?.cutoffTime || event.bookingCutOffTime;
            if (cutoff) {
                const [hours, minutes] = cutoff.split(':').map(Number);
                const cutoffDate = new Date();
                cutoffDate.setHours(hours, minutes, 0, 0);
                if (now > cutoffDate) return true;
            }
        }

        return false;
    };

    const toggleDate = (dateIso: string) => {
        const date = new Date(dateIso);
        if (isDateDisabled(date)) {
            toast.error('This date is no longer available for booking.');
            return;
        }

        if (selectedDates.includes(dateIso)) {
            setSelectedDates(selectedDates.filter(d => d !== dateIso));
        } else {
            setSelectedDates([...selectedDates, dateIso]);
        }
    };

    const selectAllDates = () => {
        if (availableDates.length === 0) return;
        if (selectedDates.length === availableDates.length) {
            setSelectedDates([]); // Deselect All
        } else {
            // Only select dates that are NOT disabled
            const validDates = availableDates.filter(d => !isDateDisabled(d)).map(d => d.toISOString());
            setSelectedDates(validDates);
        }
    };

    // Effect to handle booking type changes (Auto select all dates for ALL_DAY)
    useEffect(() => {
        if (bookingType === 'ALL_DAY' && availableDates.length > 0) {
            const validDates = availableDates.filter(d => !isDateDisabled(d)).map(d => d.toISOString());
            setSelectedDates(validDates);
        } else if (bookingType === 'DAILY') {
            setSelectedDates([]);
        }
    }, [bookingType, availableDates]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (selectedDates.length === 0) {
            toast.error('Please select at least one date for your visit.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/bookings/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    quantity,
                    selectedDates: selectedDates,
                    bookingType, // Send booking type
                    user: { ...formData }
                }),
            });

            const data = await res.json();

            if (data.success) {
                setPayuParams(data.payuParams);
            } else {
                toast.error('Booking failed: ' + data.error);
                setLoading(false);
            }
        } catch (err) {
            toast.error('Something went wrong');
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
                <div className="animate-spin h-8 w-8 border-4 border-[#AE8638] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (payuParams) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0A0A0A] text-white">
                <div className="text-center bg-[#111] p-12 border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(174,134,56,0.15)]">
                    <p className="text-xl font-bold mb-6 text-[#AE8638]">Redirecting to Secure Payment Gateway</p>
                    <div className="animate-spin h-10 w-10 border-4 border-[#AE8638] border-t-transparent rounded-full mx-auto"></div>
                </div>
                <PayUForm action={payuParams.action} params={payuParams.params} />
            </div>
        );
    }

    const calculateDailyTotal = () => {
        if (!event || !event.ticketConfig) return 0;
        let sum = 0;
        for (const dateIso of selectedDates) {
            const d = new Date(dateIso);
            const config = event.dailyConfig?.find((c: any) => {
                const configDate = new Date(c.date);
                return configDate.toDateString() === d.toDateString();
            });
            sum += (config?.price !== undefined && config?.price !== null && config?.price !== "") 
                    ? Number(config.price) 
                    : Number(event.ticketConfig.price);
        }
        return sum * quantity;
    };

    const totalPrice = event
        ? (bookingType === 'ALL_DAY' && event.ticketConfig?.allDayPrice
            ? Number(event.ticketConfig.allDayPrice) * quantity
            : calculateDailyTotal())
        : 0;

    return (
        <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white selection:bg-[#AE8638] selection:text-black">
            <Navbar />

            {event && (
                <div className="relative h-64 md:h-[400px] w-full overflow-hidden bg-black">
                    {/* Background Image */}
                    {event.banner ? (
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen"
                            style={{ backgroundImage: `url(${event.banner})` }}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />

                    {/* Overlay Content */}
                    <div className="absolute inset-0 flex flex-col justify-end pb-12 pt-24 z-10">
                        <div className="container px-4">
                            <div className="mb-6">
                                <BackButton className="text-white hover:text-black bg-white/10 backdrop-blur-md hover:bg-[#AE8638] p-2 rounded-full transition-colors border border-white/20 shadow-lg" />
                            </div>
                            <span className="bg-[#AE8638]/20 text-[#AE8638] border border-[#AE8638]/50 backdrop-blur-md w-fit px-3 py-1 rounded-full text-[10px] font-bold mb-4 uppercase tracking-widest block">
                                Checkout
                            </span>
                            <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter drop-shadow-md leading-tight text-white">{event.title}</h1>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-gray-300 text-sm md:text-base font-medium">
                                <span>{new Date(event.startDate).toDateString()} - {new Date(event.endDate).toDateString()}</span>
                                {event.venue && <span className="hidden md:inline text-[#AE8638]">• {event.venue}</span>}
                                {event.venue && <span className="md:hidden text-[#AE8638]">{event.venue}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="container px-4 py-8 md:py-16 flex flex-col items-center -mt-12 relative z-20">
                <Card className="w-full max-w-xl bg-[#111111] border border-white/10 shadow-[0_0_40px_rgba(174,134,56,0.1)] rounded-2xl overflow-hidden backdrop-blur-xl">
                    <CardHeader className="border-b border-white/10 bg-black/40 pb-6 pt-8 text-center">
                        <CardTitle className="text-2xl font-bold text-white tracking-tight">Complete Registration</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8 px-6 md:px-10">
                        {event && (
                            <div className="mb-8">
                                {/* Booking Type Selection */}
                                {event.ticketConfig?.allDayPrice && (
                                    <div className="mb-8 bg-black/30 p-6 border border-white/10 rounded-xl">
                                        <Label className="text-[#AE8638] mb-4 block text-xs uppercase tracking-widest font-bold">Select Access Type</Label>
                                                <RadioGroup
                                                    value={bookingType}
                                                    onValueChange={(v: any) => setBookingType(v)}
                                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                                >
                                                    <div className={`
                                                            flex items-center space-x-3 border rounded-xl p-4 cursor-pointer transition-all
                                                            ${bookingType === 'DAILY' ? 'border-[#AE8638] bg-[#AE8638]/10 shadow-[0_0_15px_rgba(174,134,56,0.2)] ring-1 ring-[#AE8638]' : 'border-white/20 bg-black/50 hover:border-white/40'}
                                                        `}>
                                                        <RadioGroupItem value="DAILY" id="daily" className={`border-white/40 ${bookingType === 'DAILY' ? 'text-[#AE8638] border-[#AE8638]' : ''}`} />
                                                        <Label htmlFor="daily" className="cursor-pointer text-white font-bold">Daily Pass</Label>
                                                    </div>
                                                    <div className={`
                                                            flex items-center space-x-3 border rounded-xl p-4 transition-all relative
                                                            ${availableDates.some(d => isDateDisabled(d)) ? 'opacity-50 cursor-not-allowed border-white/10 bg-black' : 'cursor-pointer ' + (bookingType === 'ALL_DAY' ? 'border-[#AE8638] bg-[#AE8638]/10 shadow-[0_0_15px_rgba(174,134,56,0.2)] ring-1 ring-[#AE8638]' : 'border-white/20 bg-black/50 hover:border-white/40')}
                                                        `}>
                                                        <RadioGroupItem 
                                                            value="ALL_DAY" 
                                                            id="allday" 
                                                            disabled={availableDates.some(d => isDateDisabled(d))}
                                                            className={`border-white/40 ${bookingType === 'ALL_DAY' ? 'text-[#AE8638] border-[#AE8638]' : ''}`} 
                                                        />
                                                        <Label htmlFor="allday" className={`text-white font-bold ${availableDates.some(d => isDateDisabled(d)) ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                                            Season Pass
                                                            <span className="block text-sm text-[#AE8638] font-medium mt-1">
                                                                {event.ticketConfig.currency} {event.ticketConfig.allDayPrice}
                                                            </span>
                                                        </Label>
                                                        {availableDates.some(d => isDateDisabled(d)) && (
                                                            <span className="absolute -top-3 -right-3 bg-red-950/80 text-red-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border border-red-500/50 backdrop-blur-md">Unavailable</span>
                                                        )}
                                                    </div>
                                                </RadioGroup>
                                    </div>
                                )}

                                {/* Date Selection Grid */}
                                <div className="mt-6">
                                    <div className="flex justify-between items-center mb-5">
                                        <Label className="text-[#AE8638] text-xs uppercase tracking-widest font-bold">Select Dates</Label>
                                        {bookingType === 'DAILY' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={selectAllDates}
                                                className="text-white hover:text-black hover:bg-[#AE8638] h-8 px-4 rounded-lg border border-white/20 text-xs font-bold transition-colors"
                                            >
                                                {selectedDates.length === availableDates.length ? 'Clear All' : 'Select All'}
                                            </Button>
                                        )}
                                    </div>

                                    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${bookingType === 'ALL_DAY' ? 'opacity-60 pointer-events-none' : ''}`}>
                                        {availableDates.map((date) => {
                                            const iso = date.toISOString();
                                            const isSelected = selectedDates.includes(iso);
                                            const disabled = isDateDisabled(date);
                                            
                                            // Determine reason for being disabled
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            const compareDate = new Date(date);
                                            compareDate.setHours(0, 0, 0, 0);
                                            const isPast = compareDate < today;

                                            return (
                                                <div
                                                    key={iso}
                                                    onClick={() => !disabled && toggleDate(iso)}
                                                    className={`
                                                        relative rounded-xl border p-4 text-center transition-all duration-300
                                                        ${isPast
                                                            ? 'bg-black/50 text-gray-600 border-white/5 cursor-not-allowed'
                                                            : disabled 
                                                                ? 'bg-black/50 text-gray-600 border-white/5 cursor-not-allowed' 
                                                                : isSelected
                                                                    ? 'bg-[#AE8638] text-black border-[#AE8638] shadow-[0_0_15px_rgba(174,134,56,0.4)] font-bold cursor-pointer'
                                                                    : 'bg-black/40 hover:bg-white/10 text-white border-white/10 hover:border-[#AE8638]/50 cursor-pointer'
                                                        }
                                                    `}
                                                >
                                                    <div className="text-xl leading-none mb-1 font-bold">{date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
                                                    <div className={`text-xs font-medium uppercase tracking-wider ${isSelected ? 'text-black/70' : 'text-gray-400'}`}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                                    
                                                    {isPast ? (
                                                        <span className="absolute -top-2 -right-2 bg-gray-800 text-[9px] text-gray-400 px-2 py-0.5 uppercase tracking-wider font-bold rounded-full border border-gray-600">Locked</span>
                                                    ) : disabled && (
                                                        <span className="absolute -top-2 -right-2 bg-red-950/90 text-[9px] text-red-400 px-2 py-0.5 uppercase tracking-wider font-bold shadow-lg rounded-full border border-red-500/50 backdrop-blur-md">Sold Out</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {bookingType === 'ALL_DAY' && (
                                        <p className="text-xs text-[#AE8638] mt-4 font-medium flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#AE8638]"></span>
                                            All dates are included in the Season Pass.
                                        </p>
                                    )}
                                    {bookingType === 'DAILY' && selectedDates.length === 0 && (
                                        <p className="text-xs text-red-400 mt-4 font-medium bg-red-950/30 p-2 rounded border border-red-900/50 inline-block">Please select at least one date to continue.</p>
                                    )}
                                </div>

                                {selectedDates.length > 0 && (
                                    <>
                                        <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-8">
                                    <Label className="text-[#AE8638] text-xs uppercase tracking-widest font-bold">Quantity</Label>
                                    <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-xl p-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="text-white hover:bg-white/10 hover:text-[#AE8638] rounded-lg h-10 w-10"
                                        >-</Button>
                                        <span className="w-8 text-center font-bold text-2xl text-white">{quantity}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setQuantity(Math.min(10, quantity + 1))}
                                            className="text-white hover:bg-white/10 hover:text-[#AE8638] rounded-lg h-10 w-10"
                                        >+</Button>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-4 bg-black/40 border border-white/10 rounded-xl p-6">
                                    <div className="flex justify-between text-sm text-gray-400 font-medium">
                                        <span>Type:</span>
                                        <span className="text-white">{bookingType === 'ALL_DAY' ? 'Season Pass' : 'Daily Pass'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400 font-medium">
                                        <span>{bookingType === 'ALL_DAY' ? 'Pass Price:' : 'Price per Day:'}</span>
                                        <span className="text-white">
                                            {event.ticketConfig?.currency} {bookingType === 'ALL_DAY' ? event.ticketConfig?.allDayPrice : event.ticketConfig?.price}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400 font-medium">
                                        <span>Selected Days:</span>
                                        <span className="text-white">{selectedDates.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400 font-medium">
                                        <span>Quantity:</span>
                                        <span className="text-white">{quantity}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400 font-medium pt-3 border-t border-white/10 mt-3">
                                        <span>Base Price:</span>
                                        <span className="text-white">{event.ticketConfig?.currency} {totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400 font-medium">
                                        <span>Convenience Fee (3%):</span>
                                        <span className="text-white">{event.ticketConfig?.currency} {(totalPrice * 0.03).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400 font-medium">
                                        <span>GST (18%):</span>
                                        <span className="text-white">{event.ticketConfig?.currency} {((totalPrice + totalPrice * 0.03) * 0.18).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-2xl pt-5 border-t border-white/20 mt-3 text-white">
                                        <span>Total:</span>
                                        <span className="text-[#AE8638]">{event.ticketConfig?.currency} {((totalPrice + totalPrice * 0.03) * 1.18).toFixed(2)}</span>
                                    </div>
                                </div>
                                    </>
                                )}
                            </div>
                        )}

                        {event && selectedDates.length > 0 && (
                            <form onSubmit={handleSubmit} className="space-y-6 border-t border-white/10 pt-10 mt-10">
                            <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-6 border-l-4 border-[#AE8638] pl-3">Attendee Information</h3>
                            
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[#AE8638] font-bold uppercase tracking-wider text-xs">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="John Doe"
                                    className="bg-black/50 border-white/20 text-white placeholder:text-gray-600 focus:border-[#AE8638] focus:ring-1 focus:ring-[#AE8638] rounded-xl h-14"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="age" className="text-[#AE8638] font-bold uppercase tracking-wider text-xs">Age</Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        required
                                        placeholder="25"
                                        className="bg-black/50 border-white/20 text-white placeholder:text-gray-600 focus:border-[#AE8638] focus:ring-1 focus:ring-[#AE8638] rounded-xl h-14"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender" className="text-[#AE8638] font-bold uppercase tracking-wider text-xs">Gender</Label>
                                    <Select onValueChange={(v) => setFormData({ ...formData, gender: v })} defaultValue="male">
                                        <SelectTrigger className="bg-black/50 border-white/20 text-white focus:border-[#AE8638] focus:ring-1 focus:ring-[#AE8638] rounded-xl h-14">
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#111111] border-white/20 text-white rounded-xl">
                                            <SelectItem value="male" className="focus:bg-white/10 focus:text-[#AE8638]">Male</SelectItem>
                                            <SelectItem value="female" className="focus:bg-white/10 focus:text-[#AE8638]">Female</SelectItem>
                                            <SelectItem value="other" className="focus:bg-white/10 focus:text-[#AE8638]">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[#AE8638] font-bold uppercase tracking-wider text-xs">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    placeholder="name@company.com"
                                    className="bg-black/50 border-white/20 text-white placeholder:text-gray-600 focus:border-[#AE8638] focus:ring-1 focus:ring-[#AE8638] rounded-xl h-14"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-[#AE8638] font-bold uppercase tracking-wider text-xs">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    placeholder="9876543210"
                                    className="bg-black/50 border-white/20 text-white placeholder:text-gray-600 focus:border-[#AE8638] focus:ring-1 focus:ring-[#AE8638] rounded-xl h-14"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-[#AE8638] font-bold uppercase tracking-wider text-xs">Billing Address</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                    placeholder="Apartment, Street, Area"
                                    className="bg-black/50 border-white/20 text-white placeholder:text-gray-600 focus:border-[#AE8638] focus:ring-1 focus:ring-[#AE8638] rounded-xl h-14"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state" className="text-[#AE8638] font-bold uppercase tracking-wider text-xs">State / Province</Label>
                                <Select onValueChange={(v) => setFormData({ ...formData, state: v })} required>
                                    <SelectTrigger className="bg-black/50 border-white/20 text-white focus:border-[#AE8638] focus:ring-1 focus:ring-[#AE8638] rounded-xl h-14">
                                        <SelectValue placeholder="Select State" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#111111] border-white/20 text-white rounded-xl max-h-[300px]">
                                        {[
                                            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
                                            "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
                                            "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
                                            "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
                                            "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
                                            "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", 
                                            "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", 
                                            "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
                                        ].map(state => (
                                            <SelectItem key={state} value={state} className="focus:bg-white/10 focus:text-[#AE8638]">
                                                {state}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit" className="w-full mt-8 bg-[#AE8638] text-black hover:bg-[#F7EF8A] font-bold rounded-xl h-16 text-lg shadow-[0_0_20px_rgba(174,134,56,0.3)] hover:shadow-[0_0_30px_rgba(174,134,56,0.5)] transition-all" disabled={loading || selectedDates.length === 0}>
                                {loading ? 'Processing...' : `Pay ${event?.ticketConfig?.currency} ${((totalPrice + totalPrice * 0.03) * 1.18).toFixed(2)}`}
                            </Button>
                        </form>
                        )}
                    </CardContent>
                    <CardFooter className="justify-center text-xs text-gray-500 bg-black/40 py-6 border-t border-white/10 uppercase tracking-widest font-medium text-center">
                        Secure 256-bit encrypted transaction.<br className="md:hidden" /> By proceeding, you agree to our Terms of Service.
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
