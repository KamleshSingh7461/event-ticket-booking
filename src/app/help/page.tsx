'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function HelpPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="container py-12 md:py-20 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Help Center</h1>
                    <p className="text-lg text-muted-foreground">
                        Frequently asked questions and support for FGSN Events
                    </p>
                </div>

                <div className="bg-card border rounded-xl p-6 md:p-10 shadow-sm">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-lg text-left">How do I book a ticket?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base">
                                Browsing our events page, select an event you are interested in, click "Book Now", choose your dates and quantity, and proceed to payment. You will need to be logged in to complete a booking.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2">
                            <AccordionTrigger className="text-lg text-left">How will I receive my ticket?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base">
                                Once your payment is successful, your ticket (QR Code) will be generated instantly. You can view it in your Dashboard under "My Tickets". A copy will also be sent to your registered email address.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3">
                            <AccordionTrigger className="text-lg text-left">What is WYLDCARD STATS PRIVATE LIMITED?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base">
                                <strong>WYLDCARD STATS PRIVATE LIMITED</strong> is the parent company and registered legal entity that processes all payments for FGSN Events. You may see this name appear on your bank statement or payment confirmation screens.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-4">
                            <AccordionTrigger className="text-lg text-left">Can I cancel my booking?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base">
                                Cancellation policies vary by event. Please check the specific event details or our Refunds & Cancellations page for more general information. If eligible, refunds are processed by WYLDCARD STATS PRIVATE LIMITED back to your original payment method.
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-5">
                            <AccordionTrigger className="text-lg text-left">I had a payment issue, who do I contact?</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base">
                                If your money was deducted but you didn't receive a ticket, please wait 15-30 minutes as it might be a banking delay. If the issue persists, contact our support team with your transaction reference ID.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                <div className="mt-12 text-center bg-muted/50 p-8 rounded-xl">
                    <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
                    <p className="text-muted-foreground mb-4">Our support team is available to assist you.</p>
                    <p className="font-medium">Support Email: supports@wildcardstat.com</p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
