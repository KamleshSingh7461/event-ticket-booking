import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/lib/db';
import Ticket from './src/models/Ticket';

async function check() {
    await connectDB();
    const tickets = await Ticket.find({ paymentStatus: 'SUCCESS', amountPaid: { $gt: 1.18 } }).select('buyerDetails.name amountPaid selectedDates createdAt').sort({ createdAt: -1 }).limit(3).lean();
    console.log(JSON.stringify(tickets, null, 2));
    mongoose.connection.close();
}
check().catch(console.error);
