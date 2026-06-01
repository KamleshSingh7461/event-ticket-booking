'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white selection:bg-[#AE8638] selection:text-black">
            <Navbar />

            <main className="flex-1">
                {/* Corporate Hero Section */}
                <section className="relative py-24 md:py-32 overflow-hidden border-b border-white/5">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#AE8638]/20 via-[#0A0A0A] to-[#0A0A0A] -z-10" />
                    
                    <div className="container text-center max-w-4xl px-4 mx-auto relative z-10">
                        <div className="inline-block border border-[#AE8638]/50 bg-[#AE8638]/10 backdrop-blur-md px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#AE8638] mb-8 rounded-full">
                            Corporate Overview
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 text-white leading-tight drop-shadow-lg">
                            Redefining Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#AE8638] to-[#F7EF8A]">Experiences.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 leading-relaxed font-light">
                            Empowering organizers, connecting audiences, and engineering flawless execution through Wyldcard Stats Private Limited.
                        </p>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-20 md:py-32 bg-[#0A0A0A] relative">
                    <div className="container px-4 mx-auto max-w-6xl relative z-10">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white tracking-tight">Our Objective</h2>
                                <div className="space-y-6 text-lg text-gray-400 font-light leading-relaxed">
                                    <p>
                                        Wyldcard Stats Private Limited is dedicated to architecting the way enterprise events are structured, managed, and executed.
                                        We provide the infrastructure necessary for seamless operations at scale.
                                    </p>
                                    <p>
                                        Whether executing a localized summit or a global corporate conference, our platform delivers robust ticketing, access control,
                                        and definitive analytics.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-[#111] border border-white/10 rounded-2xl p-12 md:p-16 relative shadow-[0_0_40px_rgba(174,134,56,0.05)] overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#AE8638] to-[#F7EF8A]" />
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#AE8638]/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                                
                                <blockquote className="text-2xl font-medium text-white leading-snug relative z-10">
                                    "Precision in execution is not a luxury; it is the fundamental requirement of every successful engagement."
                                </blockquote>
                                <div className="mt-8 text-sm font-bold uppercase tracking-widest text-[#AE8638] relative z-10">
                                    — Executive Board, Wyldcard
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Company Info Section */}
                <section className="py-20 md:py-32 bg-[#111111] border-y border-white/5 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black/50 via-transparent to-transparent -z-10" />
                    
                    <div className="container px-4 text-center max-w-5xl mx-auto relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white tracking-tight">Core Infrastructure</h2>
                        <p className="text-lg text-gray-400 mb-16 font-light max-w-2xl mx-auto">
                            The enterprise-grade architecture engineered by <strong className="text-white">WYLDCARD STATS PRIVATE LIMITED</strong> rests on three pillars.
                        </p>
                        
                        <div className="grid md:grid-cols-3 gap-8 text-left">
                            <div className="bg-black/40 backdrop-blur-md p-8 border border-white/10 rounded-2xl shadow-xl hover:border-[#AE8638]/50 transition-colors group flex flex-col h-full">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#AE8638] to-[#F7EF8A] mb-6 flex items-center justify-center shadow-[0_0_20px_rgba(174,134,56,0.3)]">
                                    <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-white">Architecture</h3>
                                <p className="text-base text-gray-400 font-light leading-relaxed flex-1">Deploying highly-available systems to process volume effortlessly and ensure zero downtime during critical peaks.</p>
                            </div>
                            
                            <div className="bg-black/40 backdrop-blur-md p-8 border border-white/10 rounded-2xl shadow-xl hover:border-[#AE8638]/50 transition-colors group flex flex-col h-full">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#AE8638] to-[#F7EF8A] mb-6 flex items-center justify-center shadow-[0_0_20px_rgba(174,134,56,0.3)]">
                                    <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-white">Integrity</h3>
                                <p className="text-base text-gray-400 font-light leading-relaxed flex-1">Enforcing strict transactional security and immutable data handling to protect organizers and attendees alike.</p>
                            </div>
                            
                            <div className="bg-black/40 backdrop-blur-md p-8 border border-white/10 rounded-2xl shadow-xl hover:border-[#AE8638]/50 transition-colors group flex flex-col h-full">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#AE8638] to-[#F7EF8A] mb-6 flex items-center justify-center shadow-[0_0_20px_rgba(174,134,56,0.3)]">
                                    <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-white">Network</h3>
                                <p className="text-base text-gray-400 font-light leading-relaxed flex-1">Connecting premium organizers with verified global attendees through optimized discovery channels.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 bg-[#0A0A0A] text-center border-b border-white/5 relative">
                    <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/desdbjzzt/image/upload/v1777203251/noise_p0c3v0.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                    
                    <div className="container px-4 max-w-3xl mx-auto relative z-10">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tighter drop-shadow-md">Deploy Your Event.</h2>
                        <p className="text-xl text-gray-400 mb-12 font-light">
                            Utilize the industry standard for event management and access control.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Link href="/events">
                                <Button size="lg" className="h-14 px-10 bg-[#AE8638] text-black hover:bg-[#F7EF8A] rounded-xl font-bold text-base w-full sm:w-auto shadow-[0_0_20px_rgba(174,134,56,0.3)] transition-all">
                                    View Directory
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="lg" variant="outline" className="h-14 px-10 border-white/20 text-white bg-transparent hover:bg-white/10 rounded-xl font-bold text-base w-full sm:w-auto backdrop-blur-md transition-all">
                                    Create Account
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
