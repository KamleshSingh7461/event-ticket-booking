import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

interface InvoiceData {
    invoiceNumber: string;
    invoiceDate: Date;
    bookingReference: string;
    customer: {
        name: string;
        email: string;
        phone?: string;
    };
    event: {
        title: string;
        dates: string[];
    };
    items: Array<{
        description: string;
        quantity: number;
        basePrice: number;
        gstAmount: number;
        totalAmount: number;
    }>;
    subtotal: number;
    gstAmount: number;
    totalAmount: number;
    currency: string;
    paymentMethod?: string;
    transactionId?: string;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });

            // Header
            doc.fontSize(20).text('INVOICE', { align: 'center' });
            doc.moveDown();

            // Invoice Details
            doc.fontSize(10);
            doc.text(`Invoice Number: ${data.invoiceNumber}`, 50, 100);
            doc.text(`Invoice Date: ${new Date(data.invoiceDate).toLocaleDateString()}`, 50, 115);
            doc.text(`Booking Reference: ${data.bookingReference}`, 50, 130);

            // Customer Details
            doc.fontSize(12).text('Bill To:', 50, 160);
            doc.fontSize(10);
            doc.text(data.customer.name, 50, 180);
            doc.text(data.customer.email, 50, 195);
            if (data.customer.phone) {
                doc.text(data.customer.phone, 50, 210);
            }

            // Event Details
            doc.fontSize(12).text('Event Details:', 50, 240);
            doc.fontSize(10);
            doc.text(data.event.title, 50, 260);
            doc.text(`Dates: ${data.event.dates.join(', ')}`, 50, 275);

            // Table Header
            const tableTop = 320;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Description', 50, tableTop);
            doc.text('Qty', 300, tableTop);
            doc.text('Price', 350, tableTop);
            doc.text('GST', 420, tableTop);
            doc.text('Total', 480, tableTop);

            // Table Line
            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            // Table Items
            doc.font('Helvetica');
            let yPosition = tableTop + 25;

            data.items.forEach((item) => {
                doc.text(item.description, 50, yPosition, { width: 240 });
                doc.text(item.quantity.toString(), 300, yPosition);
                doc.text(`${data.currency} ${item.basePrice.toFixed(2)}`, 350, yPosition);
                doc.text(`${data.currency} ${item.gstAmount.toFixed(2)}`, 420, yPosition);
                doc.text(`${data.currency} ${item.totalAmount.toFixed(2)}`, 480, yPosition);
                yPosition += 30;
            });

            // Summary
            yPosition += 20;
            doc.moveTo(350, yPosition).lineTo(550, yPosition).stroke();
            yPosition += 10;

            doc.text('Subtotal:', 350, yPosition);
            doc.text(`${data.currency} ${data.subtotal.toFixed(2)}`, 480, yPosition);
            yPosition += 20;

            doc.text('GST (18%):', 350, yPosition);
            doc.text(`${data.currency} ${data.gstAmount.toFixed(2)}`, 480, yPosition);
            yPosition += 20;

            doc.font('Helvetica-Bold').fontSize(12);
            doc.text('TOTAL:', 350, yPosition);
            doc.text(`${data.currency} ${data.totalAmount.toFixed(2)}`, 480, yPosition);

            // Payment Details
            if (data.paymentMethod) {
                yPosition += 40;
                doc.fontSize(10).font('Helvetica');
                doc.text('Payment Details:', 50, yPosition);
                yPosition += 20;
                doc.text(`Payment Status: PAID`, 50, yPosition);
                yPosition += 15;
                doc.text(`Payment Method: ${data.paymentMethod}`, 50, yPosition);
                if (data.transactionId) {
                    yPosition += 15;
                    doc.text(`Transaction ID: ${data.transactionId}`, 50, yPosition);
                }
            }

            // Footer
            doc.fontSize(8).text(
                'Thank you for your purchase!',
                50,
                700,
                { align: 'center' }
            );

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

export function bufferToStream(buffer: Buffer): Readable {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
}
