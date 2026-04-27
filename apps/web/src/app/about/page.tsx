'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Corporate Hero Section */}
                <section className="bg-white py-20 md:py-32 border-b border-gray-200">
                    <div className="container text-center max-w-4xl px-4 mx-auto">
                        <div className="inline-block border border-black px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-black mb-8">
                            Corporate Overview
                        </div>
                        <h1 className="text-4xl md:text-6xl font-medium tracking-tight mb-6 text-black leading-tight">
                            Redefining Event Experiences.
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-light">
                            Empowering organizers, connecting audiences, and engineering flawless execution through Wyldcard Stats Private Limited.
                        </p>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-20 md:py-32 bg-white">
                    <div className="container px-4 mx-auto max-w-6xl">
                        <div className="grid md:grid-cols-2 gap-16 items-start">
                            <div>
                                <h2 className="text-3xl font-medium mb-8 text-black tracking-tight">Our Objective</h2>
                                <div className="space-y-6 text-lg text-gray-600 font-light leading-relaxed">
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
                            <div className="bg-gray-50 border border-gray-200 p-12 md:p-16 relative">
                                <div className="absolute top-0 left-0 w-2 h-full bg-black" />
                                <blockquote className="text-2xl font-medium text-black leading-snug">
                                    "Precision in execution is not a luxury; it is the fundamental requirement of every successful engagement."
                                </blockquote>
                                <div className="mt-8 text-sm font-bold uppercase tracking-widest text-gray-500">
                                    — Executive Board, Wyldcard
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Company Info Section */}
                <section className="py-20 md:py-32 bg-gray-50 border-y border-gray-200">
                    <div className="container px-4 text-center max-w-5xl mx-auto">
                        <h2 className="text-3xl font-medium mb-6 text-black tracking-tight">Core Infrastructure</h2>
                        <p className="text-lg text-gray-600 mb-16 font-light max-w-2xl mx-auto">
                            The enterprise-grade architecture engineered by <strong>WYLDCARD STATS PRIVATE LIMITED</strong> rests on three pillars.
                        </p>
                        <div className="grid md:grid-cols-3 gap-8 text-left">
                            <div className="bg-white p-8 border border-gray-200 shadow-sm flex flex-col h-full">
                                <div className="w-8 h-8 bg-black mb-6" />
                                <h3 className="font-semibold text-xl mb-3 text-black">Architecture</h3>
                                <p className="text-base text-gray-600 font-light leading-relaxed flex-1">Deploying highly-available systems to process volume effortlessly.</p>
                            </div>
                            <div className="bg-white p-8 border border-gray-200 shadow-sm flex flex-col h-full">
                                <div className="w-8 h-8 bg-gray-300 mb-6" />
                                <h3 className="font-semibold text-xl mb-3 text-black">Integrity</h3>
                                <p className="text-base text-gray-600 font-light leading-relaxed flex-1">Enforcing strict transactional security and immutable data handling.</p>
                            </div>
                            <div className="bg-white p-8 border border-gray-200 shadow-sm flex flex-col h-full">
                                <div className="w-8 h-8 border border-black mb-6" />
                                <h3 className="font-semibold text-xl mb-3 text-black">Network</h3>
                                <p className="text-base text-gray-600 font-light leading-relaxed flex-1">Connecting premium organizers with verified global attendees.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 bg-white text-center border-b border-gray-200">
                    <div className="container px-4 max-w-3xl mx-auto">
                        <h2 className="text-4xl font-medium mb-6 text-black tracking-tight">Deploy Your Event.</h2>
                        <p className="text-xl text-gray-600 mb-12 font-light">
                            Utilize the industry standard for event management and access control.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/events">
                                <Button size="lg" className="h-14 px-10 bg-black text-white hover:bg-gray-800 rounded-none font-semibold text-base w-full sm:w-auto">
                                    View Directory
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="lg" variant="outline" className="h-14 px-10 border-gray-300 text-black hover:bg-gray-50 rounded-none font-medium text-base w-full sm:w-auto">
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
