const mongoose = require('mongoose');

async function check() {
    const MONGODB_URI = "mongodb+srv://admin_db_user:DBUwCkcrOTq5G2BG@cluster0.k7nbkgk.mongodb.net/event-booking?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to live DB");
    const Ticket = require('./apps/web/src/models/Ticket').default;
    const ticket = await Ticket.findOne().sort({ createdAt: -1 }).populate('event');
    console.log("Latest ticket price details:", ticket.pricing);
    console.log("Amount Paid:", ticket.amountPaid);
    console.log("Status:", ticket.paymentStatus);
    console.log("Event Title:", ticket.event.title);
    process.exit(0);
}
check();
