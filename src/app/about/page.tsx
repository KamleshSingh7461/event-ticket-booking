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
                {/* Hero Section */}
                <section className="relative bg-slate-900 text-white py-20 md:py-32 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-black to-slate-900 z-0" />
                    <div className="container relative z-10 text-center max-w-3xl px-4">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                            Redefining Sports Experiences
                        </h1>
                        <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8">
                            Empowering athletes, connecting fans, and creating unforgettable moments through Wyldcard Stats Private Limited.
                        </p>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-16 md:py-24 bg-background">
                    <div className="container px-4">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-6 text-primary">Our Mission</h2>
                                <p className="text-lg text-muted-foreground mb-4">
                                    Wyldcard Stats Private Limited is dedicated to revolutionizing the way sports events are organized, managed, and experienced.
                                    We aim to bridge the gap between talented athletes and the opportunities they deserve.
                                </p>
                                <p className="text-lg text-muted-foreground">
                                    Whether it's a local tournament or a major championship, our platform provides seamless ticketing, comprehensive event management,
                                    and accurate statistical tracking.
                                </p>
                            </div>
                            <div className="bg-muted rounded-2xl p-8 md:p-12 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                                <blockquote className="relative z-10 text-xl font-medium italic text-foreground">
                                    "Sports have the power to change the world. It has the power to inspire. It has the power to unite people in a way that little else does."
                                </blockquote>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Company Info Section */}
                <section className="py-16 md:py-24 bg-muted/30 border-y">
                    <div className="container px-4 text-center max-w-4xl">
                        <h2 className="text-3xl font-bold mb-8">Who We Are</h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            FGSN Events is a specialized module operated by <strong>WYLDCARD STATS PRIVATE LIMITED</strong>.
                        </p>
                        <div className="grid md:grid-cols-3 gap-8 text-left">
                            <div className="bg-card p-6 rounded-xl border shadow-sm">
                                <h3 className="font-bold text-xl mb-2">Innovation</h3>
                                <p className="text-sm text-muted-foreground">Using cutting-edge technology to streamline event logistics and ticketing.</p>
                            </div>
                            <div className="bg-card p-6 rounded-xl border shadow-sm">
                                <h3 className="font-bold text-xl mb-2">Integrity</h3>
                                <p className="text-sm text-muted-foreground">Committed to fair play, transparent transactions, and secure data handling.</p>
                            </div>
                            <div className="bg-card p-6 rounded-xl border shadow-sm">
                                <h3 className="font-bold text-xl mb-2">Community</h3>
                                <p className="text-sm text-muted-foreground">Building a vibrant ecosystem of players, coaches, fans, and organizers.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 text-center">
                    <div className="container px-4">
                        <h2 className="text-3xl font-bold mb-4">Ready to Experience the Action?</h2>
                        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Join thousands of sports enthusiasts. Book your next event or host your own tournament with FGSN.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button size="lg" asChild>
                                <Link href="/events">Browse Events</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/register">Join Us</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
