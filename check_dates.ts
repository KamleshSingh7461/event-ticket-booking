import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/lib/db';
import Ticket from './src/models/Ticket';

async function checkTicketDates() {
    await connectDB();
    
    const tickets = await Ticket.find({ paymentStatus: 'SUCCESS', amountPaid: { $gt: 1.18 } }).select('selectedDates amountPaid').lean();
    
    const dateCounts: Record<string, number> = {};
    
    tickets.forEach((t: any) => {
        if (t.selectedDates && t.selectedDates.length > 0) {
            t.selectedDates.forEach((dateStr: string) => {
                const dateObj = new Date(dateStr);
                const d = dateObj.toISOString().split('T')[0];
                dateCounts[d] = (dateCounts[d] || 0) + 1;
            });
        } else {
            dateCounts['NO_DATES'] = (dateCounts['NO_DATES'] || 0) + 1;
        }
    });

    console.log('--- Ticket Dates Breakdown ---');
    console.log(dateCounts);

    mongoose.connection.close();
}

checkTicketDates().catch(console.error);
