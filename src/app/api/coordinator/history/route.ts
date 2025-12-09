import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // In production: filter by coordinatorId from auth session
        // For now, get all redeemed tickets
        const tickets = await Ticket.find({ isRedeemed: true })
            .populate('event')
            .sort({ redeemedAt: -1 })
            .limit(100);

        return NextResponse.json({
            success: true,
            data: tickets.map(t => ({
                _id: t._id,
                buyerName: t.buyerDetails.name,
                buyerEmail: t.buyerDetails.email,
                event: t.event?.title || 'Unknown Event',
                redeemedAt: t.redeemedAt,
                qrCodeHash: t.qrCodeHash
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
