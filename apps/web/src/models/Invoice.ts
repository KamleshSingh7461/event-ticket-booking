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
    taxBreakdown: {
        cgst: { type: Number, default: 0 },
        sgst: { type: Number, default: 0 },
        igst: { type: Number, default: 0 },
        gstRate: { type: Number, default: 18 }
    },
    totalAmount: { type: Number, required: true }, // Grand total
    currency: { type: String, default: 'INR' },

    // Snapshots (For audit persistence)
    sellerInfo: {
        companyName: String,
        address: String,
        gstin: String,
        pan: String,
        cin: String
    },
    customerInfo: {
        name: String,
        email: String,
        phone: String,
        address: String,
        state: String
    },

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
InvoiceSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        const count = await mongoose.model('Invoice').countDocuments();
        const year = new Date().getFullYear();
        this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(5, '0')}`;
    }
    this.updatedAt = new Date();
    next();
});

// Prevent Deletion
InvoiceSchema.pre(['deleteOne', 'deleteMany', 'findOneAndDelete'], function (next) {
    next(new Error('Invoices cannot be deleted for audit and compliance purposes.'));
});


InvoiceSchema.pre('save', function (next) {
    if (this.isNew) return next();
    // Prevent manual status changes to CANCELLED/PENDING if already PAID
    if (this.isModified('status') && this.status !== 'PAID' && this._originalStatus === 'PAID') {
        return next(new Error('PAID invoices cannot be modified.'));
    }
    next();
});

const Invoice = models.Invoice || model('Invoice', InvoiceSchema);

export default Invoice;
