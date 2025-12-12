const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI not found in .env.local');
    process.exit(1);
}

async function fixIndexes() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const collection = mongoose.connection.collection('tickets');

        // List indexes before
        const indexesBefore = await collection.indexes();
        console.log('Indexes BEFORE:', JSON.stringify(indexesBefore, null, 2));

        // Drop unique index on bookingReference if exists
        try {
            const indexName = 'bookingReference_1';
            const indexExists = indexesBefore.some(idx => idx.name === indexName);

            if (indexExists) {
                await collection.dropIndex(indexName);
                console.log(`✅ Successfully dropped index: ${indexName}`);
            } else {
                console.log(`ℹ️ Index ${indexName} not found. checking for other unique indexes on bookingReference...`);
                // Check if there is any other index on bookingReference that is unique
                const otherIndex = indexesBefore.find(idx => idx.key.bookingReference === 1 && idx.unique);
                if (otherIndex) {
                    await collection.dropIndex(otherIndex.name);
                    console.log(`✅ Successfully dropped index: ${otherIndex.name}`);
                } else {
                    console.log('No unique index found on bookingReference.');
                }
            }
        } catch (e) {
            console.error('Error dropping index:', e.message);
        }

        // List indexes after
        const indexesAfter = await collection.indexes();
        console.log('Indexes AFTER:', JSON.stringify(indexesAfter, null, 2));

    } catch (error) {
        console.error('Fatal Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

fixIndexes();
