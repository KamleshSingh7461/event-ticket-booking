import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Ticket from '@/models/Ticket';

// Verify ticket using OTP
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();
        const { otp } = await req.json();

        if (!otp || otp.length !== 6) {
            return NextResponse.json(
                { success: false, error: 'Invalid OTP format' },
                { status: 400 }
            );
        }

        // Find ticket by OTP
        const ticket = await Ticket.findOne({ otp })
            .populate('user', 'name email')
            .populate('event', 'title startDate endDate venue');

        if (!ticket) {
            return NextResponse.json(
                { success: false, error: 'Invalid OTP' },
                { status: 404 }
            );
        }

        // Check if already verified
        if (ticket.verified) {
            return NextResponse.json(
                {
                    success: true,
                    alreadyVerified: true,
                    message: 'Ticket already verified',
                    data: {
                        user: ticket.user,
                        event: ticket.event,
                        ticketType: ticket.ticketType,
                        selectedDate: ticket.selectedDate,
                        verifiedAt: ticket.verifiedAt
                    }
                }
            );
        }

        // Mark as verified
        ticket.verified = true;
        ticket.verifiedAt = new Date();
        ticket.isRedeemed = true;
        ticket.redeemedAt = new Date();
        await ticket.save();

        return NextResponse.json({
            success: true,
            message: 'Ticket verified successfully',
            data: {
                user: ticket.user,
                event: ticket.event,
                ticketType: ticket.ticketType,
                selectedDate: ticket.selectedDate,
                quantity: ticket.quantity,
                verifiedAt: ticket.verifiedAt
            }
        });
    } catch (error: any) {
        console.error('OTP verification error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
