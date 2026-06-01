require('dotenv').config({ path: '.env.local' });
import dbConnect from './src/lib/db';
import Ticket from './src/models/Ticket';
import Event from './src/models/Event';
import { createInvoiceForBooking } from './src/lib/invoice-service';

async function test() {
    await dbConnect();
    const latestTicket = await Ticket.findOne({ paymentStatus: 'SUCCESS' }).sort({ createdAt: -1 });
    if (!latestTicket) {
        console.log('No successful ticket found');
        return;
    }
    console.log('Testing with TXN:', latestTicket.bookingReference);
    
    try {
        const invoice = await createInvoiceForBooking(latestTicket.bookingReference);
        console.log('Invoice generated successfully:', invoice._id);
    } catch (e) {
        console.error('Failed to generate invoice:', e);
    }
    process.exit(0);
}

test();
