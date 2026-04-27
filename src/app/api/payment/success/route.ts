import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event'; // Ensure Event is registered
import { verifyResponseHash } from '@/lib/payu';
import { sendBookingConfirmation } from '@/lib/email';
import { createInvoiceForBooking } from '@/lib/invoice-service';
import QRCode from 'qrcode'; // Need to install this

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        // PayU sends data as Form URL Encoded
        const formData = await req.formData();
        const data: any = {};
        formData.forEach((value, key) => (data[key] = value));

        const salt = process.env.PAYU_SALT || 'TuxqAugd';

        console.log('PayU Success Callback Data:', data);

        if (verifyResponseHash(data, salt, data.hash)) {
            // Find ALL tickets for this transaction
            const tickets = await Ticket.find({ bookingReference: data.txnid }).populate('event');

            if (tickets.length > 0) {
                // Check Idempotency: If tickets are already SUCCESS, it was handled by the Webhook or a previous refresh
                const isAlreadySuccess = tickets.every(t => t.paymentStatus === 'SUCCESS');

                if (!isAlreadySuccess) {
                    // Update all tickets to SUCCESS
                    await Ticket.updateMany(
                        { bookingReference: data.txnid },
                        {
                            paymentStatus: 'SUCCESS',
                            payuTransactionId: data.mihpayid
                        }
                    );

                    // Generate Invoice
                    let invoiceUrl = undefined;
                    try {
                        const invoice = await createInvoiceForBooking(data.txnid);
                        if (invoice && invoice.pdfUrl) {
                            invoiceUrl = invoice.pdfUrl;
                        }
                    } catch (invErr) {
                        console.error('Invoice generation failed', invErr);
                    }

                    // Send Emails
                    for (const ticket of tickets) {
                        try {
                            await sendBookingConfirmation({
                                email: ticket.buyerDetails.email,
                                name: ticket.buyerDetails.name,
                                otp: ticket.otp,
                                eventTitle: ticket.event.title,
                                ticketType: ticket.ticketType,
                                bookingReference: ticket.bookingReference,
                                quantity: tickets.length, // Total quantity in this order
                                invoiceUrl: invoiceUrl
                            });
                        } catch (emailErr) {
                            console.error('Email failed', emailErr);
                        }
                    }
                }

                // Redirect to Confirmation Page (using the first ticket ID as reference)
                return NextResponse.redirect(new URL(`/booking/confirmation?id=${tickets[0]._id}`, process.env.NEXTAUTH_URL || 'http://localhost:3000'), 303);
            } else {
                return NextResponse.json({ error: 'Tickets not found' }, { status: 404 });
            }
        } else {
            return NextResponse.json({ error: 'Hash Verification Failed' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Payment Error', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
