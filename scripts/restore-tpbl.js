
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const crypto = require('crypto');

const DB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'event-booking';
const EVENT_ID = '693951bc67f7f49cb5cb83eb';

const EVENT_START = new Date('2025-12-16T00:00:00Z');
const EVENT_END = new Date('2025-12-24T23:59:59Z');

async function run() {
    const client = new MongoClient(DB_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const usersColl = db.collection('users');
        const ticketsColl = db.collection('tickets');

        console.log('--- Cleaning up existing TPBL successful tickets ---');
        await ticketsColl.deleteMany({
            event: new ObjectId(EVENT_ID),
            paymentStatus: 'SUCCESS'
        });

        const content = fs.readFileSync('ticket.txt', 'utf8');
        const lines = content.split('\n');
        const header = lines[0].split('\t');
        
        const productInfoIdx = header.indexOf('productinfo');
        const statusIdx = header.indexOf('status');
        const amountIdx = header.indexOf('amount');
        const firstnameIdx = header.indexOf('firstname');
        const emailIdx = header.indexOf('email');
        const phoneIdx = header.indexOf('phone');
        const txnidIdx = header.indexOf('txnid');
        const idIdx = header.indexOf('id');
        const dateIdx = header.indexOf('addedon');

        let restoredCount = 0;
        let restoredRevenue = 0;

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split('\t');
            if (cols.length < header.length) continue;

            const product = cols[productInfoIdx] || '';
            const status = cols[statusIdx] || '';
            const amount = parseFloat(cols[amountIdx]);
            const name = cols[firstnameIdx] || 'Guest';
            const email = (cols[emailIdx] || 'test@test.com').toLowerCase().trim();
            const phone = cols[phoneIdx] || '';
            const txnId = cols[txnidIdx] || '';
            const payuId = cols[idIdx] || '';
            const addedOnRaw = cols[dateIdx] || new Date().toISOString();
            const addedOn = new Date(addedOnRaw);

            if (status === 'captured' && (product.includes('TELANGANA PRO BASKETBALL LEAGUE') || product === 'Test')) {
                let user = await usersColl.findOne({ email });
                if (!user) {
                    const newUser = {
                        name, email,
                        password: crypto.randomBytes(8).toString('hex'),
                        role: 'USER', createdAt: new Date(), updatedAt: new Date()
                    };
                    const userResult = await usersColl.insertOne(newUser);
                    user = { ...newUser, _id: userResult.insertedId };
                }

                let ticketCount = 1;
                let ticketType = 'SINGLE_DAY';

                if (product.includes('Season Pass') || product.includes('MULTI_DAY')) {
                    ticketType = 'MULTI_DAY';
                    ticketCount = Math.max(1, Math.round(amount / 1180));
                } else {
                    ticketCount = Math.max(1, Math.round(amount / 177));
                }

                // Distribution of dates
                let selectedDates = [];
                if (ticketType === 'MULTI_DAY') {
                    // All dates from 16 to 24
                    for (let d = 16; d <= 24; d++) {
                        selectedDates.push(new Date(`2025-12-${d}T18:00:00Z`));
                    }
                } else {
                    // Use addedOn date if within range, else 16th
                    let ticketDate = new Date(addedOn);
                    ticketDate.setUTCHours(18, 0, 0, 0);
                    if (ticketDate < EVENT_START) ticketDate = new Date('2025-12-16T18:00:00Z');
                    if (ticketDate > EVENT_END) ticketDate = new Date('2025-12-24T18:00:00Z');
                    selectedDates = [ticketDate];
                }

                const amountPerTicket = amount / ticketCount;
                const baseAmountPerTicket = amountPerTicket / 1.18;

                for (let j = 0; j < ticketCount; j++) {
                    const otp = Math.floor(100000 + Math.random() * 900000).toString();
                    const qrHash = crypto.createHash('sha256').update(`${payuId}-${j}-${otp}`).digest('hex');

                    const ticket = {
                        event: new ObjectId(EVENT_ID),
                        user: user._id,
                        bookingReference: txnId,
                        paymentStatus: 'SUCCESS',
                        payuTransactionId: payuId,
                        amountPaid: amountPerTicket,
                        pricing: {
                            baseAmount: baseAmountPerTicket,
                            gstRate: 0.18,
                            gstAmount: amountPerTicket - baseAmountPerTicket,
                            totalAmount: amountPerTicket,
                            currency: 'INR'
                        },
                        buyerDetails: { name: user.name, email: user.email, contact: phone },
                        selectedDates: selectedDates,
                        checkIns: [],
                        ticketType: ticketType,
                        otp: otp,
                        qrCodeHash: qrHash,
                        isRedeemed: false,
                        createdAt: addedOn
                    };

                    await ticketsColl.insertOne(ticket);
                    restoredCount++;
                }
                restoredRevenue += amount;
            }
        }

        console.log(`Total Tickets Created: ${restoredCount}`);
        console.log(`Total Revenue Restored: ₹${restoredRevenue.toFixed(2)}`);
    } finally {
        await client.close();
    }
}

run().catch(console.error);
