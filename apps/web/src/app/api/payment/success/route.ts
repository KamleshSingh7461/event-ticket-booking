import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event'; // Ensure Event is registered
import { verifyResponseHash } from '@/lib/payu';
import { sendBookingConfirmation, sendTicketEmail, sendInvoiceEmail } from '@/lib/email';
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
                    let invoiceDoc: any = null;
                    try {
                        invoiceDoc = await createInvoiceForBooking(data.txnid);
                        if (invoiceDoc && invoiceDoc.pdfUrl) {
                            invoiceUrl = invoiceDoc.pdfUrl;
                        }
                    } catch (invErr) {
                        console.error('Invoice generation failed', invErr);
                    }

                    // Send Emails
                    
                    // 1. Send Invoice Email (Once per transaction)
                    if (invoiceDoc && invoiceUrl) {
                        try {
                            let pdfBuffer: Buffer | undefined;
                            try {
                                const pdfRes = await fetch(invoiceUrl);
                                const arrayBuffer = await pdfRes.arrayBuffer();
                                pdfBuffer = Buffer.from(arrayBuffer);
                            } catch (e) {
                                console.error('Failed to download PDF buffer', e);
                            }
                            
                            await sendInvoiceEmail({
                                email: tickets[0].buyerDetails.email,
                                name: tickets[0].buyerDetails.name,
                                invoiceNumber: invoiceDoc._id.toString().slice(-6).toUpperCase(), // Using ID as number if not present
                                eventTitle: tickets[0].event.title,
                                totalAmount: invoiceDoc.totalAmount,
                                currency: invoiceDoc.currency,
                                pdfBuffer: pdfBuffer
                            });
                        } catch (err) {
                            console.error('Invoice Email failed', err);
                        }
                    }

                    // 2. Send Ticket Emails (One for each ticket)
                    for (const ticket of tickets) {
                        try {
                            // Generate QR Code data URL
                            const qrData = JSON.stringify({
                                t: ticket._id,
                                e: ticket.event._id,
                                o: ticket.otp
                            });
                            const qrCodeDataUrl = await QRCode.toDataURL(qrData);
                            
                            const eventDate = ticket.selectedDates && ticket.selectedDates.length > 0 
                                ? new Date(ticket.selectedDates[0]).toDateString() + (ticket.selectedDates.length > 1 ? ` (+${ticket.selectedDates.length - 1} days)` : '')
                                : new Date(ticket.event.startDate).toDateString();

                            await sendTicketEmail({
                                email: ticket.buyerDetails.email,
                                name: ticket.buyerDetails.name,
                                eventTitle: ticket.event.title,
                                eventDate: eventDate,
                                venue: ticket.event.venue,
                                ticketCode: ticket._id.toString().slice(-6).toUpperCase(),
                                qrCodeDataUrl: qrCodeDataUrl,
                                bookingId: ticket.bookingReference,
                                amountPaid: ticket.amountPaid,
                                ticketLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/user/tickets/${ticket._id}`
                            });
                        } catch (emailErr) {
                            console.error('Ticket Email failed', emailErr);
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
