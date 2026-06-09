import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';

import { verifyResponseHash } from '@/lib/payu';

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type') || '';
        let data: any = {};

        if (contentType.includes('application/json')) {
            const body = await req.json();
            data = body.event_payload ? body.event_payload : body;
        } else {
            const formData = await req.formData();
            formData.forEach((value, key) => (data[key] = value));
        }

        const salt = process.env.PAYU_SALT || 'TuxqAugd';
        if (data.hash && !verifyResponseHash(data, salt, data.hash)) {
            console.error(`Failure Hash Verification Failed for TXN: ${data.txnid}`);
            return NextResponse.json({ error: 'Invalid Hash' }, { status: 400 });
        }

        await dbConnect();

        // Extract failure reason from PayU payload
        const failureReason = data.error_Message || data.field7 || data.unmappedstatus || 'Unknown error';
        
        console.log(`Payment failed for TXN: ${data.txnid}. Reason: ${failureReason}`);

        // Mark ALL tickets as failed and record reason
        await Ticket.updateMany(
            { bookingReference: data.txnid },
            { 
                paymentStatus: 'FAILED',
                failureReason: failureReason
            }
        );

        // Check if it's a browser FURL request (Form Data) or a server-to-server webhook (JSON)
        // Webhooks use application/json, browser redirects use application/x-www-form-urlencoded
        const isWebhook = contentType.includes('application/json');

        if (!isWebhook) {
            // Browser redirect
            return NextResponse.redirect(new URL(`/booking/failure?txnid=${data.txnid}`, process.env.NEXTAUTH_URL || 'http://localhost:3000'), 303);
        } else {
            // S2S Webhook
            return NextResponse.json({ success: true, message: 'Failure webhook processed' }, { status: 200 });
        }
    } catch (error) {
        console.error('Payment failure route error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
