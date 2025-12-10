
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Schemas
const TicketSchema = new mongoose.Schema({
    selectedDates: [Date],
    checkIns: [Object],
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }
}, { strict: false });
const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);

const EventSchema = new mongoose.Schema({
    entryTime: String,
    startDate: Date,
    endDate: Date
}, { strict: false });
const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

async function enableAccess() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Update Event to allow entry ANY time
        const event = await Event.findOne({});
        if (event) {
            console.log(`Updating Event "${event.title}"...`);
            console.log(`  - Old Entry Time: ${event.entryTime}`);
            event.entryTime = '00:00';
            console.log(`  - New Entry Time: 00:00`);

            // Allow event to be "Active" today (optional, but good for consistency)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (new Date(event.startDate) > today) {
                event.startDate = today;
                console.log('  - Updated Start Date to Today');
            }
            await event.save();
        }

        // 2. Update ALL Tickets to include TODAY as a valid date
        const tickets = await Ticket.find({});
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Midnight representation

        console.log(`Updating ${tickets.length} tickets to be valid today...`);
        for (const t of tickets) {
            // Check if today is already in selectedDates
            const hasToday = t.selectedDates.some(d => new Date(d).toDateString() === today.toDateString());
            if (!hasToday) {
                t.selectedDates.push(today);
                // Also clear check-ins for today to allow re-testing
                t.checkIns = t.checkIns.filter(c => new Date(c.date).toDateString() !== today.toDateString());
                await t.save();
            }
        }
        console.log('Tickets updated!');

        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

enableAccess();
