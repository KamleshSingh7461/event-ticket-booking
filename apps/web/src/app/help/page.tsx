'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function HelpPage() {
    return (
        <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white selection:bg-[#AE8638] selection:text-black">
            <Navbar />

            <div className="relative border-b border-white/5 bg-black py-16 md:py-24 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#AE8638]/20 via-transparent to-transparent -z-10" />
                <div className="container max-w-4xl px-4 text-center relative z-10">
                    <div className="inline-block border border-[#AE8638]/50 bg-[#AE8638]/10 backdrop-blur-md px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#AE8638] mb-6 rounded-full">
                        Support & FAQ
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter drop-shadow-md">Help Center</h1>
                    <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto">
                        Frequently asked questions and support for Wyldcard Events.
                    </p>
                </div>
            </div>

            <main className="container py-16 md:py-24 max-w-4xl px-4 flex-1">
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-12 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    <h2 className="text-2xl font-bold mb-8 text-white uppercase tracking-widest border-l-4 border-[#AE8638] pl-4">Common Questions</h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-white/10">
                            <AccordionTrigger className="text-lg md:text-xl text-left hover:text-[#AE8638] transition-colors font-semibold">How do I book a ticket?</AccordionTrigger>
                            <AccordionContent className="text-gray-400 text-base leading-relaxed font-light pt-2 pb-6">
                                Browsing our events page, select an event you are interested in, click "Book Now", choose your dates and quantity, and proceed to payment. You will need to be logged in to complete a booking.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2" className="border-white/10">
                            <AccordionTrigger className="text-lg md:text-xl text-left hover:text-[#AE8638] transition-colors font-semibold">How will I receive my ticket?</AccordionTrigger>
                            <AccordionContent className="text-gray-400 text-base leading-relaxed font-light pt-2 pb-6">
                                Once your payment is successful, your ticket (QR Code) will be generated instantly. You can view it in your Dashboard under "My Tickets". A copy will also be sent to your registered email address.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3" className="border-white/10">
                            <AccordionTrigger className="text-lg md:text-xl text-left hover:text-[#AE8638] transition-colors font-semibold">What is WYLDCARD STATS PRIVATE LIMITED?</AccordionTrigger>
                            <AccordionContent className="text-gray-400 text-base leading-relaxed font-light pt-2 pb-6">
                                <strong className="text-white">WYLDCARD STATS PRIVATE LIMITED</strong> is the parent company and registered legal entity that processes all payments for Wyldcard Events. You may see this name appear on your bank statement or payment confirmation screens.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-4" className="border-white/10">
                            <AccordionTrigger className="text-lg md:text-xl text-left hover:text-[#AE8638] transition-colors font-semibold">Can I cancel my booking?</AccordionTrigger>
                            <AccordionContent className="text-gray-400 text-base leading-relaxed font-light pt-2 pb-6">
                                Cancellation policies vary by event. Please check the specific event details or our Refunds & Cancellations page for more general information. If eligible, refunds are processed by WYLDCARD STATS PRIVATE LIMITED back to your original payment method.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-5" className="border-white/10 border-b-0">
                            <AccordionTrigger className="text-lg md:text-xl text-left hover:text-[#AE8638] transition-colors font-semibold">I had a payment issue, who do I contact?</AccordionTrigger>
                            <AccordionContent className="text-gray-400 text-base leading-relaxed font-light pt-2 pb-6">
                                If your money was deducted but you didn't receive a ticket, please wait 15-30 minutes as it might be a banking delay. If the issue persists, contact our support team with your transaction reference ID.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                <div className="mt-16 text-center bg-black/50 border border-white/5 p-12 rounded-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#AE8638]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <h3 className="text-2xl font-bold mb-4 text-white">Still need help?</h3>
                    <p className="text-gray-400 mb-6 font-light">Our support team is available to assist you 24/7.</p>
                    <a href="mailto:support@wildcardstat.com" className="inline-block px-8 py-4 bg-[#AE8638] text-black hover:bg-[#F7EF8A] rounded-xl font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(174,134,56,0.3)] transition-all">
                        Contact Support
                    </a>
                </div>
            </main>

            <Footer />
        </div>
    );
}
