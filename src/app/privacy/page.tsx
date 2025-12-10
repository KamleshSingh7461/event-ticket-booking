'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="container py-12 md:py-16 max-w-4xl">
                <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-muted-foreground mb-8">
                    Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>

                <div className="prose dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">1. Overview</h2>
                        <p className="text-muted-foreground">
                            At FGSN Events, we respect your privacy and are committed to protecting your personal data.
                            This Privacy Policy explains how <strong>WYLDCARD STATS PRIVATE LIMITED</strong> collects, uses, and safeguards your information when you use our website.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                        <p className="text-muted-foreground mb-2">We may collect the following types of information:</p>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li><strong>Personal Identification:</strong> Name, email address, phone number, date of birth, and gender when you register or book tickets.</li>
                            <li><strong>Booking Details:</strong> Information about the events you attend, dates selected, and ticket types.</li>
                            <li><strong>Payment Information:</strong> Transaction references and payment status. <strong>Note:</strong> We do not store complete credit/debit card numbers. All payments are processed by secure third-party gateways authorized by WYLDCARD STATS PRIVATE LIMITED.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
                        <p className="text-muted-foreground">
                            WYLDCARD STATS PRIVATE LIMITED uses your data to:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-2 text-muted-foreground">
                            <li>Process your ticket bookings and issue QR codes.</li>
                            <li>Send booking confirmations, event updates, and invoices.</li>
                            <li>Provide customer support and resolve disputes.</li>
                            <li>Improve our platform functionality and user experience.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">4. Data Sharing</h2>
                        <p className="text-muted-foreground">
                            We do not sell your personal data. We may share your information with:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-2 text-muted-foreground">
                            <li><strong>Event Organizers/Venue Managers:</strong> To facilitate entry and check-in at the venue.</li>
                            <li><strong>Service Providers:</strong> For payment processing (e.g., PayU), email delivery, and server hosting.</li>
                            <li><strong>Legal Authorities:</strong> If required by law or to protect our rights.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">5. Contact Us</h2>
                        <p className="text-muted-foreground">
                            If you have questions about this Privacy Policy, please contact us at:<br />
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
