// Update specific event banner by ID
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-booking';
const EVENT_ID = '693951bc67f7f49cb5cb83eb';
const BANNER_URL = 'https://res.cloudinary.com/dxgx75kwb/image/upload/v1765386269/Q3_dbzldl.png';

async function updateEventBannerById() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected\n');

        const db = mongoose.connection.db;

        // Update the event banner by ID
        const result = await db.collection('events').updateOne(
            { _id: new ObjectId(EVENT_ID) },
            {
                $set: {
                    banner: BANNER_URL,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            console.log(`⚠️  No event found with ID: ${EVENT_ID}`);
        } else if (result.modifiedCount > 0) {
            console.log('✅ Event Banner Updated Successfully!\n');
            console.log('📋 Update Details:');
            console.log(`   Event ID: ${EVENT_ID}`);
            console.log(`   Banner URL: ${BANNER_URL}`);
            console.log('\n🎉 The banner is now live!');
            console.log('\n💡 Next Steps:');
            console.log('   1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)');
            console.log('   2. Or clear Next.js cache by deleting .next folder and restarting dev server');
        } else {
            console.log('ℹ️  Event already has this banner URL');
            console.log('\n💡 If banner not showing, try:');
            console.log('   1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)');
            console.log('   2. Clear Next.js cache: delete .next folder and restart dev server');
        }

        // Verify the update
        const updatedEvent = await db.collection('events').findOne(
            { _id: new ObjectId(EVENT_ID) }
        );

        if (updatedEvent) {
            console.log('\n✅ Verification:');
            console.log('   Title:', updatedEvent.title);
            console.log('   Banner:', updatedEvent.banner);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

updateEventBannerById();
