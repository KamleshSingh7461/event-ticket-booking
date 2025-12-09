import mongoose, { Schema, model, models } from 'mongoose';

const TicketSchema = new Schema({
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingReference: { type: String, required: true, unique: true }, // From PayU txnid or generated
    paymentStatus: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
    payuTransactionId: { type: String },
    amountPaid: { type: Number, required: true },

    // Buyer Details (Snapshot at booking)
    buyerDetails: {
        name: String,
        email: String,
        age: Number,
        gender: String,
        contact: String
    },

    // Ticket Type for Dec 16-24 event
    ticketType: {
        type: String,
        enum: ['SINGLE_DAY', 'ALL_DAY_PACKAGE'],
        default: 'SINGLE_DAY'
    },
    selectedDate: { type: Date }, // For single day tickets (Dec 16-24)

    // OTP Verification
    otp: { type: String, required: true }, // 6-digit OTP
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },

    qrCodeHash: { type: String, required: true, unique: true }, // For One-Time Verification
    isRedeemed: { type: Boolean, default: false },
    redeemedAt: { type: Date },
    redeemedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Coordinator

    createdAt: { type: Date, default: Date.now },
});

const Ticket = models.Ticket || model('Ticket', TicketSchema);

export default Ticket;
