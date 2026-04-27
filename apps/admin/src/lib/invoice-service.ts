import dbConnect from './db';
import Invoice from '@/models/Invoice';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event';
import GlobalSettings from '@/models/GlobalSettings';
import { generateInvoicePDF } from './pdf-generator';
import { uploadToCloudinary } from './cloudinary-upload';

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
        companyName: event.taxInfo?.companyName || globalSettings?.billing?.companyName || 'WYLDCARD STATS',
        address: event.taxInfo?.address || globalSettings?.billing?.address || '',
        gstin: event.taxInfo?.gstin || globalSettings?.billing?.gstin || '',
        pan: event.taxInfo?.pan || globalSettings?.billing?.pan || '',
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

    // Tax Breakdown (Simplified logic: If customer state != seller state (Assumed Telangana/Delhi), use IGST)
    // For now, let's assume Wyldcard is in Telangana. If customer state matches, split CGST/SGST.
    const sellerState = 'Telangana'; // Defaulting to Telangana for Wyldcard Stats
    const isSameState = customer.state.toLowerCase() === sellerState.toLowerCase();

    const taxBreakdown = {
        cgst: isSameState ? gstTotal / 2 : 0,
        sgst: isSameState ? gstTotal / 2 : 0,
        igst: isSameState ? 0 : gstTotal,
        gstRate: 18
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF({
        invoiceNumber: '', // Handled by pre-save
        invoiceDate: new Date(),
        bookingReference: txnid,
        seller,
        customer,
        event: {
            title: event.title,
            dates: firstTicket.selectedDates.map((d: Date) => new Date(d).toLocaleDateString()),
            hsnCode: event.taxInfo?.hsnCode || '998599'
        },
        items,
        subtotal,
        gstAmount: gstTotal,
        taxBreakdown,
        totalAmount: grandTotal,
        currency: event.ticketConfig.currency || 'INR',
        paymentMethod: 'PayU',
        transactionId: firstTicket.payuTransactionId
    });

    const fileStr = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
    const uploadResult = await uploadToCloudinary(fileStr, 'invoices');

    // Save Invoice
    const invoice = await Invoice.create({
        bookingReference: txnid,
        user: user,
        event: event._id,
        items,
        subtotal,
        gstAmount: gstTotal,
        taxBreakdown,
        totalAmount: grandTotal,
        currency: event.ticketConfig.currency || 'INR',
        sellerInfo: seller,
        customerInfo: customer,
        paymentMethod: 'PayU',
        payuTransactionId: firstTicket.payuTransactionId,
        pdfUrl: uploadResult.secure_url,
        status: 'PAID'
    });

    return invoice;
}
