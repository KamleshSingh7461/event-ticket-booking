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

    const handleVerify = async (inputHash: string) => {
        if (!inputHash || status === 'LOADING') return;

        // Prevent duplicate scans
        if (inputHash === lastScannedCode && status === 'SUCCESS') {
            return;
        }

        setStatus('LOADING');
        setResult(null);
        setLastScannedCode(inputHash);

        console.log('🔍 Verifying ticket:', inputHash);
        console.log('👤 Coordinator ID:', session?.user?.id || 'Not logged in');

        try {
            const requestBody = {
                qrHash: inputHash,
                coordinatorId: session?.user?.id || null
            };

            console.log('📤 Sending verification request:', requestBody);

            const res = await fetch('/api/tickets/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            console.log('📥 Response status:', res.status);
            const data = await res.json();
            console.log('📥 Response data:', data);

            if (data.success) {
                setStatus('SUCCESS');
                setResult(data.data);
                toast.success(data.message);

                // Auto-reset after 3 seconds to allow next scan
                setTimeout(() => {
                    reset();
                }, 3000);
            } else {
                setStatus('ERROR');
                setResult({ message: data.message, ...data.data });
                toast.error(data.message);
                console.error('❌ Verification failed:', data.message);

                // Auto-reset after 2 seconds on error
                setTimeout(() => {
                    reset();
                }, 2000);
            }

        } catch (err) {
            console.error('❌ Network error:', err);
            setStatus('ERROR');
            setResult({ message: 'Network error' });
            toast.error('Network error');

            // Auto-reset after 2 seconds on error
            setTimeout(() => {
                reset();
            }, 2000);
        }
    };

    const onScan = (code: string) => {
        if (code && status !== 'LOADING') {
            handleVerify(code);
        }
    };

    const reset = () => {
        setStatus('IDLE');
        setHash('');
        setResult(null);
        setLastScannedCode('');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            <Navbar />
            <main className="container flex-1 flex flex-col items-center justify-center py-6 md:py-8 px-4">
                <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-100 shadow-2xl">
                    <CardHeader className="p-4 md:p-6">
                        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                            <Scan className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                            Verify Ticket
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0">

                        {status === 'IDLE' && (
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                                    <TabsTrigger value="scan" className="data-[state=active]:bg-slate-700 text-xs md:text-sm">
                                        <Camera className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Scanner
                                    </TabsTrigger>
                                    <TabsTrigger value="manual" className="data-[state=active]:bg-slate-700 text-xs md:text-sm">
                                        <Keyboard className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Manual
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="scan" className="mt-3 md:mt-4">
                                    <div className="bg-black rounded-lg min-h-[250px] md:min-h-[300px] flex items-center justify-center text-slate-500">
                                        <QrScanner onResult={onScan} />
                                    </div>
                                    <p className="text-center text-xs text-slate-500 mt-2">Point camera at the QR code</p>
                                </TabsContent>

                                <TabsContent value="manual" className="mt-3 md:mt-4 space-y-3 md:space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs md:text-sm font-medium">Ticket Hash / Code</label>
                                        <Input
                                            value={hash}
                                            onChange={(e) => setHash(e.target.value)}
                                            placeholder="Enter QR Hash..."
                                            className="bg-slate-800 border-slate-700 font-mono text-sm md:text-base h-10 md:h-11"
                                        />
                                    </div>
                                    <Button className="w-full text-sm md:text-base h-10 md:h-11" onClick={() => handleVerify(hash)} disabled={!hash}>
                                        Verify Code
                                    </Button>
                                </TabsContent>
                            </Tabs>
                        )}

                        {status === 'LOADING' && (
                            <div className="py-8 md:py-12 flex flex-col items-center justify-center space-y-3 md:space-y-4 animate-pulse">
                                <Scan className="w-10 h-10 md:w-12 md:h-12 text-primary animate-spin" />
                                <p className="text-sm md:text-base">Verifying Ticket...</p>
                            </div>
                        )}

                        {status === 'SUCCESS' && (
                            <div className="flex flex-col items-center space-y-4 md:space-y-6 py-4 md:py-6 animate-in zoom-in duration-300">
                                <div className="rounded-full bg-green-500/20 p-3 md:p-4 ring-1 ring-green-500/50">
                                    <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-500" />
                                </div>
                                <div className="text-center space-y-2 w-full">
                                    <h2 className="text-2xl md:text-3xl font-bold text-green-400">ACCESS GRANTED</h2>
                                    <div className="bg-slate-800/50 p-3 md:p-4 rounded-lg border border-slate-700 w-full">
                                        <p className="text-xs md:text-sm text-slate-400">Ticket Holder</p>
                                        <p className="text-lg md:text-xl font-semibold text-white truncate">{result?.buyer}</p>
                                        <div className="h-px bg-slate-700 my-2" />
                                        <p className="text-xs md:text-sm text-slate-400">Event</p>
                                        <p className="text-sm md:text-base font-medium text-slate-200 truncate">{result?.event}</p>
                                        <p className="text-xs text-primary mt-1">{result?.type}</p>
                                    </div>
                                </div>
                                <Button onClick={reset} size="lg" className="w-full bg-slate-800 hover:bg-slate-700 text-sm md:text-base h-10 md:h-11">
                                    Scan Next
                                </Button>
                            </div>
                        )}

                        {status === 'ERROR' && (
                            <div className="flex flex-col items-center space-y-4 md:space-y-6 py-4 md:py-6 animate-in zoom-in duration-300">
                                <div className="rounded-full bg-red-500/20 p-3 md:p-4 ring-1 ring-red-500/50">
                                    <XCircle className="w-12 h-12 md:w-16 md:h-16 text-red-500" />
                                </div>
                                <div className="text-center space-y-2 w-full">
                                    <h2 className="text-2xl md:text-3xl font-bold text-red-500">ACCESS DENIED</h2>
                                    <p className="text-red-300 text-base md:text-lg">{result?.message}</p>
                                    {result?.redeemedAt && (
                                        <div className="bg-red-950/30 p-3 rounded border border-red-900/50 mt-2">
                                            <p className="text-xs md:text-sm text-red-200">
                                                Already used on <br />
                                                <span className="font-mono font-bold text-xs md:text-sm">
                                                    {new Date(result.redeemedAt).toLocaleString()}
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <Button onClick={reset} variant="destructive" size="lg" className="w-full text-sm md:text-base h-10 md:h-11">
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
