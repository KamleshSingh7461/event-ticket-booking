import mongoose, { Schema, model, models } from 'mongoose';

const EventSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['ONLINE', 'OFFLINE'], required: true },
    venue: { type: String }, // For offline
    venueManager: { type: Schema.Types.ObjectId, ref: 'User' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    ticketConfig: {
        price: { type: Number, required: true },
        currency: { type: String, default: 'INR' },
        quantity: { type: Number }, // Total tickets available
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
    banner: { type: String }, // Event banner image URL
    assignedCoordinators: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Super Admin who created
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Event = models.Event || model('Event', EventSchema);

export default Event;
