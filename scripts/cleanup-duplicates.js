
const mongoose = require('mongoose');
const Ticket = require('../src/models/Ticket');
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/event-booking');
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const cleanup = async () => {
    await connectDB();
    const eventId = '693951bc67f7f49cb5cb83eb'; // TPBL

    console.log('Finding duplicates for event:', eventId);

    const tickets = await Ticket.find({ event: eventId, paymentStatus: 'SUCCESS' }).sort({ createdAt: 1 });
    console.log('Total tickets found:', tickets.length);

    const seenTxns = new Map();
    const toDelete = [];

    for (const ticket of tickets) {
        const txnId = ticket.payuTransactionId;
        const user = ticket.user.toString();
        const ref = ticket.bookingReference;

        // Key by Transaction ID + User (Assuming one payment per user is normal, but shared txn for different users is suspicious)
        // Actually, looking at the data, multiple users sharing the same PayU Transaction ID is definitely a restoration error.
        // Let's key by PayU Transaction ID.
        
        if (seenTxns.has(txnId)) {
            const original = seenTxns.get(txnId);
            console.log(`Duplicate found for Txn: ${txnId}`);
            console.log(`  Original: ${original.bookingReference} (User: ${original.user})`);
            console.log(`  Duplicate: ${ref} (User: ${user})`);
            toDelete.push(ticket._id);
        } else {
            seenTxns.set(txnId, ticket);
        }
    }

    if (toDelete.length > 0) {
        console.log(`Found ${toDelete.length} duplicates to delete.`);
        const result = await Ticket.deleteMany({ _id: { $in: toDelete } });
        console.log(`Successfully deleted ${result.deletedCount} tickets.`);
    } else {
        console.log('No duplicates found based on Transaction ID.');
    }

    process.exit(0);
};

cleanup();
