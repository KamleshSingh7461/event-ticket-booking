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

    const toggleDate = (dateIso: string) => {
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
            setSelectedDates(availableDates.map(d => d.toISOString()));
        }
    };

    // Effect to handle booking type changes (Auto select all dates for ALL_DAY)
    useEffect(() => {
        if (bookingType === 'ALL_DAY' && availableDates.length > 0) {
            setSelectedDates(availableDates.map(d => d.toISOString()));
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
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="animate-spin h-8 w-8 border-4 border-[#AE8638] border-t-transparent rounded-full"></div>
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
        <div className="min-h-screen flex flex-col bg-black">
            <Navbar />

            {event && (
                <div className="relative h-56 md:h-80 w-full overflow-hidden bg-black text-white">
                    {/* Background Image */}
                    {event.banner ? (
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-40"
                            style={{ backgroundImage: `url(${event.banner})` }}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#AE8638]/20 via-black to-black opacity-80" />
                    )}

                    {/* Overlay Content */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col justify-end pb-8 md:pb-12">
                        <div className="container px-4">
                            <div className="mb-2 md:mb-4">
                                <BackButton className="text-[#AE8638] hover:text-[#AE8638]/80 bg-black/40 hover:bg-black/60 p-2 rounded-full transition-colors backdrop-blur-sm border border-[#AE8638]/20" />
                            </div>
                            <h1 className="text-2xl md:text-5xl font-bold mb-1 md:mb-2 text-white drop-shadow-md leading-tight">{event.title}</h1>
                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-white/90 text-xs md:text-base">
                                <span>{new Date(event.startDate).toDateString()} - {new Date(event.endDate).toDateString()}</span>
                                {event.venue && <span className="hidden md:inline">• {event.venue}</span>}
                                {event.venue && <span className="md:hidden text-white/80">{event.venue}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="container px-4 py-6 md:py-12 flex flex-col items-center -mt-6 md:-mt-8 relative z-10">
                <Card className="w-full max-w-lg shadow-xl border border-[#AE8638]/30 bg-black">
                    <CardHeader className="border-b border-[#AE8638]/10">
                        <CardTitle className="text-white">Complete Your Booking</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {event && (
                            <div className="mb-6">
                                {/* Booking Type Selection */}
                                {event.ticketConfig?.allDayPrice && (
                                    <div className="mb-6 bg-[#AE8638]/10 p-4 rounded-lg border border-[#AE8638]/20">
                                        <Label className="text-[#AE8638] mb-3 block text-base font-semibold">Select Access Type:</Label>
                                        <RadioGroup
                                            value={bookingType}
                                            onValueChange={(v: any) => setBookingType(v)}
                                            className="grid grid-cols-2 gap-4"
                                        >
                                            <div className={`
                                                    flex items-center space-x-2 border rounded-md p-3 cursor-pointer transition-all
                                                    ${bookingType === 'DAILY' ? 'border-[#AE8638] bg-[#AE8638]/20' : 'border-[#AE8638]/10 hover:border-[#AE8638]/30'}
                                                `}>
                                                <RadioGroupItem value="DAILY" id="daily" className="text-[#AE8638] border-[#AE8638]" />
                                                <Label htmlFor="daily" className="cursor-pointer text-white">Daily Pass</Label>
                                            </div>
                                            <div className={`
                                                    flex items-center space-x-2 border rounded-md p-3 cursor-pointer transition-all
                                                    ${bookingType === 'ALL_DAY' ? 'border-[#AE8638] bg-[#AE8638]/20' : 'border-[#AE8638]/10 hover:border-[#AE8638]/30'}
                                                `}>
                                                <RadioGroupItem value="ALL_DAY" id="allday" className="text-[#AE8638] border-[#AE8638]" />
                                                <Label htmlFor="allday" className="cursor-pointer text-white">
                                                    Season Pass (For all 9 days)
                                                    <span className="block text-xs text-[#AE8638]/80 font-normal">
                                                        {event.ticketConfig.currency} {event.ticketConfig.allDayPrice}
                                                    </span>
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                )}

                                {/* Date Selection Grid */}
                                <div className="mt-2">
                                    <div className="flex justify-between items-center mb-3">
                                        <Label className="text-base font-semibold text-[#AE8638]">Select Dates:</Label>
                                        {bookingType === 'DAILY' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={selectAllDates}
                                                className="text-[#AE8638] hover:text-[#AE8638]/80 hover:bg-[#AE8638]/10 h-auto p-0"
                                            >
                                                {selectedDates.length === availableDates.length ? 'Clear All' : 'Select All'}
                                            </Button>
                                        )}
                                    </div>

                                    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${bookingType === 'ALL_DAY' ? 'opacity-50 pointer-events-none' : ''}`}>
                                        {availableDates.map((date) => {
                                            const iso = date.toISOString();
                                            const isSelected = selectedDates.includes(iso);
                                            return (
                                                <div
                                                    key={iso}
                                                    onClick={() => toggleDate(iso)}
                                                    className={`
                                                        cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-medium transition-all
                                                        ${isSelected
                                                            ? 'bg-[#AE8638] text-black border-[#AE8638] shadow-sm font-bold'
                                                            : 'bg-white/5 hover:bg-white/10 text-gray-300 border-[#AE8638]/20 hover:border-[#AE8638]/50'
                                                        }
                                                    `}
                                                >
                                                    {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                    <div className="text-xs opacity-80">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {bookingType === 'ALL_DAY' && (
                                        <p className="text-xs text-[#AE8638] mt-2 italic">* All dates are included in the Season Pass.</p>
                                    )}
                                    {bookingType === 'DAILY' && selectedDates.length === 0 && (
                                        <p className="text-xs text-red-500 mt-2">Please select at least one date.</p>
                                    )}
                                </div>

                                <div className="mt-6 flex items-center justify-between">
                                    <Label className="text-base font-semibold text-[#AE8638]">Tickets:</Label>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="border-[#AE8638]/30 text-[#AE8638] hover:bg-[#AE8638]/10 hover:text-[#AE8638]"
                                        >-</Button>
                                        <span className="w-8 text-center font-bold text-lg text-white">{quantity}</span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setQuantity(Math.min(10, quantity + 1))}
                                            className="border-[#AE8638]/30 text-[#AE8638] hover:bg-[#AE8638]/10 hover:text-[#AE8638]"
                                        >+</Button>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2 border-t border-[#AE8638]/20 pt-4 bg-[#AE8638]/5 p-4 rounded-lg">
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>Type:</span>
                                        <span className="text-white font-medium">{bookingType === 'ALL_DAY' ? 'Season Pass' : 'Daily Pass'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>{bookingType === 'ALL_DAY' ? 'Pass Price:' : 'Price per Day:'}</span>
                                        <span className="text-white">
                                            {event.ticketConfig?.currency} {bookingType === 'ALL_DAY' ? event.ticketConfig?.allDayPrice : event.ticketConfig?.price}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>Selected Days:</span>
                                        <span className="text-white">{selectedDates.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>Quantity:</span>
                                        <span className="text-white">{quantity}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>Base Price:</span>
                                        <span className="text-white">{event.ticketConfig?.currency} {totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>GST (18%):</span>
                                        <span className="text-white">{event.ticketConfig?.currency} {(totalPrice * 0.18).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-xl pt-2 border-t border-dashed border-[#AE8638]/30 text-[#AE8638]">
                                        <span>Total:</span>
                                        <span>{event.ticketConfig?.currency} {(totalPrice * 1.18).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="John Doe"
                                    className="bg-white/5 border-[#AE8638]/20 text-white placeholder:text-gray-500 focus:border-[#AE8638]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="age" className="text-gray-300">Age</Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        required
                                        placeholder="25"
                                        className="bg-white/5 border-[#AE8638]/20 text-white placeholder:text-gray-500 focus:border-[#AE8638]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender" className="text-gray-300">Gender</Label>
                                    <Select onValueChange={(v) => setFormData({ ...formData, gender: v })} defaultValue="male">
                                        <SelectTrigger className="bg-white/5 border-[#AE8638]/20 text-white focus:border-[#AE8638]">
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black border-[#AE8638]/20 text-white">
                                            <SelectItem value="male" className="focus:bg-[#AE8638]/20 focus:text-[#AE8638]">Male</SelectItem>
                                            <SelectItem value="female" className="focus:bg-[#AE8638]/20 focus:text-[#AE8638]">Female</SelectItem>
                                            <SelectItem value="other" className="focus:bg-[#AE8638]/20 focus:text-[#AE8638]">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-300">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    placeholder="john@example.com"
                                    className="bg-white/5 border-[#AE8638]/20 text-white placeholder:text-gray-500 focus:border-[#AE8638]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    placeholder="9876543210"
                                    className="bg-white/5 border-[#AE8638]/20 text-white placeholder:text-gray-500 focus:border-[#AE8638]"
                                />
                            </div>

                            <Button type="submit" className="w-full mt-2 bg-[#AE8638] text-black hover:bg-[#AE8638]/90 font-bold" size="lg" disabled={loading || selectedDates.length === 0}>
                                {loading ? 'Processing...' : `Pay ${event?.ticketConfig?.currency} ${(totalPrice * 1.18).toFixed(2)}`}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center text-xs text-gray-500 bg-white/5 py-3 border-t border-[#AE8638]/10 h-10">
                        By clicking proceed, you agree to our Terms & Conditions.
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
