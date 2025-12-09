import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // In production: filter by userId from auth session
        // For now, get all tickets with SUCCESS payment status
        const tickets = await Ticket.find({ paymentStatus: 'SUCCESS' })
            .populate('event')
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json({
            success: true,
            data: tickets.map(t => ({
                _id: t._id,
                event: {
                    title: t.event?.title || 'Unknown Event',
                    startDate: t.event?.startDate,
                    _id: t.event?._id
                },
                buyerDetails: t.buyerDetails,
                amountPaid: t.amountPaid,
                paymentStatus: t.paymentStatus,
                isRedeemed: t.isRedeemed,
                redeemedAt: t.redeemedAt,
                qrCodeHash: t.qrCodeHash,
                createdAt: t.createdAt
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
