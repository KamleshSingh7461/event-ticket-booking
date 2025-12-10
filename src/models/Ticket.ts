import mongoose, { Schema, model, models } from 'mongoose';

const TicketSchema = new Schema({
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingReference: { type: String, required: true }, // From PayU txnid or generated - Shared across tickets in same order
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

    // Ticket Validity
    selectedDates: [{ type: Date }], //  Array of specific dates this ticket is valid for

    // Check-in History (Multiple entries potential)
    checkIns: [{
        date: { type: Date }, // The scheduled date they are checking in for
        scannedAt: { type: Date, default: Date.now },
        scannedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    }],

    // Deprecated / Legacy Support
    ticketType: { type: String, enum: ['SINGLE_DAY', 'MULTI_DAY'], default: 'SINGLE_DAY' },

    otp: { type: String, required: true },
    qrCodeHash: { type: String, required: true, unique: true },

    // Status
    isRedeemed: { type: Boolean, default: false }, // True if ALL selected dates have been used? Or just if it's "fully used"


    createdAt: { type: Date, default: Date.now },
});

const Ticket = models.Ticket || model('Ticket', TicketSchema);

export default Ticket;
