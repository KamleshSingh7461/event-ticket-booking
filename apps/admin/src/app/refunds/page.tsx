'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function RefundsPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="container py-12 md:py-16 max-w-4xl">
                <h1 className="text-3xl font-bold mb-2">Refunds & Cancellation Policy</h1>
                <p className="text-muted-foreground mb-8">
                    Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>

                <div className="prose dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">1. General Policy</h2>
                        <p className="text-muted-foreground">
                            At FGSN Events, we strive to ensure a seamless booking experience.
                            However, as a general rule, <strong>tickets once booked are non-refundable and non-transferable</strong> unless explicitly stated otherwise by the specific event organizer.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">2. Event Cancellation</h2>
                        <p className="text-muted-foreground">
                            In the unlikely event that an event is cancelled or postponed by the Venue Manager or Organizer:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-2 text-muted-foreground">
                            <li>You will be notified via the email address and phone number provided during booking.</li>
                            <li>A full refund of the ticket face value will be initiated by <strong>WYLDCARD STATS PRIVATE LIMITED</strong>.</li>
                            <li>Refunds will be processed to the original payment method used during the transaction.</li>
                            <li>Please allow 5-7 business days for the refund to reflect in your bank account after it has been initiated.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">3. Processing Fees</h2>
                        <p className="text-muted-foreground">
                            Convenience fees or platform fees charged at the time of booking are generally non-refundable, as these cover the cost of processing the transaction and maintaining the platform services provided by WYLDCARD STATS PRIVATE LIMITED.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">4. Requesting a Refund</h2>
                        <p className="text-muted-foreground">
                            If you believe you are eligible for a refund due to exceptional circumstances (e.g., duplicate payment deduction), please contact our support team immediately.
                        </p>
                        <p className="mt-4 font-medium text-muted-foreground">
                            All refund disputes are handled by:<br />
                            <strong>WYLDCARD STATS PRIVATE LIMITED</strong><br />
                            Email: supports@wildcardstat.com
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
