import dbConnect from './db';
import Invoice from '@/models/Invoice';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event';
import GlobalSettings from '@/models/GlobalSettings';
import { generateInvoicePDF } from './pdf-generator';
export async function createInvoiceForBooking(txnid: string) {
    await dbConnect();

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ bookingReference: txnid });
    if (existingInvoice) return existingInvoice;

    // Fetch tickets and global settings
    const tickets = await Ticket.find({ bookingReference: txnid }).populate('event');
    if (!tickets.length) throw new Error('No tickets found for transaction');

    const globalSettings = await GlobalSettings.findOne({ key: 'billing_config' });
    const firstTicket = tickets[0];
    const event = firstTicket.event as any;
    const user = firstTicket.user;

    // Determine Seller Details (Override global with event-specific if available)
    const seller = {
        companyName: event.taxInfo?.companyName || globalSettings?.billing?.companyName || 'WYLDCARD STATS PRIVATE LIMITED',
        address: event.taxInfo?.address || globalSettings?.billing?.address || 'Ground Floor, Shop No.6/A, Ambica Darshan Society, C.P.Road, Kandivali East, Mumbai, Maharashtra 400101',
        gstin: event.taxInfo?.gstin || globalSettings?.billing?.gstin || '27AAECW1497L1ZQ',
        pan: event.taxInfo?.pan || globalSettings?.billing?.pan || 'AAECW1497L',
        cin: event.taxInfo?.cin || globalSettings?.billing?.cin || '',
        logoUrl: globalSettings?.billing?.logoUrl,
        authorizedSignatory: globalSettings?.billing?.authorizedSignatory
    };

    // Customer Details Snapshot
    const customer = {
        name: firstTicket.buyerDetails.name,
        email: firstTicket.buyerDetails.email,
        phone: firstTicket.buyerDetails.contact,
        address: firstTicket.buyerDetails.address || '',
        state: firstTicket.buyerDetails.state || ''
    };

    // Calculate Totals
    let subtotal = 0;
    let gstTotal = 0;
    let grandTotal = 0;
    
    let totalPlatformFee = 0;
    let totalPlatformFeeGst = 0;

    const items = tickets.map((t: any, index: number) => {
        const itemBase = t.pricing.baseAmount || (t.amountPaid / 1.18);
        const itemGst = t.pricing.gstAmount || (t.amountPaid - itemBase);
        const itemTotal = itemBase + itemGst;
        
        totalPlatformFee += t.pricing.platformFee || 0;
        totalPlatformFeeGst += t.pricing.platformFeeGst || 0;

        subtotal += itemBase;
        gstTotal += itemGst;
        grandTotal += itemTotal;

        return {
            description: `${event.title} - Ticket #${index + 1}`,
            quantity: 1,
            basePrice: itemBase,
            gstAmount: itemGst,
            totalAmount: itemTotal
        };
    });

    if (totalPlatformFee > 0) {
        subtotal += totalPlatformFee;
        gstTotal += totalPlatformFeeGst;
        grandTotal += (totalPlatformFee + totalPlatformFeeGst);

        items.push({
            description: `Platform Convenience Fee`,
            quantity: 1,
            basePrice: totalPlatformFee,
            gstAmount: totalPlatformFeeGst,
            totalAmount: totalPlatformFee + totalPlatformFeeGst
        });
    }

    // Tax Breakdown (Simplified logic: If customer state != seller state, use IGST)
    const sellerState = 'Maharashtra'; // Defaulting to Maharashtra for Wyldcard Stats
    const isSameState = customer.state.toLowerCase() === sellerState.toLowerCase();

    const taxBreakdown = {
        cgst: isSameState ? gstTotal / 2 : 0,
        sgst: isSameState ? gstTotal / 2 : 0,
        igst: isSameState ? 0 : gstTotal,
        gstRate: 18
    };

    try {
        // Generate a unique invoice number
        const invoiceNumber = `INV-${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Save Invoice (No PDF generation needed, we rely on dynamic HTML invoices)
        const invoice = await Invoice.create({
            invoiceNumber: invoiceNumber,
            bookingReference: txnid,
            user: user,
            event: event._id,
            items,
            subtotal,
            gstAmount: gstTotal,
            taxBreakdown,
            totalAmount: grandTotal,
            currency: event.ticketConfig?.currency || 'INR',
            sellerInfo: seller,
            customerInfo: customer,
            paymentMethod: 'PayU',
            payuTransactionId: firstTicket.payuTransactionId,
            status: 'PAID'
        });

        return invoice;
    } catch (e) {
        console.error('Error saving invoice to MongoDB:', e);
        throw e;
    }
}
