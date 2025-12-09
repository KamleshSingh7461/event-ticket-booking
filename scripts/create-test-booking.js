// Script to create a test booking
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define Schemas locally to avoid import issues
const ticketSchema = new mongoose.Schema({
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookingReference: { type: String, unique: true },
    ticketType: { type: String, enum: ['SINGLE_DAY', 'ALL_DAY_PACKAGE'], default: 'SINGLE_DAY' },
    selectedDate: { type: Date },
    amountPaid: { type: Number, required: true },
    status: { type: String, default: 'CONFIRMED' },
    paymentStatus: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
    paymentId: { type: String },
    customerDetails: {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
        age: { type: Number }
    },
    buyerDetails: {
        name: { type: String },
        email: { type: String },
        phone: { type: String }
    },
    otp: { type: String },
    qrCodeHash: { type: String },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }
});

const eventSchema = new mongoose.Schema({
    title: { type: String }
});

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

async function createTestBooking() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected');

        // Find User
        const user = await User.findOne({ email: 'user@test.com' });
        if (!user) throw new Error('User user@test.com not found');

        // Find Event
        const event = await Event.findOne({ title: /Telangana Pro Basketball/ });
        if (!event) throw new Error('Event not found');

        // Create Ticket
        const otp = '123456';
        const bookingRef = `BK${Date.now()}`;

        // QR Code Hash (Simulated)
        const qrHash = `${bookingRef}-${otp}`;

        const ticket = await Ticket.create({
            event: event._id,
            user: user._id,
            bookingReference: bookingRef,
            ticketType: 'SINGLE_DAY',
            selectedDate: new Date('2024-12-16'),
            amountPaid: 500,
            status: 'CONFIRMED',
            paymentStatus: 'SUCCESS',
            paymentId: `PAY-${Date.now()}`,
            customerDetails: {
                name: 'Kamlesh',
                email: 'user@test.com',
                phone: '9876543210',
                age: 30
            },
            buyerDetails: {
                name: 'Test User',
                email: 'user@test.com',
                phone: '9876543210'
            },
            otp: otp,
            qrCodeHash: qrHash,
            verified: false
        });

        console.log('✅ Ticket created successfully!');
        console.log('Ref:', ticket.bookingReference);
        console.log('OTP:', ticket.otp);
        console.log('ID:', ticket._id);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

createTestBooking();
