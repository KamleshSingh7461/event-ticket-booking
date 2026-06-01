const mongoose = require('mongoose');
const { createInvoiceForBooking } = require('./apps/web/src/lib/invoice-service');
require('dotenv').config({ path: './apps/web/.env' });
require('dotenv').config({ path: './apps/web/.env.local' });

async function backfillInvoices() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        
        // Find all unique booking references from Tickets that are PAID/PENDING
        const Ticket = require('./apps/web/src/models/Ticket').default;
        const Invoice = require('./apps/web/src/models/Invoice').default;
        
        const tickets = await Ticket.find({ 
            paymentStatus: { $in: ['SUCCESS', 'PENDING'] }
        });
        
        const uniqueTxns = [...new Set(tickets.map(t => t.bookingReference))];
        console.log(`Found ${uniqueTxns.length} total unique bookings.`);
        
        let generated = 0;
        let skipped = 0;
        
        for (const txnid of uniqueTxns) {
            if (!txnid) continue;
            
            // Check if invoice exists
            const existing = await Invoice.findOne({ bookingReference: txnid });
            if (existing) {
                skipped++;
                continue;
            }
            
            console.log(`Generating missing invoice for booking: ${txnid}`);
            try {
                await createInvoiceForBooking(txnid);
                generated++;
            } catch (err) {
                console.error(`Failed to generate for ${txnid}: ${err.message}`);
            }
        }
        
        console.log(`Done! Generated: ${generated}, Skipped (already existed): ${skipped}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

backfillInvoices();
