'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white selection:bg-[#AE8638] selection:text-black">
            <Navbar />

            <div className="relative border-b border-white/5 bg-black py-12 md:py-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#AE8638]/20 via-transparent to-transparent -z-10" />
                <div className="container max-w-4xl px-4 relative z-10">
                    <div className="inline-block border border-[#AE8638]/50 bg-[#AE8638]/10 backdrop-blur-md px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#AE8638] mb-6 rounded-full">
                        Legal Documentation
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tighter drop-shadow-md">Terms and Conditions</h1>
                    <p className="text-gray-400 font-light">
                        Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            <main className="container py-16 max-w-4xl px-4 flex-1">
                <div className="prose prose-invert max-w-none space-y-12">
                    <section className="bg-[#111] p-8 md:p-10 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#AE8638]" />
                        <h2 className="text-2xl font-bold mb-4 text-white">1. Introduction</h2>
                        <p className="text-gray-400 leading-relaxed font-light">
                            Welcome to Wyldcard Events. These Terms and Conditions govern your use of our website and ticket booking services.
                            By accessing or using our platform, you agree to be bound by these terms.
                            The platform is operated by <strong className="text-white">WYLDCARD STATS PRIVATE LIMITED</strong> ("Company", "we", "us", or "our").
                        </p>
                    </section>

                    <section className="bg-[#111] p-8 md:p-10 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#AE8638]" />
                        <h2 className="text-2xl font-bold mb-4 text-white">2. Ticketing & Payments</h2>
                        <ul className="list-disc pl-5 space-y-3 text-gray-400 leading-relaxed font-light marker:text-[#AE8638]">
                            <li>All ticket sales are subject to availability and acceptance by WYLDCARD STATS PRIVATE LIMITED.</li>
                            <li>Prices are displayed in the applicable currency and include taxes unless stated otherwise.</li>
                            <li>Payments are processed securely through our authorized payment gateways. WYLDCARD STATS PRIVATE LIMITED serves as the merchant of record for all transactions.</li>
                            <li>We reserve the right to cancel bookings that are suspected of being fraudulent.</li>
                        </ul>
                    </section>

                    <section className="bg-[#111] p-8 md:p-10 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#AE8638]" />
                        <h2 className="text-2xl font-bold mb-4 text-white">3. User Responsibilities</h2>
                        <p className="text-gray-400 leading-relaxed font-light">
                            You agree to provide accurate, current, and complete information during the registration and booking process.
                            You are responsible for maintaining the confidentiality of your account credentials.
                            You must be at least 18 years of age to make a booking on this platform.
                        </p>
                    </section>

                    <section className="bg-[#111] p-8 md:p-10 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#AE8638]" />
                        <h2 className="text-2xl font-bold mb-4 text-white">4. Intellectual Property</h2>
                        <p className="text-gray-400 leading-relaxed font-light">
                            All content, trademarks, and data on this website, including but not limited to software, databases, text, graphics, icons, and hyperlinks,
                            are the property of WYLDCARD STATS PRIVATE LIMITED or its licensors and are protected by applicable laws.
                        </p>
                    </section>

                    <section className="bg-[#111] p-8 md:p-10 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#AE8638]" />
                        <h2 className="text-2xl font-bold mb-4 text-white">5. Limitation of Liability</h2>
                        <p className="text-gray-400 leading-relaxed font-light">
                            WYLDCARD STATS PRIVATE LIMITED shall not be liable for any direct, indirect, incidental, special, or consequential damages
                            resulting from the use or inability to use our services or for the cost of procurement of substitute services.
                        </p>
                    </section>

                    <section className="bg-[#111] p-8 md:p-10 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#AE8638]" />
                        <h2 className="text-2xl font-bold mb-4 text-white">6. Governing Law</h2>
                        <p className="text-gray-400 leading-relaxed font-light">
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
