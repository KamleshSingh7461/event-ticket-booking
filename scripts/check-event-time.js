
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({}, { strict: false });
const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const event = await Event.findOne({});
        console.log('Event Title:', event.title);
        console.log('Start Date:', event.startDate);
        console.log('End Date:', event.endDate);
        console.log('Entry Time:', event.entryTime);
        console.log('Current Time:', new Date());
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
