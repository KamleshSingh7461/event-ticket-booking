import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import { generateHash } from '@/lib/payu';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const { eventId, user, quantity = 1 } = body;
        const ticketQty = parseInt(quantity as string) || 1;

        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
        }

        // Validate quantity
        if (ticketQty < 1 || ticketQty > 10) {
            return NextResponse.json({ success: false, error: 'Invalid quantity (1-10 allowed)' }, { status: 400 });
        }

        // ... User validation (lines 9-25 same)

        const selectedDates = body.selectedDates; // Expecting Array of date strings

        if (!selectedDates || !Array.isArray(selectedDates) || selectedDates.length === 0) {
            return NextResponse.json({ success: false, error: 'Please select at least one date.' }, { status: 400 });
        }

        // Validate dates are within event range
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        const validDates: Date[] = [];

        for (const dateStr of selectedDates) {
            const d = new Date(dateStr);
            if (d < start || d > end) {
                return NextResponse.json({ success: false, error: `Date ${dateStr} is outside event range.` }, { status: 400 });
            }
            validDates.push(d);
        }

        let dbUser = await User.findOne({ email: user.email });
        if (!dbUser) {
            dbUser = await User.create({
                name: user.name,
                email: user.email,
                password: crypto.randomBytes(8).toString('hex'),
                role: 'USER'
            });
        }

        // Transaction Setup
        const txnid = `TXN${Date.now()}${crypto.randomBytes(2).toString('hex')}`;
        const unitPrice = event.ticketConfig.price;
        const totalDays = validDates.length;
        const totalAmount = unitPrice * ticketQty * totalDays; // Price * Qty * Days
        const productinfo = `${event.title} (${ticketQty} tickets, ${totalDays} days)`;

        // Create Tickets Loop
        const tickets = [];
        for (let i = 0; i < ticketQty; i++) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const qrHash = crypto.randomBytes(32).toString('hex');

            tickets.push({
                event: event._id,
                user: dbUser._id,
                bookingReference: txnid,
                amountPaid: unitPrice * totalDays, // Amount per ticket (for all days)
                paymentStatus: 'PENDING',
                buyerDetails: {
                    name: user.name,
                    email: user.email,
                    age: parseInt(user.age),
                    gender: user.gender,
                    contact: user.phone
                },
                // ticketType: 'MULTI_DAY', // Use default from model or derived
                selectedDates: validDates, // Array of Dates
                otp: otp,
                checkIns: [],
                qrCodeHash: qrHash
            });
        }

        await Ticket.insertMany(tickets);

        // PayU Params (Use totalAmount)
        const payuConfig = {
            key: process.env.PAYU_KEY || 'JPM7Fg',
            salt: process.env.PAYU_SALT || 'TuxqAugd',
            txnid: txnid,
            amount: totalAmount.toFixed(2),
            productinfo: productinfo.slice(0, 100),
            firstname: user.name.split(' ')[0],
            email: user.email,
            phone: user.phone,
            surl: `${process.env.NEXTAUTH_URL}/api/payment/success`,
            furl: `${process.env.NEXTAUTH_URL}/api/payment/failure`,
        };

        // ... Generate Hash and Return (Same)
        const hash = generateHash(payuConfig, payuConfig.salt);

        // Determine PayU URL based on environment
        const payuUrl = process.env.PAYU_ENV === 'production'
            ? (process.env.PAYU_PROD_URL || 'https://secure.payu.in/_payment')
            : (process.env.PAYU_TEST_URL || 'https://test.payu.in/_payment');

        return NextResponse.json({
            success: true,
            payuParams: {
                action: payuUrl,
                params: {
                    ...payuConfig,
                    hash
                }
            }
        });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
