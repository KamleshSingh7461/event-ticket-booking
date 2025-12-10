
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    entryTime: String
}, { strict: false });
const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

async function resetTime() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const event = await Event.findOne({});
        if (event) {
            event.entryTime = '23:59'; // Set to late night so "now" is always before it
            await event.save();
            console.log(`Event "${event.title}" time set to 23:59.`);
            console.log('Scanning now should show: "Entry disallowed before 23:59"');
        } else {
            console.log('No event found');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
resetTime();
