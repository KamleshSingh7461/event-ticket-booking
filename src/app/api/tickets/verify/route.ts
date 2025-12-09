import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event'; // Ensure model is loaded

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { qrHash, coordinatorId } = await req.json();

        if (!qrHash) {
            return NextResponse.json({ success: false, message: 'QR Hash is required' }, { status: 400 });
        }

        const ticket = await Ticket.findOne({ qrCodeHash: qrHash }).populate('event');

        if (!ticket) {
            return NextResponse.json({ success: false, message: 'Invalid Ticket' }, { status: 404 });
        }

        if (ticket.paymentStatus !== 'SUCCESS') {
            return NextResponse.json({ success: false, message: 'Ticket not paid for' }, { status: 400 });
        }

        if (ticket.isRedeemed) {
            return NextResponse.json({
                success: false,
                message: 'Ticket already used!',
                data: {
                    redeemedAt: ticket.redeemedAt,
                    buyer: ticket.buyerDetails.name
                }
            }, { status: 400 });
        }

        // Check Event Date (Optional: Can only redeem on event day)
        const now = new Date();
        // if (now < ticket.event.startDate) { ... }

        // Redeem Ticket
        ticket.isRedeemed = true;
        ticket.redeemedAt = new Date();
        // ticket.redeemedBy = coordinatorId; // If we had auth context
        await ticket.save();

        return NextResponse.json({
            success: true,
            message: 'Verified Successfully',
            data: {
                buyer: ticket.buyerDetails.name,
                type: 'General Entry',
                event: ticket.event.title
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
