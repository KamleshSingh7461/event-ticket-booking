'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Scan, CheckCircle, XCircle, Keyboard, Camera } from 'lucide-react';
import QrScanner from '@/components/QrScanner';

export default function VerifyPage() {
    const { data: session } = useSession();
    const [hash, setHash] = useState('');
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [result, setResult] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('scan');
    const [lastScannedCode, setLastScannedCode] = useState('');

    const handleVerify = async (input: string, type: 'QR' | 'OTP') => {
        if (!input || status === 'LOADING') return;

        // Prevent duplicate scans for QR
        if (type === 'QR' && input === lastScannedCode && status === 'SUCCESS') {
            return;
        }

        setStatus('LOADING');
        setResult(null);
        if (type === 'QR') setLastScannedCode(input);

        try {
            const requestBody: any = {
                coordinatorId: session?.user?.id || null
            };

            if (type === 'QR') requestBody.qrHash = input;
            else requestBody.otp = input;

            const res = await fetch('/api/tickets/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await res.json();

            if (data.success) {
                setStatus('SUCCESS');
                setResult(data.data);
                toast.success(data.message);
                if (type === 'QR') {
                    setTimeout(() => reset(), 3000); // Auto reset for QR
                }
            } else {
                setStatus('ERROR');
                setResult({ message: data.message, ...data.data });
                toast.error(data.message);
                if (type === 'QR') {
                    setTimeout(() => reset(), 2000); // Auto reset error for QR
                }
            }

        } catch (err) {
            console.error('❌ Network error:', err);
            setStatus('ERROR');
            setResult({ message: 'Network error' });
            toast.error('Network error');
        }
    };

    const onScan = (code: string) => {
        if (code && status !== 'LOADING') {
            handleVerify(code, 'QR');
        }
    };

    const reset = () => {
        setStatus('IDLE');
        setHash('');
        setResult(null);
        setLastScannedCode('');
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />
            <main className="container flex-1 flex flex-col items-center justify-center py-6 md:py-8 px-4">
                <Card className="w-full max-w-md bg-black border border-[#AE8638] shadow-[0_0_20px_rgba(174,134,56,0.2)]">
                    <CardHeader className="p-4 md:p-6 border-b border-[#AE8638]/20">
                        <CardTitle className="flex items-center gap-2 text-lg md:text-xl text-[#AE8638]">
                            <Scan className="w-5 h-5 md:w-6 md:h-6" />
                            Verify Ticket
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-6">

                        {status === 'IDLE' && (
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 bg-[#AE8638]/10 border border-[#AE8638]/20">
                                    <TabsTrigger value="scan" className="data-[state=active]:bg-[#AE8638] data-[state=active]:text-black text-xs md:text-sm text-gray-400">
                                        <Camera className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Scanner
                                    </TabsTrigger>
                                    <TabsTrigger value="manual" className="data-[state=active]:bg-[#AE8638] data-[state=active]:text-black text-xs md:text-sm text-gray-400">
                                        <Keyboard className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Manual OTP
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="scan" className="mt-4 md:mt-6">
                                    <div className="bg-black border-2 border-[#AE8638]/30 rounded-lg min-h-[250px] md:min-h-[300px] flex items-center justify-center text-[#AE8638]/50 overflow-hidden relative">
                                        <QrScanner onResult={onScan} />
                                        <div className="absolute inset-0 pointer-events-none border-[30px] border-black/50"></div>
                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                            <div className="w-48 h-48 border-2 border-[#AE8638] relative">
                                                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#AE8638] -mt-1 -ml-1"></div>
                                                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#AE8638] -mt-1 -mr-1"></div>
                                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#AE8638] -mb-1 -ml-1"></div>
                                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#AE8638] -mb-1 -mr-1"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-center text-xs text-[#AE8638]/60 mt-4 animate-pulse">Point camera at the QR code</p>
                                </TabsContent>

                                <TabsContent value="manual" className="mt-4 md:mt-6 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs md:text-sm font-medium text-[#AE8638]">Ticket OTP Code</label>
                                        <Input
                                            value={hash}
                                            onChange={(e) => setHash(e.target.value)}
                                            placeholder="Enter 6-digit OTP..."
                                            className="bg-[#AE8638]/5 border-[#AE8638]/30 font-mono text-sm md:text-base h-12 text-center tracking-widest text-[#AE8638] focus-visible:ring-[#AE8638]"
                                            maxLength={6}
                                        />
                                    </div>
                                    <Button
                                        className="w-full text-sm md:text-base h-12 bg-[#AE8638] text-black hover:bg-[#AE8638]/90 font-bold"
                                        onClick={() => handleVerify(hash, 'OTP')}
                                        disabled={!hash || hash.length < 6}
                                    >
                                        Verify OTP
                                    </Button>
                                </TabsContent>
                            </Tabs>
                        )}

                        {status === 'LOADING' && (
                            <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-pulse">
                                <Scan className="w-12 h-12 text-[#AE8638] animate-spin" />
                                <p className="text-sm md:text-base text-[#AE8638]">Verifying Ticket...</p>
                            </div>
                        )}

                        {status === 'SUCCESS' && (
                            <div className="flex flex-col items-center space-y-6 py-6 animate-in zoom-in duration-300">
                                <div className="rounded-full bg-green-500/20 p-4 ring-2 ring-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                                    <CheckCircle className="w-16 h-16 text-green-500" />
                                </div>
                                <div className="text-center space-y-2 w-full">
                                    <h2 className="text-3xl font-bold text-green-500">ACCESS GRANTED</h2>
                                    <div className="bg-[#AE8638]/5 p-4 rounded-lg border border-[#AE8638]/20 w-full mt-4 text-left space-y-3">
                                        <div>
                                            <p className="text-xs text-[#AE8638]/70 uppercase tracking-wider">Ticket Holder</p>
                                            <p className="text-xl font-bold text-white truncate">{result?.buyer}</p>
                                        </div>
                                        <div className="h-px bg-[#AE8638]/20" />
                                        <div>
                                            <p className="text-xs text-[#AE8638]/70 uppercase tracking-wider">Event</p>
                                            <p className="text-base text-white truncate">{result?.event}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="text-xs text-[#AE8638]/70 uppercase tracking-wider">Type</p>
                                                <p className="text-sm text-[#AE8638] font-semibold">{result?.ticketType}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-[#AE8638]/70 uppercase tracking-wider">Usage</p>
                                                <p className="text-sm text-white">{result?.daysUsed}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={reset} size="lg" className="w-full bg-[#AE8638] text-black hover:bg-[#AE8638]/90 font-bold h-12">
                                    Scan Next
                                </Button>
                            </div>
                        )}

                        {status === 'ERROR' && (
                            <div className="flex flex-col items-center space-y-6 py-6 animate-in zoom-in duration-300">
                                <div className="rounded-full bg-red-500/20 p-4 ring-2 ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                                    <XCircle className="w-16 h-16 text-red-500" />
                                </div>
                                <div className="text-center space-y-2 w-full">
                                    <h2 className="text-3xl font-bold text-red-500">ACCESS DENIED</h2>
                                    <p className="text-red-300 text-lg font-medium">{result?.message}</p>

                                    {result?.redeemedAt && (
                                        <div className="bg-red-950/40 p-3 rounded border border-red-900/50 mt-4">
                                            <p className="text-sm text-red-200">
                                                Already used on <br />
                                                <span className="font-mono font-bold text-base text-white">
                                                    {new Date(result.redeemedAt).toLocaleString()}
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <Button onClick={reset} variant="destructive" size="lg" className="w-full h-12 font-bold">
                                    Try Again
                                </Button>
                            </div>
                        )}

                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
