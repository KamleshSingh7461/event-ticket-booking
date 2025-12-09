import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function RefundPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="container py-12 prose dark:prose-invert max-w-4xl mx-auto">
                <h1>Return and Refund Policy</h1>

                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg my-6">
                    <p className="font-bold text-yellow-700 dark:text-yellow-400">
                        Note: Once tickets are booked, they are generally non-refundable.
                    </p>
                </div>

                <h2>1. General Policy</h2>
                <p>Tickets purchased on EventZone are non-refundable and non-transferable, except in specific feedback circumstances outlined below.</p>

                <h2>2. Event Cancellation</h2>
                <p>If an event is cancelled by the organizer, a full refund will be automatically processed to the original payment method within 5-7 business days.</p>

                <h2>3. Rescheduling</h2>
                <p>If an event is rescheduled, your ticket remains valid for the new date. If you cannot attend the new date, you may request a refund within 48 hours of the announcement.</p>

                <h2>4. Contact</h2>
                <p>For any refund related queries, please contact support@eventzone.com.</p>
            </main>
            <Footer />
        </div>
    );
}
