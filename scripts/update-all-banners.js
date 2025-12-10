// Update all events with local banner paths to use Cloudinary URL
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-booking';
const CLOUDINARY_BANNER_URL = 'https://res.cloudinary.com/dxgx75kwb/image/upload/v1765386269/Q3_dbzldl.png';

async function updateAllEventBanners() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected\n');

        const db = mongoose.connection.db;

        // Find all events
        const allEvents = await db.collection('events').find({}).toArray();

        console.log(`📋 Found ${allEvents.length} events\n`);

        let updatedCount = 0;

        for (const event of allEvents) {
            // Check if banner is a local file path (contains /uploads/ or is a filename)
            const hasLocalBanner = event.banner && (
                event.banner.includes('/uploads/') ||
                event.banner.includes('.jpg') ||
                event.banner.includes('.png')
            ) && !event.banner.startsWith('http');

            if (hasLocalBanner || !event.banner) {
                const result = await db.collection('events').updateOne(
                    { _id: event._id },
                    {
                        $set: {
                            banner: CLOUDINARY_BANNER_URL,
                            updatedAt: new Date()
                        }
                    }
                );

                if (result.modifiedCount > 0) {
                    console.log(`✅ Updated: ${event.title}`);
                    console.log(`   Old banner: ${event.banner || '(empty)'}`);
                    console.log(`   New banner: ${CLOUDINARY_BANNER_URL}\n`);
                    updatedCount++;
                }
            } else {
                console.log(`⏭️  Skipped: ${event.title} (already has valid URL)`);
            }
        }

        console.log(`\n🎉 Updated ${updatedCount} event(s) with Cloudinary banner URL!`);
        console.log('\n💡 Next Steps:');
        console.log('   1. Hard refresh your browser (Ctrl+Shift+R)');
        console.log('   2. The banners should now display correctly');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

updateAllEventBanners();
