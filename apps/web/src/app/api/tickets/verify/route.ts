import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event'; // Ensure model is loaded

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { qrHash, coordinatorId } = await req.json();

        console.log('🔍 [VERIFY API] Request received');
        console.log('📋 [VERIFY API] QR Hash:', qrHash);
        console.log('👤 [VERIFY API] Coordinator ID:', coordinatorId || 'None');

        if (!qrHash) {
            console.error('❌ [VERIFY API] No QR Hash provided');
            return NextResponse.json({ success: false, message: 'QR Hash is required' }, { status: 400 });
        }

        console.log('🔎 [VERIFY API] Searching for ticket with hash:', qrHash);
        const ticket = await Ticket.findOne({ qrCodeHash: qrHash }).populate('event');

        if (!ticket) {
            console.error('❌ [VERIFY API] Ticket not found for hash:', qrHash);
            return NextResponse.json({ success: false, message: 'Invalid Ticket' }, { status: 404 });
        }

        console.log('✅ [VERIFY API] Ticket found:', ticket._id);
        console.log('💳 [VERIFY API] Payment status:', ticket.paymentStatus);

        if (ticket.paymentStatus !== 'SUCCESS') {
            return NextResponse.json({ success: false, message: 'Ticket not paid for' }, { status: 400 });
        }

        if (ticket.isRedeemed) {
            // "Partially Used" check or "Fully Used"?
            // We can treat isRedeemed as "Can never be used again".
            // Implementation: We verify against `checkIns`.
            // If checking in for today:
        }

        const now = new Date();
        const todayStr = now.toDateString(); // "Wed Dec 25 2024"

        // 0. Check Entry Time (if applicable)
        if (ticket.event.entryTime) {
            const [entryHour, entryMinute] = ticket.event.entryTime.split(':').map(Number);
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            const isAfterEntryTime = currentHour > entryHour || (currentHour === entryHour && currentMinute >= entryMinute);

            if (!isAfterEntryTime) {
                return NextResponse.json({
                    success: false,
                    message: `Entry disallowed before ${ticket.event.entryTime}`
                }, { status: 400 });
            }
        }

        // 1. Is ticket valid for today?
        const validForToday = ticket.selectedDates.some((d: Date) => new Date(d).toDateString() === todayStr);

        if (!validForToday) {
            return NextResponse.json({ success: false, message: 'Ticket not valid for TODAY' }, { status: 400 });
        }

        // 2. Already checked in today?
        const alreadyCheckedIn = ticket.checkIns.some((c: any) => new Date(c.date).toDateString() === todayStr);

        if (alreadyCheckedIn) {
            return NextResponse.json({
                success: false,
                message: 'Already Checked-In Today!',
                data: {
                    redeemedAt: ticket.checkIns.find((c: any) => new Date(c.date).toDateString() === todayStr).scannedAt,
                    buyer: ticket.buyerDetails.name
                }
            }, { status: 400 });
        }

        // 3. Perform Check-in
        ticket.checkIns.push({
            date: now, // Storing "today" as the check-in date
            scannedAt: now,
            scannedBy: coordinatorId // Assuming ID is passed
        });

        // Mark as redeemed if all days used? Or just keep open? 
        // Let's mark redeemed only if checkIns.length === selectedDates.length
        if (ticket.checkIns.length >= ticket.selectedDates.length) {
            ticket.isRedeemed = true;
        }

        await ticket.save();

        return NextResponse.json({
            success: true,
            message: 'Check-in Successful',
            data: {
                buyer: ticket.buyerDetails.name,
                type: 'Day Entry',
                event: ticket.event.title,
                daysUsed: `${ticket.checkIns.length}/${ticket.selectedDates.length}`
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
