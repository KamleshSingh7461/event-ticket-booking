const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const DB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'event-booking';

async function run() {
    const client = new MongoClient(DB_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const usersColl = db.collection('users');

        const email = 'admin@wildcardstat.com';
        const password = 'Admin@123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await usersColl.updateOne(
            { email },
            { $set: { password: hashedPassword, updatedAt: new Date() } }
        );

        if (result.matchedCount > 0) {
            console.log(`Successfully updated password for ${email}`);
        } else {
            console.log(`User ${email} not found.`);
        }

    } finally {
        await client.close();
    }
}

run().catch(console.error);
