
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const crypto = require('crypto');

// Schemas (simplified for script)
const UserSchema = new mongoose.Schema({
    email: String,
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const EventSchema = new mongoose.Schema({
    title: String,
    startDate: Date,
    endDate: Date,
    ticketConfig: Object
});
const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

const TicketSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookingReference: String,
    paymentStatus: String,
    amountPaid: Number,
    buyerDetails: Object,
    selectedDates: [Date],
    ticketType: String,
    otp: String,
    qrCodeHash: String,
    isRedeemed: Boolean,
    createdAt: Date
});
const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);

async function seed() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const userEmail = 'infotech.siii@gmail.com';
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            console.error('User not found:', userEmail);
            process.exit(1);
        }
        console.log('Found User:', user._id);

        const event = await Event.findOne({}); // Get first event
        if (!event) {
            console.error('No event found');
            process.exit(1);
        }
        console.log('Found Event:', event.title);

        // Generate Dates
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        const allDates = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            allDates.push(new Date(d));
        }

        // 1. Create Daily Ticket
        const dailyRef = 'TEST-DAILY-' + Date.now();
        const dailyTicket = new Ticket({
            event: event._id,
            user: user._id,
            bookingReference: dailyRef,
            paymentStatus: 'SUCCESS',
            amountPaid: event.ticketConfig.price || 100,
            buyerDetails: {
                name: 'Test User Daily',
                email: userEmail,
                contact: '9999999999',
                age: 25,
                gender: 'male'
            },
            selectedDates: [allDates[0]], // First day only
            ticketType: 'SINGLE_DAY',
            otp: Math.floor(100000 + Math.random() * 900000).toString(),
            qrCodeHash: crypto.randomBytes(32).toString('hex'),
            isRedeemed: false,
            createdAt: new Date()
        });
        await dailyTicket.save();
        console.log('Created Daily Ticket:', dailyRef);

        // 2. Create Season Pass
        const seasonRef = 'TEST-SEASON-' + Date.now();
        const seasonTicket = new Ticket({
            event: event._id,
            user: user._id,
            bookingReference: seasonRef,
            paymentStatus: 'SUCCESS',
            amountPaid: event.ticketConfig.allDayPrice || 1000,
            buyerDetails: {
                name: 'Test User Season',
                email: userEmail,
                contact: '8888888888',
                age: 30,
                gender: 'female'
            },
            selectedDates: allDates, // All dates
            ticketType: 'MULTI_DAY', // Or whatever logic implies Season Pass
            otp: Math.floor(100000 + Math.random() * 900000).toString(),
            qrCodeHash: crypto.randomBytes(32).toString('hex'),
            isRedeemed: false,
            createdAt: new Date()
        });
        await seasonTicket.save();
        console.log('Created Season Ticket:', seasonRef);

        console.log('Done!');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
