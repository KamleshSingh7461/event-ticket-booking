import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'VENUE_MANAGER', 'COORDINATOR', 'USER'],
        default: 'USER'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional - only set for coordinators created by venue managers
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpires: { type: Date, required: false },
});

const User = models.User || model('User', UserSchema);

export default User;
