import mongoose, { Schema, model, models } from 'mongoose';

const InvoiceSchema = new Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    bookingReference: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },

    // Line Items
    items: [{
        description: String,
        quantity: Number,
        basePrice: Number,
        gstAmount: Number,
        totalAmount: Number
    }],

    // Financial Summary
    subtotal: { type: Number, required: true }, // Total base amount
    gstAmount: { type: Number, required: true }, // Total GST
    totalAmount: { type: Number, required: true }, // Grand total
    currency: { type: String, default: 'INR' },

    // Invoice Metadata
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    status: { type: String, enum: ['PAID', 'PENDING', 'CANCELLED'], default: 'PAID' },

    // Payment Details
    paymentMethod: { type: String }, // PayU, Razorpay, etc.
    payuTransactionId: { type: String },

    // PDF Storage
    pdfUrl: { type: String }, // Cloudinary URL

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Generate invoice number
InvoiceSchema.pre('save', async function () {
    if (!this.invoiceNumber) {
        const count = await mongoose.model('Invoice').countDocuments();
        const year = new Date().getFullYear();
        this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(5, '0')}`;
    }
    this.updatedAt = new Date();
});

const Invoice = models.Invoice || model('Invoice', InvoiceSchema);

export default Invoice;
