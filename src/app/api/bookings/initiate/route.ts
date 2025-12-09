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
        const { eventId, user } = body;

        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
        }

        // Create a temporary or actual user if needed. For now, we assume guest checkout or simple user creation.
        // In a real app, check if user exists.
        let dbUser = await User.findOne({ email: user.email });
        if (!dbUser) {
            // Create user implicitly
            dbUser = await User.create({
                name: user.name,
                email: user.email,
                password: crypto.randomBytes(8).toString('hex'), // Temporary password
                role: 'USER'
            });
        }

        // Create Pending Ticket
        const txnid = `TXN${Date.now()}${crypto.randomBytes(2).toString('hex')}`;
        const amount = event.ticketConfig.price;
        const productinfo = event.title;

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // QR Hash for this ticket (unique secret)
        const qrHash = crypto.randomBytes(32).toString('hex');

        const ticket = await Ticket.create({
            event: event._id,
            user: dbUser._id,
            bookingReference: txnid,
            amountPaid: amount,
            paymentStatus: 'PENDING',
            buyerDetails: {
                name: user.name,
                email: user.email,
                age: parseInt(user.age),
                gender: user.gender,
                contact: user.phone
            },
            ticketType: body.ticketType || 'SINGLE_DAY', // SINGLE_DAY or ALL_DAY_PACKAGE
            selectedDate: body.selectedDate ? new Date(body.selectedDate) : null,
            otp: otp, // 6-digit OTP for verification
            verified: false,
            qrCodeHash: qrHash // Keep for backward compatibility
        });

        // TODO: Send OTP email here
        console.log('📧 OTP for', user.email, ':', otp);

        // Generate PayU Params
        const payuConfig = {
            key: process.env.PAYU_KEY || 'JPM7Fg', // DEFAULT TESTING KEY
            salt: process.env.PAYU_SALT || 'TuxqAugd', // DEFAULT TESTING SALT
            txnid: txnid,
            amount: amount.toFixed(2),
            productinfo: productinfo.slice(0, 100), // Max length check
            firstname: user.name.split(' ')[0], // PayU often takes first name
            email: user.email,
            phone: user.phone,
            surl: `${process.env.NEXTAUTH_URL}/api/payment/success`,
            furl: `${process.env.NEXTAUTH_URL}/api/payment/failure`,
        };

        const hash = generateHash(payuConfig, payuConfig.salt);

        return NextResponse.json({
            success: true,
            payuParams: {
                action: process.env.PAYU_TEST_URL || 'https://test.payu.in/_payment',
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
