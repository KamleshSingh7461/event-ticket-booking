'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function RefundsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white selection:bg-[#AE8638] selection:text-black">
            <Navbar />

            <div className="relative border-b border-white/5 bg-black py-12 md:py-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#AE8638]/20 via-transparent to-transparent -z-10" />
                <div className="container max-w-4xl px-4 relative z-10">
                    <div className="inline-block border border-[#AE8638]/50 bg-[#AE8638]/10 backdrop-blur-md px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#AE8638] mb-6 rounded-full">
                        Legal Documentation
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tighter drop-shadow-md">Refunds & Cancellation Policy</h1>
                    <p className="text-gray-400 font-light">
                        Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            <main className="container py-16 max-w-4xl px-4 flex-1">
                <div className="prose prose-invert max-w-none space-y-12">
                    <section className="bg-[#111] p-8 md:p-10 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#AE8638]" />
                        <h2 className="text-2xl font-bold mb-4 text-white">1. General Policy</h2>
                        <p className="text-gray-400 leading-relaxed font-light">
                            At Wyldcard Events, we strive to ensure a seamless booking experience.
                            However, as a general rule, <strong className="text-white">tickets once booked are non-refundable and non-transferable</strong> unless explicitly stated otherwise by the specific event organizer.
                        </p>
                    </section>

                    <section className="bg-[#111] p-8 md:p-10 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#AE8638]" />
                        <h2 className="text-2xl font-bold mb-4 text-white">2. Event Cancellation</h2>
                        <p className="text-gray-400 mb-2 font-light">
                            In the unlikely event that an event is cancelled or postponed by the Venue Manager or Organizer:
                        </p>
                        <ul className="list-disc pl-5 space-y-3 text-gray-400 leading-relaxed font-light marker:text-[#AE8638]">
                            <li>You will be notified via the email address and phone number provided during booking.</li>
                            <li>A full refund of the ticket face value will be initiated by <strong className="text-white">WYLDCARD STATS PRIVATE LIMITED</strong>.</li>
                            <li>Refunds will be processed to the original payment method used during the transaction.</li>
                            <li>Please allow 5-7 business days for the refund to reflect in your bank account after it has been initiated.</li>
                        </ul>
                    </section>

                    <section className="bg-[#111] p-8 md:p-10 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#AE8638]" />
                        <h2 className="text-2xl font-bold mb-4 text-white">3. Processing Fees</h2>
                        <p className="text-gray-400 leading-relaxed font-light">
                            Convenience fees or platform fees charged at the time of booking are generally non-refundable, as these cover the cost of processing the transaction and maintaining the platform services provided by WYLDCARD STATS PRIVATE LIMITED.
                        </p>
                    </section>

                    <section className="bg-[#111] p-8 md:p-10 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#AE8638]" />
                        <h2 className="text-2xl font-bold mb-4 text-white">4. Requesting a Refund</h2>
                        <p className="text-gray-400 leading-relaxed font-light">
                            If you believe you are eligible for a refund due to exceptional circumstances (e.g., duplicate payment deduction), please contact our support team immediately.
                        </p>
                        <p className="mt-4 text-gray-400 leading-relaxed font-light">
                            All refund disputes are handled by:<br />
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
