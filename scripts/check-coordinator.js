require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const eventSchema = new mongoose.Schema({}, { strict: false, collection: 'events' });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

async function checkCoordinator() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find coordinator
        const coordinator = await User.findOne({ email: 'kamlesh@eusaiteam.com' });
        console.log('👤 Coordinator:', coordinator?.name, '| ID:', coordinator?._id);

        // Find event
        const event = await Event.findOne({ name: /TELANGANA PRO BASKETBALL/i });
        console.log('\n🎪 Event:', event?.name, '| ID:', event?._id);
        console.log('📋 Assigned Coordinators:', event?.assignedCoordinators);

        // Check if coordinator is assigned
        if (event && coordinator) {
            const isAssigned = event.assignedCoordinators?.some(
                id => id.toString() === coordinator._id.toString()
            );
            console.log('\n✅ Is coordinator assigned?', isAssigned);

            if (!isAssigned) {
                console.log('\n⚠️ Coordinator NOT assigned! Adding now...');
                event.assignedCoordinators = event.assignedCoordinators || [];
                event.assignedCoordinators.push(coordinator._id);
                await event.save();
                console.log('✅ Coordinator added to event!');
            }
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkCoordinator();
