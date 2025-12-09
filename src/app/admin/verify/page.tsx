'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyOTPPage() {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otp.length !== 6) {
            toast.error('OTP must be 6 digits');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/tickets/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp })
            });

            const data = await res.json();

            if (data.success) {
                setResult(data);
                if (data.alreadyVerified) {
                    toast.info('Ticket already verified');
                } else {
                    toast.success('Ticket verified successfully!');
                }
                setOtp(''); // Clear for next verification
            } else {
                toast.error(data.error || 'Invalid OTP');
                setResult({ success: false, error: data.error });
            }
        } catch (error) {
            toast.error('Verification failed');
            setResult({ success: false, error: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6">
                {/* Verification Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">Ticket Verification</CardTitle>
                        <p className="text-sm text-muted-foreground text-center">
                            Enter the 6-digit OTP from the attendee's email
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div>
                                <Label htmlFor="otp">OTP Code</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="123456"
                                    className="text-center text-2xl font-mono tracking-widest"
                                    required
                                    autoFocus
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify Ticket'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Verification Result */}
                {result && (
                    <Card className={result.success ? 'border-green-500' : 'border-red-500'}>
                        <CardContent className="pt-6">
                            <div className="text-center space-y-4">
                                {result.success ? (
                                    <>
                                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                                        <div>
                                            <h3 className="text-xl font-bold text-green-700">
                                                {result.alreadyVerified ? 'Already Verified' : 'Verified Successfully!'}
                                            </h3>
                                            {result.data && (
                                                <div className="mt-4 space-y-2 text-left bg-gray-50 p-4 rounded-lg">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Attendee</p>
                                                        <p className="font-semibold">{result.data.user?.name}</p>
                                                        <p className="text-sm text-muted-foreground">{result.data.user?.email}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Event</p>
                                                        <p className="font-semibold">{result.data.event?.title}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Ticket Type</p>
                                                        <Badge variant={result.data.ticketType === 'ALL_DAY_PACKAGE' ? 'default' : 'secondary'}>
                                                            {result.data.ticketType === 'ALL_DAY_PACKAGE' ? 'All-Day Package' : 'Single Day'}
                                                        </Badge>
                                                    </div>
                                                    {result.data.selectedDate && (
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Selected Date</p>
                                                            <p className="font-semibold">
                                                                {new Date(result.data.selectedDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Verified At</p>
                                                        <p className="font-semibold">
                                                            {new Date(result.data.verifiedAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                                        <div>
                                            <h3 className="text-xl font-bold text-red-700">Verification Failed</h3>
                                            <p className="text-muted-foreground mt-2">{result.error || 'Invalid OTP'}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Instructions */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <h4 className="font-semibold text-blue-900 mb-2">How to verify:</h4>
                        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                            <li>Ask attendee for their 6-digit OTP</li>
                            <li>Enter the OTP code above</li>
                            <li>Click "Verify Ticket"</li>
                            <li>Check the result</li>
                        </ol>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
