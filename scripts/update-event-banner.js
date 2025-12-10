// Update Telangana Pro Basketball League Event Banner
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-booking';

async function updateEventBanner() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected\n');

        const db = mongoose.connection.db;

        // Update the event banner
        const result = await db.collection('events').updateOne(
            { title: 'Telangana Pro Basketball League' },
            {
                $set: {
                    banner: 'https://res.cloudinary.com/dxgx75kwb/image/upload/v1765386269/Q3_dbzldl.png',
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            console.log('⚠️  No event found with title "Telangana Pro Basketball League"');
            console.log('💡 You may need to create the event first using create-event.js');
        } else if (result.modifiedCount > 0) {
            console.log('✅ Event Banner Updated Successfully!\n');
            console.log('📋 Update Details:');
            console.log('   Event: Telangana Pro Basketball League');
            console.log('   Banner URL: https://res.cloudinary.com/dxgx75kwb/image/upload/v1765386269/Q3_dbzldl.png');
            console.log('\n🎉 The banner is now live on the website!');
        } else {
            console.log('ℹ️  Event already has this banner URL');
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

updateEventBanner();
