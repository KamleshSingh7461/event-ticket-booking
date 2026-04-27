import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event';
import { verifyResponseHash } from '@/lib/payu';
import { sendBookingConfirmation } from '@/lib/email';
import { createInvoiceForBooking } from '@/lib/invoice-service';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        // PayU sends S2S webhooks as Form URL Encoded
        const formData = await req.formData();
        const data: any = {};
        formData.forEach((value, key) => (data[key] = value));

        const salt = process.env.PAYU_SALT || 'TuxqAugd';

        console.log('PayU Webhook Data Received:', { txnid: data.txnid, status: data.status, mihpayid: data.mihpayid });

        // 1. Verify Hash
        if (!verifyResponseHash(data, salt, data.hash)) {
            console.error(`Webhook Hash Verification Failed for TXN: ${data.txnid}`);
            return NextResponse.json({ error: 'Hash Verification Failed' }, { status: 400 });
        }

        // 2. Only process 'success' status
        if (data.status !== 'success') {
            console.log(`Webhook ignored: Payment status is ${data.status} for TXN: ${data.txnid}`);
            return NextResponse.json({ message: 'Ignored: Status is not success' }, { status: 200 });
        }

        // 3. Find tickets
        const tickets = await Ticket.find({ bookingReference: data.txnid }).populate('event');

        if (tickets.length === 0) {
            console.error(`Webhook Error: Tickets not found for TXN: ${data.txnid}`);
            return NextResponse.json({ error: 'Tickets not found' }, { status: 404 });
        }

        // 4. Idempotency Check (Check if already processed by success route or a previous webhook)
        const isAlreadySuccess = tickets.every(t => t.paymentStatus === 'SUCCESS');
        if (isAlreadySuccess) {
            console.log(`Webhook Idempotency: Tickets already marked as SUCCESS for TXN: ${data.txnid}. Skipping processing.`);
            return NextResponse.json({ message: 'Already processed' }, { status: 200 });
        }

        console.log(`Webhook Processing: Marking tickets as SUCCESS for TXN: ${data.txnid}`);

        // 5. Update tickets to SUCCESS
        await Ticket.updateMany(
            { bookingReference: data.txnid },
            {
                paymentStatus: 'SUCCESS',
                payuTransactionId: data.mihpayid
            }
        );

        // 6. Generate Invoice
        let invoiceUrl = undefined;
        try {
            const invoice = await createInvoiceForBooking(data.txnid);
            if (invoice && invoice.pdfUrl) {
                invoiceUrl = invoice.pdfUrl;
            }
        } catch (invErr) {
            console.error('Webhook: Invoice generation failed', invErr);
        }

        // 7. Send Emails (only for tickets that were pending)
        for (const ticket of tickets) {
            if (ticket.paymentStatus !== 'SUCCESS') {
                try {
                    await sendBookingConfirmation({
                        email: ticket.buyerDetails.email,
                        name: ticket.buyerDetails.name,
                        otp: ticket.otp,
                        eventTitle: ticket.event.title,
                        ticketType: ticket.ticketType,
                        bookingReference: ticket.bookingReference,
                        quantity: tickets.length,
                        invoiceUrl: invoiceUrl
                    });
                } catch (emailErr) {
                    console.error(`Webhook: Email failed for ticket ${ticket._id}`, emailErr);
                }
            }
        }

        // 8. Respond to PayU with 200 OK
        return NextResponse.json({ success: true, message: 'Webhook processed successfully' }, { status: 200 });

    } catch (error: any) {
        console.error('PayU Webhook Critical Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
