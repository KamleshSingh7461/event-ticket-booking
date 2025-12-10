const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const eventSchema = new mongoose.Schema({
    title: String,
    banner: String,
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

async function checkEvents() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        const events = await Event.find({});
        console.log(`Found ${events.length} events`);
        events.forEach(e => {
            console.log(`ID: ${e._id}`);
            console.log(`Title: ${e.title}`);
            console.log(`Banner: ${e.banner}`);
            console.log('---');
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

checkEvents();
