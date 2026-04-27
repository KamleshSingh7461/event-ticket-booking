import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const data: any = {};
        formData.forEach((value, key) => (data[key] = value));

        await dbConnect();

        // Mark ALL tickets as failed
        await Ticket.updateMany(
            { bookingReference: data.txnid },
            { paymentStatus: 'FAILED' }
        );

        return NextResponse.redirect(new URL(`/booking/failure?txnid=${data.txnid}`, process.env.NEXTAUTH_URL || 'http://localhost:3000'), 303);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
