'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

    const [loading, setLoading] = useState(false);
    const [event, setEvent] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);

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
    }, [eventId]);

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

    const totalPrice = event ? event.ticketConfig?.price * quantity * selectedDates.length : 0;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50/50">
            <Navbar />

            {event && (
                <div className="relative h-56 md:h-80 w-full overflow-hidden bg-gray-900 text-white">
                    {/* Background Image */}
                    {event.banner ? (
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-60"
                            style={{ backgroundImage: `url(${event.banner})` }}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-900 to-black opacity-80" />
                    )}

                    {/* Overlay Content */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end pb-8 md:pb-12">
                        <div className="container px-4">
                            <div className="mb-2 md:mb-4">
                                <BackButton />
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
                <Card className="w-full max-w-lg shadow-xl border-t-4 border-primary">
                    <CardHeader>
                        <CardTitle>Complete Your Booking</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {event && (
                            <div className="mb-6">
                                {/* Date Selection Grid */}
                                <div className="mt-2">
                                    <div className="flex justify-between items-center mb-3">
                                        <Label className="text-base font-semibold">Select Dates:</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={selectAllDates}
                                            className="text-primary hover:text-primary/80 h-auto p-0"
                                        >
                                            {selectedDates.length === availableDates.length ? 'Clear All' : 'Select All'}
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                                                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                                            : 'bg-background hover:bg-muted text-foreground border-input hover:border-primary/50'
                                                        }
                                                    `}
                                                >
                                                    {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                    <div className="text-xs opacity-80">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {selectedDates.length === 0 && (
                                        <p className="text-xs text-red-500 mt-2">Please select at least one date.</p>
                                    )}
                                </div>

                                <div className="mt-6 flex items-center justify-between">
                                    <Label className="text-base font-semibold">Tickets:</Label>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        >-</Button>
                                        <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setQuantity(Math.min(10, quantity + 1))}
                                        >+</Button>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2 border-t pt-4 bg-muted/30 p-4 rounded-lg">
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Price per Day:</span>
                                        <span>{event.ticketConfig?.currency} {event.ticketConfig?.price}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Selected Days:</span>
                                        <span>{selectedDates.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Quantity:</span>
                                        <span>{quantity}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-xl pt-2 border-t border-dashed border-gray-300 text-primary">
                                        <span>Total:</span>
                                        <span>{event.ticketConfig?.currency} {totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="age">Age</Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        required
                                        placeholder="25"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select onValueChange={(v) => setFormData({ ...formData, gender: v })} defaultValue="male">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    placeholder="9876543210"
                                />
                            </div>

                            <Button type="submit" className="w-full mt-2" size="lg" disabled={loading || selectedDates.length === 0}>
                                {loading ? 'Processing...' : `Pay ${event?.ticketConfig?.currency} ${totalPrice.toFixed(2)}`}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center text-xs text-muted-foreground bg-muted/20 py-3">
                        By clicking proceed, you agree to our Terms & Conditions.
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
