const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI not found in .env.local');
    process.exit(1);
}

// Define minimal schemas
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

const EventSchema = new mongoose.Schema({
    title: String,
    startDate: Date,
});
const Event = mongoose.model('Event', EventSchema);

const TicketSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookingReference: { type: String, required: true },
    paymentStatus: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
    payuTransactionId: String,
    amountPaid: Number,
    pricing: {
        baseAmount: Number,
        gstAmount: Number,
        totalAmount: Number,
        currency: { type: String, default: 'INR' }
    },
    buyerDetails: {
        name: String,
        email: String,
        age: Number,
        gender: String,
        contact: String
    },
    selectedDates: [Date],
    ticketType: { type: String, default: 'SINGLE_DAY' },
    otp: { type: String, required: true },
    qrCodeHash: { type: String, required: true, unique: true },
    isRedeemed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});
const Ticket = mongoose.model('Ticket', TicketSchema);

async function generateTicket() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const userEmail = 'kamlesh7461@gmail.com';
        const eventTitlePartial = 'TELANGANA PRO BASKETBALL LEAGUE';

        // 1. Find User
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            console.error(`User not found: ${userEmail}`);
            process.exit(1);
        }
        console.log(`Found User: ${user.name} (${user._id})`);

        // 2. Find Event
        const event = await Event.findOne({ title: { $regex: new RegExp(eventTitlePartial, 'i') } });
        if (!event) {
            console.error(`Event not found: ${eventTitlePartial}`);
            process.exit(1);
        }
        console.log(`Found Event: ${event.title} (${event._id})`);

        // 3. Create Ticket
        const ticketData = {
            event: event._id,
            user: user._id,
            bookingReference: `TEST-GEN-${Date.now()}`,
            paymentStatus: 'SUCCESS',
            amountPaid: 0,
            pricing: {
                baseAmount: 0,
                gstRate: 0.18,
                gstAmount: 0,
                totalAmount: 0,
                currency: 'INR'
            },
            buyerDetails: {
                name: user.name,
                email: user.email,
                age: 25,
                gender: 'MALE',
                contact: '0000000000'
            },
            selectedDates: [event.startDate],
            ticketType: 'SINGLE_DAY',
            otp: Math.floor(100000 + Math.random() * 900000).toString(),
            qrCodeHash: crypto.randomBytes(32).toString('hex'),
            isRedeemed: false
        };

        const ticket = await Ticket.create(ticketData);
        console.log('------------------------------------------------');
        console.log('✅ TICKET CREATED SUCCESSFULLY');
        console.log(`Ticket ID: ${ticket._id}`);
        console.log(`Booking Ref: ${ticket.bookingReference}`);
        console.log(`QR Hash: ${ticket.qrCodeHash}`);
        console.log(`User: ${user.email}`);
        console.log(`Event: ${event.title}`);
        console.log('------------------------------------------------');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

generateTicket();
