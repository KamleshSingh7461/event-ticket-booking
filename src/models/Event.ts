import mongoose, { Schema, model, models } from 'mongoose';

const EventSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['ONLINE', 'OFFLINE'], required: true },
    venue: { type: String }, // For offline
    venueManager: { type: Schema.Types.ObjectId, ref: 'User' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    entryTime: { type: String }, // Format "HH:mm" e.g. "18:00"
    ticketConfig: {
        price: { type: Number, required: true },
        allDayPrice: { type: Number }, // Price for full event access
        currency: { type: String, default: 'INR' },
        quantity: { type: Number }, // Daily Capacity (Max tickets allowed per individual date)
        dateSpecificCapacities: { // Override for specific dates
            type: Map,
            of: Number,
            default: {}
        },
        offers: [{
            code: String,
            discountPercentage: Number,
            description: String
        }]
    },
    subHeadings: [{
        title: String,
        content: String
    }],
    banner: { type: String }, // Desktop banner image URL
    mobileBanner: { type: String }, // Mobile banner image URL
    gallery: [{ type: String }], // Array of image URLs for slider
    schedule: [{ type: String }], // Array of URLs for schedule graphics
    assignedCoordinators: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Super Admin who created
    isActive: { type: Boolean, default: true },
    isSoldOut: { type: Boolean, default: false }, // Manual Sold Out override
    bookingCutOffTime: { type: String }, // Format "HH:mm" e.g. "18:00" - Stop bookings after this time daily
    
    // Daily Configuration Overrides (NEW)
    dailyConfig: [{
        date: { type: Date, required: true },
        startTime: { type: String }, // e.g. "18:00"
        cutoffTime: { type: String }, // e.g. "19:00"
        isSoldOut: { type: Boolean, default: false },
        capacity: { type: Number }, // Optional override for this specific day
        price: { type: Number } // Optional override for price on this day
    }],

    // Tax & Billing Overrides (Optional)
    taxInfo: {
        companyName: String,
        address: String,
        gstin: String,
        pan: String,
        cin: String,
        hsnCode: { type: String, default: '998599' }
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Event = models.Event || model('Event', EventSchema);

export default Event;
