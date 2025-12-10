require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const eventSchema = new mongoose.Schema({}, { strict: false, collection: 'events' });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

async function assignCoordinator() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find coordinator
        const coordinator = await User.findOne({ email: 'kamlesh@eusaiteam.com' });
        if (!coordinator) {
            console.error('❌ Coordinator not found!');
            process.exit(1);
        }
        console.log('👤 Coordinator:', coordinator.name, '| ID:', coordinator._id);

        // Find ALL events to see names
        const events = await Event.find({}).select('name');
        console.log('\n📋 All Events:');
        events.forEach(e => console.log('  -', e.name));

        // Find the first event (assuming it's the one)
        const event = events[0];
        if (!event) {
            console.error('❌ No events found!');
            process.exit(1);
        }

        const fullEvent = await Event.findById(event._id);
        console.log('\n🎪 Using Event:', fullEvent.name, '| ID:', fullEvent._id);

        // Assign coordinator
        fullEvent.assignedCoordinators = [coordinator._id];
        await fullEvent.save();

        console.log('\n✅ Coordinator assigned successfully!');
        console.log('📋 Assigned Coordinators:', fullEvent.assignedCoordinators);

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

assignCoordinator();
