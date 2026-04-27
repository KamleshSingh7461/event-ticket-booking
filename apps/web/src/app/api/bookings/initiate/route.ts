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
        const { eventId, user, quantity = 1, bookingType = 'DAILY' } = body;
        const ticketQty = parseInt(quantity as string) || 1;

        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
        }

        // Check if event is manually marked as Sold Out
        if (event.isSoldOut) {
            return NextResponse.json({ success: false, error: 'This event is currently sold out.' }, { status: 400 });
        }


        // Validate quantity
        if (ticketQty < 1 || ticketQty > 10) {
            return NextResponse.json({ success: false, error: 'Invalid quantity (1-10 allowed)' }, { status: 400 });
        }

        let baseAmount = 0;
        let productinfo = '';
        let validDates: Date[] = [];
        let totalDays = 0;

        // Detect all requested dates for this booking
        let requestedDates: string[] = [];
        if (bookingType === 'ALL_DAY') {
            // Validate that All Day Price exists
            if (!event.ticketConfig.allDayPrice) {
                return NextResponse.json({ success: false, error: 'All Day Subscription not available for this event.' }, { status: 400 });
            }

            const start = new Date(event.startDate);
            const end = new Date(event.endDate);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const config = event.dailyConfig?.find((c: any) => {
                    const configDate = new Date(c.date);
                    return configDate.toDateString() === d.toDateString();
                });

                if (config?.isSoldOut) {
                    return NextResponse.json({ success: false, error: `Season Pass unavailable: ${d.toDateString()} is sold out.` }, { status: 400 });
                }

                // Cutoff check for today if it's part of the range
                const bookingDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                if (bookingDate.getTime() === today.getTime()) {
                    const cutOffTimeStr = config?.cutoffTime || event.bookingCutOffTime || event.entryTime;
                    if (cutOffTimeStr) {
                        const [cutHour, cutMin] = cutOffTimeStr.split(':').map(Number);
                        const cutOffDateTime = new Date(today);
                        cutOffDateTime.setHours(cutHour, cutMin, 0, 0);
                        if (now > cutOffDateTime) {
                             return NextResponse.json({ success: false, error: `Season Pass unavailable: Bookings for today already closed.` }, { status: 400 });
                        }
                    }
                }

                requestedDates.push(d.toDateString());
                validDates.push(new Date(d));
            }
            totalDays = validDates.length;
            baseAmount = event.ticketConfig.allDayPrice * ticketQty;
            productinfo = `${event.title} (Season Pass, ${ticketQty} tickets)`;

        } else {
            // DAILY Booking Logic
            const selectedDates = body.selectedDates;
            if (!selectedDates || !Array.isArray(selectedDates) || selectedDates.length === 0) {
                return NextResponse.json({ success: false, error: 'Please select at least one date.' }, { status: 400 });
            }

            const start = new Date(event.startDate);
            const end = new Date(event.endDate);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            let totalDailyPriceSum = 0; // NEW: Keep track of sum

            for (const dateStr of selectedDates) {
                const d = new Date(dateStr);
                const bookingDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

                // Find daily config for this date
                const config = event.dailyConfig?.find((c: any) => {
                    const configDate = new Date(c.date);
                    return configDate.toDateString() === d.toDateString();
                });

                // 1. Check if date is outside event range
                if (d < start || d > end) {
                    return NextResponse.json({ success: false, error: `Date ${dateStr} is outside event range.` }, { status: 400 });
                }

                // 2. Prevent Back-dated Bookings
                if (bookingDate < today) {
                    return NextResponse.json({ success: false, error: 'Cannot book tickets for a date that has already passed.' }, { status: 400 });
                }

                // 3. Daily Sold Out Check
                if (config?.isSoldOut) {
                    return NextResponse.json({ success: false, error: `Tickets for ${d.toDateString()} are sold out.` }, { status: 400 });
                }

                // 4. Same-day Cut-off Check (Respect Daily Override)
                if (bookingDate.getTime() === today.getTime()) {
                    const cutOffTimeStr = config?.cutoffTime || event.bookingCutOffTime || event.entryTime;
                    if (cutOffTimeStr) {
                        const [cutHour, cutMin] = cutOffTimeStr.split(':').map(Number);
                        const cutOffDateTime = new Date(today);
                        cutOffDateTime.setHours(cutHour, cutMin, 0, 0);

                        if (now > cutOffDateTime) {
                            return NextResponse.json({
                                success: false,
                                error: `Bookings for today closed at ${cutOffTimeStr}.`
                            }, { status: 400 });
                        }
                    }
                }

                // Add to sum using daily override price or base price
                const dayPrice = config?.price || event.ticketConfig.price;
                totalDailyPriceSum += dayPrice;

                requestedDates.push(d.toDateString());
                validDates.push(d);
            }

            totalDays = validDates.length;
            baseAmount = totalDailyPriceSum * ticketQty;
            productinfo = `${event.title} (${ticketQty} tickets, ${totalDays} days)`;
        }

        // CRITICAL: Daily Inventory Check
        // We must check if ADDING 'ticketQty' to ANY of the requested dates exceeds the daily limit.
        const dailyCapacity = event.ticketConfig.quantity || 500; // Default to 500 if not set

        for (const dateStr of requestedDates) {
            // Find daily config for this date to check for capacity override
            const d = new Date(dateStr);
            const config = event.dailyConfig?.find((c: any) => {
                const configDate = new Date(c.date);
                return configDate.toDateString() === d.toDateString();
            });

            const currentCapacity = config?.capacity || event.ticketConfig.quantity || 500;

            // Count existing tickets that cover this specific date (Check 'selectedDates' array for match)
            // Payment status must be SUCCESS or PENDING within the last 15 minutes
            const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
            
            const existingCount = await Ticket.countDocuments({
                event: event._id,
                $or: [
                    { paymentStatus: 'SUCCESS' },
                    { paymentStatus: 'PENDING', createdAt: { $gte: fifteenMinsAgo } }
                ],
                selectedDates: {
                    $elemMatch: { $gte: new Date(dateStr), $lt: new Date(new Date(dateStr).getTime() + 86400000) }
                }
            });

            if (existingCount + ticketQty > currentCapacity) {
                return NextResponse.json({
                    success: false,
                    error: `Sold Out for date: ${dateStr}. Only ${currentCapacity - existingCount} tickets remaining.`
                }, { status: 400 });
            }
        }

        // ... User validation continues below

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
        const platformFee = baseAmount * 0.03;
        const gstAmount = (baseAmount + platformFee) * 0.18;
        const totalAmount = baseAmount + platformFee + gstAmount;

        // Create Tickets Loop
        const tickets = [];
        for (let i = 0; i < ticketQty; i++) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const qrHash = crypto.randomBytes(32).toString('hex');

            // Calculate amount per ticket with detailed breakdown
            const baseAmountPerTicket = baseAmount / ticketQty;
            const platformFeePerTicket = platformFee / ticketQty;
            const gstAmountPerTicket = gstAmount / ticketQty;
            const platformFeeGstPerTicket = platformFeePerTicket * 0.18;
            const totalAmountPerTicket = totalAmount / ticketQty;

            tickets.push({
                event: event._id,
                user: dbUser._id,
                bookingReference: txnid,
                amountPaid: totalAmountPerTicket, // Kept for backward compatibility
                pricing: {
                    baseAmount: baseAmountPerTicket,
                    gstRate: 0.18,
                    gstAmount: gstAmountPerTicket,
                    platformFee: platformFeePerTicket,
                    platformFeeGst: platformFeeGstPerTicket,
                    totalAmount: totalAmountPerTicket,
                    currency: event.ticketConfig.currency || 'INR'
                },
                paymentStatus: 'PENDING',
                buyerDetails: {
                    name: user.name,
                    email: user.email,
                    age: parseInt(user.age),
                    gender: user.gender,
                    contact: user.phone,
                    address: user.address,
                    state: user.state
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
