import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event'; // Ensure Event is registered
import { verifyResponseHash } from '@/lib/payu';
import { sendBookingConfirmation } from '@/lib/email';
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
            // Update Ticket
            const ticket = await Ticket.findOne({ bookingReference: data.txnid }).populate('event');

            if (ticket) {
                if (ticket.paymentStatus !== 'SUCCESS') {
                    ticket.paymentStatus = 'SUCCESS';
                    ticket.payuTransactionId = data.mihpayid;
                    await ticket.save();

                    // Send Email
                    try {
                        await sendBookingConfirmation({
                            email: ticket.buyerDetails.email,
                            name: ticket.buyerDetails.name,
                            otp: ticket.otp,
                            eventTitle: ticket.event.title,
                            ticketType: ticket.ticketType,
                            bookingReference: ticket.bookingReference
                        });
                    } catch (emailErr) {
                        console.error('Email failed', emailErr);
                    }
                }

                // Redirect to Confirmation Page
                return NextResponse.redirect(new URL(`/booking/confirmation?id=${ticket._id}`, req.url), 303);
            } else {
                return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
            }
        } else {
            return NextResponse.json({ error: 'Hash Verification Failed' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Payment Error', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
