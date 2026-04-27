import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import crypto from 'crypto';
import { sendTicketEmail } from '@/lib/email';
import { generateTicketQR } from '@/lib/qrcode';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { ticketId, newBuyerDetails } = body;

        if (!ticketId || !newBuyerDetails || !newBuyerDetails.email || !newBuyerDetails.name) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // 1. Fetch the ticket
        const ticket = await Ticket.findById(ticketId).populate('event');
        if (!ticket) {
            return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
        }

        // 2. Ensure the ticket belongs to the current user
        if (ticket.user.toString() !== session.user.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized to transfer this ticket' }, { status: 403 });
        }

        // 3. Ensure ticket is paid and not already redeemed
        if (ticket.paymentStatus !== 'SUCCESS') {
            return NextResponse.json({ success: false, error: 'Cannot transfer unpaid ticket' }, { status: 400 });
        }
        if (ticket.isRedeemed) {
            return NextResponse.json({ success: false, error: 'Cannot transfer a ticket that has already been used' }, { status: 400 });
        }

        // 4. Find or create the new user
        let newOwner = await User.findOne({ email: newBuyerDetails.email });
        if (!newOwner) {
            newOwner = await User.create({
                name: newBuyerDetails.name,
                email: newBuyerDetails.email,
                password: crypto.randomBytes(8).toString('hex'), // Temporary random password
                role: 'USER'
            });
        }

        // 5. Generate new Security Credentials
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const newQrHash = crypto.randomBytes(32).toString('hex');

        // 6. Update the Ticket
        ticket.user = newOwner._id;
        ticket.buyerDetails = {
            name: newBuyerDetails.name,
            email: newBuyerDetails.email,
            contact: newBuyerDetails.phone || '',
            age: newBuyerDetails.age || 0,
            gender: newBuyerDetails.gender || 'Unknown',
            address: newBuyerDetails.address || '',
            state: newBuyerDetails.state || ''
        };
        ticket.otp = newOtp;
        ticket.qrCodeHash = newQrHash;

        await ticket.save();

        // 7. Send Email to the new owner!
        try {
            // Generate the QR Code Data URL so we can attach it to the email
            const qrCodeDataUrl = await generateTicketQR({
                ticketId: ticket._id.toString(),
                bookingReference: ticket.bookingReference,
                qrCodeHash: ticket.qrCodeHash
            });

            await sendTicketEmail({
                email: ticket.buyerDetails.email,
                name: ticket.buyerDetails.name,
                eventTitle: ticket.event.title,
                eventDate: new Date(ticket.event.startDate).toLocaleDateString(),
                venue: ticket.event.venue,
                ticketCode: ticket.otp,
                qrCodeDataUrl: qrCodeDataUrl,
                bookingId: ticket.bookingReference,
                amountPaid: ticket.amountPaid || 0,
                ticketLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/user/tickets/${ticket._id}`
            });
        } catch (emailErr) {
            console.error('Failed to send transfer email:', emailErr);
        }

        return NextResponse.json({ success: true, message: 'Ticket transferred successfully' }, { status: 200 });

    } catch (error: any) {
        console.error('Ticket Transfer API Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to transfer ticket' }, { status: 500 });
    }
}
