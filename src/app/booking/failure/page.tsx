import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

export default function FailurePage({ searchParams }: { searchParams: { txnid?: string } }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">
            <Navbar />
            <main className="container max-w-lg py-12 flex-1 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center w-full">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                    <p className="text-gray-500 mb-6">
                        We couldn't process your payment. If you were charged, it will be refunded automatically within 5-7 business days.
                    </p>
                    {searchParams.txnid && (
                        <p className="text-xs text-gray-400 mb-6">Reference: {searchParams.txnid}</p>
                    )}
                    <div className="flex gap-4">
                        <Button variant="outline" className="flex-1" asChild>
                            <Link href="/">Back to Home</Link>
                        </Button>
                        <Button className="flex-1" asChild>
                            <Link href="/events">Try Again</Link>
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
