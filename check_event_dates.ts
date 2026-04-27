import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
import connectDB from './src/lib/db';
import Event from './src/models/Event';

async function checkEventDates() {
    await connectDB();
    
    const events = await Event.find().lean();
    
    events.forEach((e: any) => {
        console.log(`Event: ${e.title}`);
        console.log(`Start: ${e.startDate}`);
        console.log(`End: ${e.endDate}`);
    });

    mongoose.connection.close();
}

checkEventDates().catch(console.error);
