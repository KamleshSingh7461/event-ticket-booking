// Delete all events with local banner paths
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-booking';

async function cleanupEvents() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected\n');

        const db = mongoose.connection.db;

        // Find all events
        const allEvents = await db.collection('events').find({}).toArray();

        console.log(`📋 All Events in Database:\n`);
        allEvents.forEach((event, idx) => {
            console.log(`${idx + 1}. ${event.title}`);
            console.log(`   ID: ${event._id}`);
            console.log(`   Banner: ${event.banner || '(empty)'}`);
            console.log(`   Type: ${event.type}`);
            console.log('');
        });

        // Delete events with local file paths
        const result = await db.collection('events').deleteMany({
            banner: { $regex: /^\/uploads\// }
        });

        console.log(`\n🗑️  Deleted ${result.deletedCount} event(s) with local file paths`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

cleanupEvents();
