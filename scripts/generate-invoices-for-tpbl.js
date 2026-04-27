const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-booking';
const DB_NAME = 'event-booking';

async function run() {
    const client = new MongoClient(DB_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const ticketsColl = db.collection('tickets');
        const invoicesColl = db.collection('invoices');

        console.log('--- Generating Invoices for Successful Tickets ---');

        // Find all unique bookingReferences that have successful tickets
        const successfulTxns = await ticketsColl.distinct('bookingReference', { paymentStatus: 'SUCCESS' });
        
        console.log(`Found ${successfulTxns.length} unique successful transactions.`);

        let createdCount = 0;

        for (const txnid of successfulTxns) {
            // Check if invoice already exists
            const existing = await invoicesColl.findOne({ bookingReference: txnid });
            if (existing) {
                console.log(`Invoice for ${txnid} already exists. Skipping.`);
                continue;
            }

            // Get all tickets for this transaction
            const tickets = await ticketsColl.find({ bookingReference: txnid }).toArray();
            if (!tickets.length) continue;

            const firstTicket = tickets[0];
            
            // Calculate totals
            let subtotal = 0;
            let gstTotal = 0;
            let grandTotal = 0;

            const items = tickets.map((t, index) => {
                const itemBase = (t.pricing && t.pricing.baseAmount) ? t.pricing.baseAmount : (t.amountPaid / 1.18);
                const itemTotal = (t.pricing && t.pricing.totalAmount) ? t.pricing.totalAmount : t.amountPaid;
                const itemGst = itemTotal - itemBase;

                subtotal += itemBase;
                gstTotal += itemGst;
                grandTotal += itemTotal;

                return {
                    description: `Event Ticket #${index + 1} (${t.ticketType})`,
                    quantity: 1,
                    basePrice: itemBase,
                    gstAmount: itemGst,
                    totalAmount: itemTotal
                };
            });

            // Generate invoice number
            const count = await invoicesColl.countDocuments();
            const year = new Date().getFullYear();
            const invoiceNumber = `INV-${year}-${String(count + 1).padStart(5, '0')}`;

            const invoice = {
                invoiceNumber,
                bookingReference: txnid,
                user: firstTicket.user,
                event: firstTicket.event,
                items,
                subtotal,
                gstAmount: gstTotal,
                totalAmount: grandTotal,
                currency: 'INR',
                invoiceDate: firstTicket.createdAt || new Date(),
                status: 'PAID',
                paymentMethod: 'PayU',
                payuTransactionId: firstTicket.payuTransactionId,
                pdfUrl: '', // Manual backfill - no PDF generated in this script
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await invoicesColl.insertOne(invoice);
            createdCount++;
        }

        console.log(`Successfully generated ${createdCount} invoices.`);

    } finally {
        await client.close();
    }
}

run().catch(console.error);
