require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({}, { strict: false, collection: 'tickets' });
const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

async function migrateTicketPricing() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all tickets without pricing breakdown
        const ticketsWithoutPricing = await Ticket.find({
            $or: [
                { pricing: { $exists: false } },
                { 'pricing.baseAmount': { $exists: false } }
            ]
        });

        console.log(`📋 Found ${ticketsWithoutPricing.length} tickets without pricing breakdown\n`);

        if (ticketsWithoutPricing.length === 0) {
            console.log('✅ All tickets already have pricing breakdown!');
            await mongoose.disconnect();
            return;
        }

        let updated = 0;
        let failed = 0;

        for (const ticket of ticketsWithoutPricing) {
            try {
                const totalAmount = ticket.amountPaid;

                // Reverse calculate base amount from total (assuming 18% GST)
                const baseAmount = totalAmount / 1.18;
                const gstAmount = totalAmount - baseAmount;

                // Update ticket with pricing breakdown
                await Ticket.updateOne(
                    { _id: ticket._id },
                    {
                        $set: {
                            pricing: {
                                baseAmount: Math.round(baseAmount * 100) / 100,
                                gstRate: 0.18,
                                gstAmount: Math.round(gstAmount * 100) / 100,
                                totalAmount: Math.round(totalAmount * 100) / 100,
                                currency: 'INR'
                            }
                        }
                    }
                );

                updated++;

                if (updated % 10 === 0) {
                    console.log(`✅ Updated ${updated} tickets...`);
                }
            } catch (error) {
                console.error(`❌ Failed to update ticket ${ticket._id}:`, error.message);
                failed++;
            }
        }

        console.log(`\n✅ Migration complete!`);
        console.log(`   Updated: ${updated} tickets`);
        console.log(`   Failed: ${failed} tickets`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
}

migrateTicketPricing();
