require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const Event = mongoose.model('Event', new mongoose.Schema({}, { strict: false }));
    const event = await Event.findOne().sort({_id: -1}).lean();
    console.log(JSON.stringify(event.ticketConfig, null, 2));
    process.exit(0);
}
run();
