import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/lib/db';
import Ticket from './src/models/Ticket';

async function breakdown() {
    await connectDB();
    
    const transactions = await Ticket.aggregate([
        { $match: { paymentStatus: 'SUCCESS', amountPaid: { $gt: 1.18 } } },
        { 
            $group: { 
                _id: '$bookingReference',
                ticketCount: { $sum: 1 }
            } 
        }
    ]);
    
    let totalTickets = 0;
    const ticketCountsPerTransaction: Record<number, number> = {};
    
    transactions.forEach(t => {
        totalTickets += t.ticketCount;
        ticketCountsPerTransaction[t.ticketCount] = (ticketCountsPerTransaction[t.ticketCount] || 0) + 1;
    });

    console.log(`Total Real Transactions: ${transactions.length}`);
    console.log(`Total Tickets: ${totalTickets}`);
    console.log(`Breakdown of tickets per transaction:`);
    console.log(ticketCountsPerTransaction);

    mongoose.connection.close();
}

breakdown().catch(console.error);
