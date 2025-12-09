'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PayUForm } from '@/components/PayUForm';
import { Navbar } from '@/components/Navbar';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const params = useParams();
    const eventId = params.id as string;
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [event, setEvent] = useState<any>(null);
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
            // This API is currently generic, assumes list. Ideally we need get by ID API or update the list API to filter.
            // For now let's assume get by ID works or we filter client side if list is returned.
            // Wait, the API I wrote returns ALL events. I should've made a single fetch API.
            // I'll make a quick fix to fetch the specific event or just use the list API and find it.
            if (data.data) {
                const ev = data.data.find((e: any) => e._id === eventId);
                setEvent(ev);
            }
        });
    }, [eventId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/bookings/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    user: { ...formData } // in real app, user might be logged in, validation needed
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

    return (
        <div className="min-h-screen flex flex-col bg-gray-50/50">
            <Navbar />
            <main className="container py-12 flex justify-center">
                <Card className="w-full max-w-lg shadow-xl">
                    <CardHeader>
                        <CardTitle>Checkout</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {event && (
                            <div className="mb-6 p-4 bg-muted rounded-lg text-sm">
                                <p className="font-bold text-lg">{event.title}</p>
                                <p className="text-muted-foreground">{new Date(event.startDate).toDateString()}</p>
                                <div className="mt-2 flex justify-between font-semibold">
                                    <span>Total to Pay:</span>
                                    <span>{event.ticketConfig?.currency} {event.ticketConfig?.price}</span>
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

                            <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                {loading ? 'Processing...' : 'Proceed to Payment'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center text-xs text-muted-foreground">
                        By clicking proceed, you agree to our Terms & Conditions.
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
