'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white selection:bg-[#AE8638] selection:text-black">
            <Navbar />

            <div className="relative border-b border-white/5 bg-black py-12 md:py-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#AE8638]/20 via-transparent to-transparent -z-10" />
                <div className="container max-w-4xl px-4 relative z-10">
                    <div className="inline-block border border-[#AE8638]/50 bg-[#AE8638]/10 backdrop-blur-md px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#AE8638] mb-6 rounded-full">
                        Legal Documentation
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tighter drop-shadow-md">Privacy Policy</h1>
                    <p className="text-gray-400 font-light">
                        Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            <main className="container py-16 max-w-4xl px-4 flex-1">
                <div className="prose prose-invert max-w-none space-y-12">
                    <section className="bg-[#111] p-8 md:p-10 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#AE8638]" />
                        <h2 className="text-2xl font-bold mb-4 text-white">1. Overview</h2>
                        <p className="text-gray-400 leading-relaxed font-light">
                            At Wyldcard Events, we respect your privacy and are committed to protecting your personal data.
                            This Privacy Policy explains how <strong className="text-white">WYLDCARD STATS PRIVATE LIMITED</strong> collects, uses, and safeguards your information when you use our website.
                        </p>
                    </section>

                    <section className="bg-[#111] p-8 md:p-10 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#AE8638]" />
                        <h2 className="text-2xl font-bold mb-4 text-white">2. Information We Collect</h2>
                        <p className="text-gray-400 mb-2 font-light">We may collect the following types of information:</p>
                        <ul className="list-disc pl-5 space-y-3 text-gray-400 leading-relaxed font-light marker:text-[#AE8638]">
                            <li><strong className="text-white">Personal Identification:</strong> Name, email address, phone number, date of birth, and gender when you register or book tickets.</li>
                            <li><strong className="text-white">Booking Details:</strong> Information about the events you attend, dates selected, and ticket types.</li>
                            <li><strong className="text-white">Payment Information:</strong> Transaction references and payment status. <strong className="text-white">Note:</strong> We do not store complete credit/debit card numbers. All payments are processed by secure third-party gateways authorized by WYLDCARD STATS PRIVATE LIMITED.</li>
                        </ul>
                    </section>

                    <section className="bg-[#111] p-8 md:p-10 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#AE8638]" />
                        <h2 className="text-2xl font-bold mb-4 text-white">3. How We Use Your Information</h2>
                        <p className="text-gray-400 leading-relaxed font-light">
                            WYLDCARD STATS PRIVATE LIMITED uses your data to:
                        </p>
                        <ul className="list-disc pl-5 mt-4 space-y-3 text-gray-400 leading-relaxed font-light marker:text-[#AE8638]">
                            <li>Process your ticket bookings and issue QR codes.</li>
                            <li>Send booking confirmations, event updates, and invoices.</li>
                            <li>Provide customer support and resolve disputes.</li>
                            <li>Improve our platform functionality and user experience.</li>
                        </ul>
                    </section>

                    <section className="bg-[#111] p-8 md:p-10 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#AE8638]" />
                        <h2 className="text-2xl font-bold mb-4 text-white">4. Data Sharing</h2>
                        <p className="text-gray-400 leading-relaxed font-light">
                            We do not sell your personal data. We may share your information with:
                        </p>
                        <ul className="list-disc pl-5 mt-4 space-y-3 text-gray-400 leading-relaxed font-light marker:text-[#AE8638]">
                            <li><strong className="text-white">Event Organizers/Venue Managers:</strong> To facilitate entry and check-in at the venue.</li>
                            <li><strong className="text-white">Service Providers:</strong> For payment processing (e.g., PayU), email delivery, and server hosting.</li>
                            <li><strong className="text-white">Legal Authorities:</strong> If required by law or to protect our rights.</li>
                        </ul>
                    </section>

                    <section className="bg-[#111] p-8 md:p-10 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#AE8638]" />
                        <h2 className="text-2xl font-bold mb-4 text-white">5. Contact Us</h2>
                        <p className="text-gray-400 leading-relaxed font-light">
                            If you have questions about this Privacy Policy, please contact us at:<br />
                            <strong className="text-white mt-4 block">WYLDCARD STATS PRIVATE LIMITED</strong>
                            <a href="mailto:support@wildcardstat.com" className="text-[#AE8638] hover:underline transition-colors mt-2 block">support@wildcardstat.com</a>
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
