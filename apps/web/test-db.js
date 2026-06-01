const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb+srv://kamlesh7461:x3nZJdDk0oE1eYV4@cluster0.nhj9s.mongodb.net/event-ticket-booking');
    
    const EventSchema = new mongoose.Schema({
        title: String,
        ticketConfig: {
            price: Number,
            allDayPrice: Number,
            quantity: Number
        }
    }, { strict: false });
    const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

    // Get the event the user is talking about
    const ev = await Event.findById('6a1dd7697927e6209cfba3c4');
    console.log("Current Event ticketConfig:", ev?.ticketConfig);

    process.exit(0);
}
run();
