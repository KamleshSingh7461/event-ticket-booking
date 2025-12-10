'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="container py-12 md:py-16 max-w-4xl">
                <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
                <p className="text-muted-foreground mb-8">
                    Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>

                <div className="prose dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                        <p className="text-muted-foreground">
                            Welcome to FGSN Events. These Terms and Conditions govern your use of our website and ticket booking services.
                            By accessing or using our platform, you agree to be bound by these terms.
                            The platform is operated by <strong>WYLDCARD STATS PRIVATE LIMITED</strong> ("Company", "we", "us", or "our").
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">2. Ticketing & Payments</h2>
                        <ul className="list-disc pl-5 mt-2 space-y-2 text-muted-foreground">
                            <li>All ticket sales are subject to availability and acceptance by WYLDCARD STATS PRIVATE LIMITED.</li>
                            <li>Prices are displayed in the applicable currency and include taxes unless stated otherwise.</li>
                            <li>Payments are processed securely through our authorized payment gateways. WYLDCARD STATS PRIVATE LIMITED serves as the merchant of record for all transactions.</li>
                            <li>We reserve the right to cancel bookings that are suspected of being fraudulent.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">3. User Responsibilities</h2>
                        <p className="text-muted-foreground">
                            You agree to provide accurate, current, and complete information during the registration and booking process.
                            You are responsible for maintaining the confidentiality of your account credentials.
                            You must be at least 18 years of age to make a booking on this platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">4. Intellectual Property</h2>
                        <p className="text-muted-foreground">
                            All content, trademarks, and data on this website, including but not limited to software, databases, text, graphics, icons, and hyperlinks,
                            are the property of WYLDCARD STATS PRIVATE LIMITED or its licensors and are protected by applicable laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">5. Limitation of Liability</h2>
                        <p className="text-muted-foreground">
                            WYLDCARD STATS PRIVATE LIMITED shall not be liable for any direct, indirect, incidental, special, or consequential damages
                            resulting from the use or inability to use our services or for the cost of procurement of substitute services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">6. Governing Law</h2>
                        <p className="text-muted-foreground">
                            These terms shall be governed by and construed in accordance with the laws of India.
                            Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
