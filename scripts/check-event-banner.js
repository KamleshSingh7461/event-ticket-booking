// Check if event banner was updated
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-booking';

async function checkEventBanner() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected\n');

        const db = mongoose.connection.db;

        // Find the event by ID or title
        const eventById = await db.collection('events').findOne(
            { _id: new mongoose.Types.ObjectId('693951bc67f7f49cb5cb83eb') }
        );

        const eventByTitle = await db.collection('events').findOne(
            { title: 'Telangana Pro Basketball League' }
        );

        console.log('📋 Event by ID (693951bc67f7f49cb5cb83eb):');
        if (eventById) {
            console.log('   Title:', eventById.title);
            console.log('   Banner:', eventById.banner || '(empty)');
        } else {
            console.log('   ❌ Not found');
        }

        console.log('\n📋 Event by Title (Telangana Pro Basketball League):');
        if (eventByTitle) {
            console.log('   ID:', eventByTitle._id.toString());
            console.log('   Title:', eventByTitle.title);
            console.log('   Banner:', eventByTitle.banner || '(empty)');
        } else {
            console.log('   ❌ Not found');
        }

        // List all events
        console.log('\n📋 All Events in Database:');
        const allEvents = await db.collection('events').find({}).toArray();
        allEvents.forEach((event, idx) => {
            console.log(`\n   ${idx + 1}. ${event.title}`);
            console.log(`      ID: ${event._id.toString()}`);
            console.log(`      Banner: ${event.banner || '(empty)'}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

checkEventBanner();
