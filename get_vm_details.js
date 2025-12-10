
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Quick Schema definitions to avoid importing full Next.js models which might have edge/server-only deps
const UserSchema = new Schema({
    name: String,
    email: String,
    role: String
}, { strict: false });

const EventSchema = new Schema({
    title: String,
    venueManager: { type: Schema.Types.ObjectId, ref: 'User' }
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

require('dotenv').config({ path: '.env.local' });

async function getVM() {
    try {
        if (!process.env.MONGODB_URI) {
            console.log('No MONGODB_URI found in .env.local');
            return;
        }
        await mongoose.connect(process.env.MONGODB_URI);

        const eventTitle = "TELANGANA PRO BASKETBALL LEAGUE";
        const event = await Event.findOne({ title: { $regex: new RegExp(eventTitle, 'i') } });

        if (!event) {
            console.log(`Event "${eventTitle}" not found.`);
            return;
        }

        if (!event.venueManager) {
            console.log('No Venue Manager ID assigned to this event.');
            return;
        }

        const vm = await User.findById(event.venueManager);
        if (!vm) {
            console.log(`Venue Manager user found (ID: ${event.venueManager}) but document missing.`);
        } else {
            console.log('--- VENUE MANAGER DETAILS ---');
            console.log(`Name: ${vm.name}`);
            console.log(`Email: ${vm.email}`);
            console.log(`Role: ${vm.role}`);
            console.log(`ID: ${vm._id}`);
            console.log('-----------------------------');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

getVM();
