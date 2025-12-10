import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Filter by user ID from session
        const tickets = await Ticket.find({
            user: session.user.id,
            paymentStatus: 'SUCCESS'
        })
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
