import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/lib/db';
import Ticket from './src/models/Ticket';

async function checkDB() {
    await connectDB();
    
    const tickets = await Ticket.find({ paymentStatus: 'SUCCESS' }).lean();
    
    let totalRevenue = 0;
    let testCount = 0;
    let realCount = 0;
    let realRevenue = 0;
    let totalAmountRaw = 0;

    tickets.forEach((t: any) => {
        const amount = t.amountPaid || 0;
        totalAmountRaw += amount;
        
        if (amount <= 1.18) {
            testCount++;
        } else {
            realCount++;
            realRevenue += amount;
        }

        // Simulating dashboard calculation
        if (t.pricing && t.pricing.baseAmount) {
             totalRevenue += t.pricing.totalAmount;
        } else {
             totalRevenue += amount;
        }
    });

    console.log('--- DB Tickets Analysis ---');
    console.log(`Total SUCCESS tickets: ${tickets.length}`);
    console.log(`Total Amount Raw: ${totalAmountRaw.toFixed(2)}`);
    console.log(`Total Revenue (Dashboard Calc): ${totalRevenue.toFixed(2)}`);
    console.log(`Test tickets (<= 1.18): ${testCount}`);
    console.log(`Real tickets (> 1.18): ${realCount}`);
    console.log(`Real Revenue: ${realRevenue.toFixed(2)}`);

    mongoose.connection.close();
}

checkDB().catch(console.error);
