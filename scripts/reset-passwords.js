
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const DB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'event-booking';

async function resetPasswords() {
    const client = new MongoClient(DB_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const usersColl = db.collection('users');

        const managerEmail = 'ballislifesports3@gmail.com';
        const userEmail = 'dineshdurant7@gmail.com';

        const managerHash = await bcrypt.hash('Manager@123', 10);
        const userHash = await bcrypt.hash('User@123', 10);

        await usersColl.updateOne({ email: managerEmail }, { $set: { password: managerHash } });
        await usersColl.updateOne({ email: userEmail }, { $set: { password: userHash } });

        console.log(`Updated password for ${managerEmail} to Manager@123`);
        console.log(`Updated password for ${userEmail} to User@123`);
    } finally {
        await client.close();
    }
}

resetPasswords().catch(console.error);
