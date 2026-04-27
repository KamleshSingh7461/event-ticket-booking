import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/lib/db';
import Ticket from './src/models/Ticket';

async function checkTransactions() {
    await connectDB();
    
    // Get unique successful booking references
    const uniqueTransactions = await Ticket.distinct('bookingReference', { 
        paymentStatus: 'SUCCESS', 
        amountPaid: { $gt: 1.18 } 
    });
    
    console.log(`Unique Successful Transactions (excluding test): ${uniqueTransactions.length}`);

    // Get unique successful booking references including test
    const allUniqueTransactions = await Ticket.distinct('bookingReference', { 
        paymentStatus: 'SUCCESS'
    });
    
    console.log(`Total Unique Successful Transactions (including test): ${allUniqueTransactions.length}`);

    mongoose.connection.close();
}

checkTransactions().catch(console.error);
