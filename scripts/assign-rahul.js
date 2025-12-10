require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const eventSchema = new mongoose.Schema({}, { strict: false, collection: 'events' });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

async function assignRahul() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find Rahul
        const rahul = await User.findOne({ name: /Rahul/i, role: 'COORDINATOR' });
        if (!rahul) {
            console.error('❌ Rahul not found!');
            process.exit(1);
        }
        console.log('👤 Coordinator:', rahul.name, '| Email:', rahul.email, '| ID:', rahul._id);

        // Find the first event
        const event = await Event.findOne({});
        if (!event) {
            console.error('❌ No events found!');
            process.exit(1);
        }
        console.log('🎪 Event:', event.name, '| ID:', event._id);

        // Assign Rahul to the event
        if (!event.assignedCoordinators) {
            event.assignedCoordinators = [];
        }

        // Check if already assigned
        const alreadyAssigned = event.assignedCoordinators.some(
            id => id.toString() === rahul._id.toString()
        );

        if (!alreadyAssigned) {
            event.assignedCoordinators.push(rahul._id);
            await event.save();
            console.log('\n✅ Rahul assigned to event!');
        } else {
            console.log('\n✅ Rahul already assigned!');
        }

        console.log('📋 Assigned Coordinators:', event.assignedCoordinators);

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

assignRahul();
