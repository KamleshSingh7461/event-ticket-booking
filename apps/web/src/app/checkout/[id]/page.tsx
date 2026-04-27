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

        // 3. Cutoff Time (If date is today)
        if (compareDate.getTime() === today.getTime()) {
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
            // For All Day, we only select valid dates, but wait, usually all day implies all?
            // If some dates are sold out, maybe Season Pass shouldn't be available or should exclude them.
            // Requirement says "all day combined ticket", let's select only valid ones.
            const validDates = availableDates.filter(d => !isDateDisabled(d)).map(d => d.toISOString());
            setSelectedDates(validDates);
        } else if (bookingType === 'DAILY') {
            setSelectedDates([]); // Reset or keep? Resetting is safer to avoid confusion
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
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (payuParams) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-lg mb-4">Redirecting to Payment Gateway...</p>
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                </div>
                <PayUForm action={payuParams.action} params={payuParams.params} />
            </div>
        );
    }

    const totalPrice = event
        ? (bookingType === 'ALL_DAY' && event.ticketConfig?.allDayPrice
            ? event.ticketConfig.allDayPrice * quantity
            : event.ticketConfig?.price * quantity * selectedDates.length)
        : 0;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            {event && (
                <div className="relative h-56 md:h-80 w-full overflow-hidden bg-gray-900 text-white">
                    {/* Background Image */}
                    {event.banner ? (
                        <div
                            className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-80"
                            style={{ backgroundImage: `url(${event.banner})` }}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gray-200" />
                    )}

                    {/* Overlay Content */}
                    <div className="absolute inset-0 flex flex-col justify-end pb-8 md:pb-12">
                        <div className="container px-4">
                            <div className="mb-4">
                                <BackButton className="text-black hover:text-gray-600 bg-white hover:bg-gray-50 p-2 rounded-none transition-colors border border-gray-200 shadow-sm" />
                            </div>
                            <h1 className="text-3xl md:text-5xl font-medium mb-2 tracking-tight drop-shadow-md leading-tight">{event.title}</h1>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-white/90 text-sm md:text-base font-light">
                                <span>{new Date(event.startDate).toDateString()} - {new Date(event.endDate).toDateString()}</span>
                                {event.venue && <span className="hidden md:inline">• {event.venue}</span>}
                                {event.venue && <span className="md:hidden text-white/80">{event.venue}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="container px-4 py-8 md:py-16 flex flex-col items-center -mt-8 md:-mt-12 relative z-10">
                <Card className="w-full max-w-xl shadow-sm border border-gray-200 bg-white rounded-none">
                    <CardHeader className="border-b border-gray-100 pb-6 text-center">
                        <CardTitle className="text-2xl font-semibold text-black tracking-tight">Complete Registration</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                        {event && (
                            <div className="mb-8">
                                {/* Booking Type Selection */}
                                {event.ticketConfig?.allDayPrice && (
                                    <div className="mb-8 bg-gray-50 p-6 border border-gray-200">
                                        <Label className="text-black mb-4 block text-xs uppercase tracking-widest font-bold">Select Access Type</Label>
                                                <RadioGroup
                                                    value={bookingType}
                                                    onValueChange={(v: any) => setBookingType(v)}
                                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                                                >
                                                    <div className={`
                                                            flex items-center space-x-3 border rounded-none p-4 cursor-pointer transition-all
                                                            ${bookingType === 'DAILY' ? 'border-black bg-white shadow-sm ring-1 ring-black' : 'border-gray-200 bg-white hover:border-gray-300'}
                                                        `}>
                                                        <RadioGroupItem value="DAILY" id="daily" className="text-black border-gray-300" />
                                                        <Label htmlFor="daily" className="cursor-pointer text-black font-semibold">Daily Pass</Label>
                                                    </div>
                                                    <div className={`
                                                            flex items-center space-x-3 border rounded-none p-4 transition-all relative
                                                            ${availableDates.some(d => isDateDisabled(d)) ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50' : 'cursor-pointer ' + (bookingType === 'ALL_DAY' ? 'border-black bg-white shadow-sm ring-1 ring-black' : 'border-gray-200 bg-white hover:border-gray-300')}
                                                        `}>
                                                        <RadioGroupItem 
                                                            value="ALL_DAY" 
                                                            id="allday" 
                                                            disabled={availableDates.some(d => isDateDisabled(d))}
                                                            className="text-black border-gray-300" 
                                                        />
                                                        <Label htmlFor="allday" className={`text-black font-semibold ${availableDates.some(d => isDateDisabled(d)) ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                                            Season Pass
                                                            <span className="block text-sm text-gray-500 font-normal mt-1">
                                                                {event.ticketConfig.currency} {event.ticketConfig.allDayPrice}
                                                            </span>
                                                        </Label>
                                                        {availableDates.some(d => isDateDisabled(d)) && (
                                                            <span className="absolute -bottom-2.5 right-2 bg-red-100 text-red-600 px-2 py-0.5 text-[10px] font-bold uppercase whitespace-nowrap border border-red-200">Unavailable</span>
                                                        )}
                                                    </div>
                                                </RadioGroup>
                                    </div>
                                )}

                                {/* Date Selection Grid */}
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <Label className="text-black text-xs uppercase tracking-widest font-bold">Select Dates</Label>
                                        {bookingType === 'DAILY' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={selectAllDates}
                                                className="text-black hover:bg-gray-100 h-8 px-3 rounded-none border border-gray-200 text-xs font-semibold"
                                            >
                                                {selectedDates.length === availableDates.length ? 'Clear All' : 'Select All'}
                                            </Button>
                                        )}
                                    </div>

                                    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${bookingType === 'ALL_DAY' ? 'opacity-50 pointer-events-none' : ''}`}>
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
                                                        relative rounded-none border p-3 text-center transition-all
                                                        ${isPast
                                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                            : disabled 
                                                                ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed grayscale' 
                                                                : isSelected
                                                                    ? 'bg-black text-white border-black shadow-sm font-bold cursor-pointer ring-1 ring-black'
                                                                    : 'bg-white hover:bg-gray-50 text-black border-gray-200 hover:border-gray-300 cursor-pointer'
                                                        }
                                                    `}
                                                >
                                                    <div className="text-lg leading-none mb-1">{date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
                                                    <div className="text-xs font-normal uppercase tracking-wider">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                                    
                                                    {isPast ? (
                                                        <span className="absolute -top-2 -right-2 bg-gray-200 text-[9px] text-gray-600 px-1.5 py-0.5 uppercase font-bold border border-gray-300">Locked</span>
                                                    ) : disabled && (
                                                        <span className="absolute -top-2 -right-2 bg-red-600 text-[9px] text-white px-1.5 py-0.5 uppercase font-bold shadow-sm">Sold Out</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {bookingType === 'ALL_DAY' && (
                                        <p className="text-xs text-gray-500 mt-3 font-medium">* All dates are included in the Season Pass.</p>
                                    )}
                                    {bookingType === 'DAILY' && selectedDates.length === 0 && (
                                        <p className="text-xs text-red-600 mt-3 font-medium">Please select at least one date to continue.</p>
                                    )}
                                </div>

                                {selectedDates.length > 0 && (
                                    <>
                                        <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
                                    <Label className="text-black text-xs uppercase tracking-widest font-bold">Quantity</Label>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="border-gray-200 text-black hover:bg-gray-100 rounded-none h-10 w-10"
                                        >-</Button>
                                        <span className="w-8 text-center font-bold text-xl text-black">{quantity}</span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setQuantity(Math.min(10, quantity + 1))}
                                            className="border-gray-200 text-black hover:bg-gray-100 rounded-none h-10 w-10"
                                        >+</Button>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3 bg-gray-50 border border-gray-200 p-6">
                                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                                        <span>Type:</span>
                                        <span className="text-black">{bookingType === 'ALL_DAY' ? 'Season Pass' : 'Daily Pass'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                                        <span>{bookingType === 'ALL_DAY' ? 'Pass Price:' : 'Price per Day:'}</span>
                                        <span className="text-black">
                                            {event.ticketConfig?.currency} {bookingType === 'ALL_DAY' ? event.ticketConfig?.allDayPrice : event.ticketConfig?.price}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                                        <span>Selected Days:</span>
                                        <span className="text-black">{selectedDates.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                                        <span>Quantity:</span>
                                        <span className="text-black">{quantity}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 font-medium pt-2 border-t border-gray-200 mt-2">
                                        <span>Base Price:</span>
                                        <span className="text-black">{event.ticketConfig?.currency} {totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                                        <span>Convenience Fee (3%):</span>
                                        <span className="text-black">{event.ticketConfig?.currency} {(totalPrice * 0.03).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 font-medium">
                                        <span>GST (18%):</span>
                                        <span className="text-black">{event.ticketConfig?.currency} {((totalPrice + totalPrice * 0.03) * 0.18).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-xl pt-4 border-t border-black mt-2 text-black">
                                        <span>Total:</span>
                                        <span>{event.ticketConfig?.currency} {((totalPrice + totalPrice * 0.03) * 1.18).toFixed(2)}</span>
                                    </div>
                                </div>
                                    </>
                                )}
                            </div>
                        )}

                        {event && selectedDates.length > 0 && (
                            <form onSubmit={handleSubmit} className="space-y-5 border-t border-gray-100 pt-8 mt-8">
                            <h3 className="text-lg font-semibold text-black uppercase tracking-widest mb-4">Attendee Information</h3>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-black font-semibold uppercase tracking-wider text-xs">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="John Doe"
                                    className="bg-white border-gray-200 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black rounded-none h-12"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="age" className="text-black font-semibold uppercase tracking-wider text-xs">Age</Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        required
                                        placeholder="25"
                                        className="bg-white border-gray-200 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black rounded-none h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender" className="text-black font-semibold uppercase tracking-wider text-xs">Gender</Label>
                                    <Select onValueChange={(v) => setFormData({ ...formData, gender: v })} defaultValue="male">
                                        <SelectTrigger className="bg-white border-gray-200 text-black focus:border-black focus:ring-1 focus:ring-black rounded-none h-12">
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-200 text-black rounded-none">
                                            <SelectItem value="male" className="focus:bg-gray-100 focus:text-black">Male</SelectItem>
                                            <SelectItem value="female" className="focus:bg-gray-100 focus:text-black">Female</SelectItem>
                                            <SelectItem value="other" className="focus:bg-gray-100 focus:text-black">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-black font-semibold uppercase tracking-wider text-xs">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    placeholder="name@company.com"
                                    className="bg-white border-gray-200 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black rounded-none h-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-black font-semibold uppercase tracking-wider text-xs">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    placeholder="9876543210"
                                    className="bg-white border-gray-200 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black rounded-none h-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-black font-semibold uppercase tracking-wider text-xs">Billing Address</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    required
                                    placeholder="Apartment, Street, Area"
                                    className="bg-white border-gray-200 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black rounded-none h-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state" className="text-black font-semibold uppercase tracking-wider text-xs">State / Province</Label>
                                <Select onValueChange={(v) => setFormData({ ...formData, state: v })} required>
                                    <SelectTrigger className="bg-white border-gray-200 text-black focus:border-black focus:ring-1 focus:ring-black rounded-none h-12">
                                        <SelectValue placeholder="Select State" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-200 text-black rounded-none max-h-[300px]">
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
                                            <SelectItem key={state} value={state} className="focus:bg-gray-100 focus:text-black">
                                                {state}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit" className="w-full mt-6 bg-black text-white hover:bg-gray-800 font-bold rounded-none h-14 uppercase tracking-widest text-sm" disabled={loading || selectedDates.length === 0}>
                                {loading ? 'Processing...' : `Pay ${event?.ticketConfig?.currency} ${((totalPrice + totalPrice * 0.03) * 1.18).toFixed(2)}`}
                            </Button>
                        </form>
                        )}
                    </CardContent>
                    <CardFooter className="justify-center text-xs text-gray-500 bg-gray-50 py-4 border-t border-gray-200">
                        Secure 256-bit encrypted transaction. By proceeding, you agree to our Terms of Service.
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
