import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event';
import GlobalSettings from '@/models/GlobalSettings';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ ref: string }> }
) {
    try {
        const { ref } = await params;
        await dbConnect();
        let invoice = await Invoice.findOne({ bookingReference: ref }).lean();

        if (!invoice) {
            // Retroactively create invoice without PDF generation
            try {
                const tickets = await Ticket.find({ bookingReference: ref }).populate('event');
                if (!tickets.length) {
                    return NextResponse.json({ success: false, error: 'No tickets found for this booking' }, { status: 404 });
                }

                const globalSettings = await GlobalSettings.findOne({ key: 'billing_config' });
                const firstTicket = tickets[0];
                const event = firstTicket.event as any;

                const seller = {
                    companyName: event.taxInfo?.companyName || globalSettings?.billing?.companyName || 'WYLDCARD STATS PRIVATE LIMITED',
                    address: event.taxInfo?.address || globalSettings?.billing?.address || '',
                    gstin: event.taxInfo?.gstin || globalSettings?.billing?.gstin || '',
                    pan: event.taxInfo?.pan || globalSettings?.billing?.pan || '',
                    cin: event.taxInfo?.cin || globalSettings?.billing?.cin || '',
                };

                const customer = {
                    name: firstTicket.buyerDetails.name,
                    email: firstTicket.buyerDetails.email,
                    phone: firstTicket.buyerDetails.contact,
                    address: firstTicket.buyerDetails.address || '',
                    state: firstTicket.buyerDetails.state || ''
                };

                let subtotal = 0, gstTotal = 0, grandTotal = 0;
                let totalPlatformFee = 0, totalPlatformFeeGst = 0;

                const items = tickets.map((t: any, index: number) => {
                    const itemBase = t.pricing?.baseAmount || (t.amountPaid / 1.18) || 0;
                    const itemGst = t.pricing?.gstAmount || (t.amountPaid - itemBase) || 0;
                    const itemTotal = itemBase + itemGst;
                    totalPlatformFee += t.pricing?.platformFee || 0;
                    totalPlatformFeeGst += t.pricing?.platformFeeGst || 0;
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
                    items.push({ description: 'Platform Convenience Fee', quantity: 1, basePrice: totalPlatformFee, gstAmount: totalPlatformFeeGst, totalAmount: totalPlatformFee + totalPlatformFeeGst });
                }

                const sellerState = 'Maharashtra';
                const isSameState = customer.state.toLowerCase() === sellerState.toLowerCase();
                const taxBreakdown = {
                    cgst: isSameState ? gstTotal / 2 : 0,
                    sgst: isSameState ? gstTotal / 2 : 0,
                    igst: isSameState ? 0 : gstTotal,
                    gstRate: 18
                };

                const invoiceNumber = `INV-${Date.now()}${Math.floor(Math.random() * 1000)}`;

                const newInvoice = await Invoice.create({
                    invoiceNumber,
                    bookingReference: ref,
                    user: firstTicket.user,
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

                invoice = newInvoice;
            } catch (e: any) {
                console.error('Failed to retroactively create invoice:', e);
                return NextResponse.json({ success: false, error: 'Invoice not found and could not be generated: ' + e.message }, { status: 404 });
            }
        }

        return NextResponse.json({ success: true, invoice });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
