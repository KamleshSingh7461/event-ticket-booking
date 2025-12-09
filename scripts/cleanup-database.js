// Database Cleanup Script (CommonJS)
const mongoose = require('mongoose');

// MongoDB URI - update this with your connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-ticket-booking';

async function cleanupDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        console.log('URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        // Delete all events
        console.log('🗑️  Deleting all events...');
        const eventsResult = await db.collection('events').deleteMany({});
        console.log(`✅ Deleted ${eventsResult.deletedCount} events\n`);

        // Delete all tickets
        console.log('🗑️  Deleting all tickets...');
        const ticketsResult = await db.collection('tickets').deleteMany({});
        console.log(`✅ Deleted ${ticketsResult.deletedCount} tickets\n`);

        // Delete all coordinators
        console.log('🗑️  Deleting all coordinators...');
        const coordinatorsResult = await db.collection('users').deleteMany({
            role: 'COORDINATOR'
        });
        console.log(`✅ Deleted ${coordinatorsResult.deletedCount} coordinators\n`);

        // Delete all venue managers
        console.log('🗑️  Deleting all venue managers...');
        const venueManagersResult = await db.collection('users').deleteMany({
            role: 'VENUE_MANAGER'
        });
        console.log(`✅ Deleted ${venueManagersResult.deletedCount} venue managers\n`);

        // Show remaining users
        console.log('📊 Remaining users in database:');
        const remainingUsers = await db.collection('users').find({}).toArray();
        if (remainingUsers.length === 0) {
            console.log('  (No users remaining)\n');
        } else {
            remainingUsers.forEach(user => {
                console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
            });
            console.log('');
        }

        console.log('✅ Database cleanup completed successfully!\n');
        console.log('📋 Summary:');
        console.log(`  - Events deleted: ${eventsResult.deletedCount}`);
        console.log(`  - Tickets deleted: ${ticketsResult.deletedCount}`);
        console.log(`  - Coordinators deleted: ${coordinatorsResult.deletedCount}`);
        console.log(`  - Venue Managers deleted: ${venueManagersResult.deletedCount}`);
        console.log(`  - Remaining users: ${remainingUsers.length}\n`);

    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run cleanup
cleanupDatabase();
