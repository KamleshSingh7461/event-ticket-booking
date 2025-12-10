// Create Telangana Pro Basketball League Event
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-booking';

async function createEvent() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected\n');

        const db = mongoose.connection.db;

        // Create the event
        const event = {
            title: 'Telangana Pro Basketball League',
            description: 'Join us for the exciting Telangana Pro Basketball League! Experience thrilling basketball action from December 16-24, 2024.',
            type: 'OFFLINE',
            venue: 'Telangana Basketball Arena',
            banner: 'https://res.cloudinary.com/dxgx75kwb/image/upload/v1765386269/Q3_dbzldl.png', // Cloudinary banner
            startDate: new Date('2024-12-16T09:00:00'),
            endDate: new Date('2024-12-24T21:00:00'),
            ticketConfig: {
                price: 500, // Single day price
                currency: 'INR',
                quantity: 1000, // Total tickets available
                offers: []
            },
            subHeadings: [
                {
                    title: 'Event Highlights',
                    content: '9 days of non-stop basketball action featuring top teams from Telangana'
                },
                {
                    title: 'Ticket Options',
                    content: 'Single Day Ticket (₹500) or All-Day Package for all 9 days (₹3500)'
                }
            ],
            assignedCoordinators: [],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('events').insertOne(event);

        console.log('✅ Event Created Successfully!\n');
        console.log('📋 Event Details:');
        console.log('   ID:', result.insertedId);
        console.log('   Title:', event.title);
        console.log('   Dates: Dec 16-24, 2024');
        console.log('   Venue:', event.venue);
        console.log('   Single Day Price: ₹500');
        console.log('   Total Tickets:', event.ticketConfig.quantity);
        console.log('\n🎨 Next Step: Add banner image URL to the event');
        console.log('   Event ID:', result.insertedId);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

createEvent();
