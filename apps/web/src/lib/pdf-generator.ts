import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { toWords } from 'number-to-words';
import axios from 'axios';

interface InvoiceData {
    invoiceNumber: string;
    invoiceDate: Date;
    bookingReference: string;
    seller: {
        companyName: string;
        address: string;
        gstin: string;
        pan: string;
        cin: string;
        logoUrl?: string;
        authorizedSignatory?: string;
    };
    customer: {
        name: string;
        email: string;
        phone?: string;
        address?: string;
        state?: string;
    };
    event: {
        title: string;
        dates: string[];
        hsnCode: string;
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
    taxBreakdown: {
        cgst: number;
        sgst: number;
        igst: number;
        gstRate: number;
    };
    totalAmount: number;
    currency: string;
    paymentMethod?: string;
    transactionId?: string;
}

async function fetchImage(url: string): Promise<Buffer | null> {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (error) {
        console.error('Failed to fetch image:', url, error);
        return null;
    }
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });

            // --- Header & Logo (Wyldcard Stats Premium) ---
            doc.rect(0, 0, doc.page.width, 120).fill('#000000'); // Black header bar
            
            if (data.seller.logoUrl) {
                const logoBuffer = await fetchImage(data.seller.logoUrl);
                if (logoBuffer) {
                    doc.image(logoBuffer, 40, 35, { height: 50 });
                }
            } else {
                // Text fallback
                doc.fillColor('#AE8638').font('Helvetica-Bold').fontSize(24).text('WYLDCARD STATS', 40, 45);
            }

            // INVOICE Text in Gold
            doc.fillColor('#AE8638').font('Helvetica-Bold').fontSize(20).text('TAX INVOICE', 400, 40, { align: 'right' });
            
            // Sub-details in White
            doc.fillColor('#FFFFFF').font('Helvetica').fontSize(9);
            doc.text(`Invoice #: ${data.invoiceNumber}`, 400, 65, { align: 'right' });
            doc.text(`Date: ${new Date(data.invoiceDate).toLocaleDateString('en-IN')}`, 400, 78, { align: 'right' });
            
            doc.moveDown(4);

            // --- Seller & Buyer Section ---
            const startY = 140;
            const columnWidth = 250;

            // Seller Info (Left)
            doc.fillColor('#AE8638').font('Helvetica-Bold').fontSize(12).text(data.seller.companyName, 40, startY);
            doc.fillColor('#333333').font('Helvetica').fontSize(9).text(data.seller.address, 40, startY + 18, { width: columnWidth });
            doc.moveDown(0.5);
            doc.text(`GSTIN: ${data.seller.gstin || 'N/A'}`);
            doc.text(`PAN: ${data.seller.pan || 'N/A'}`);
            doc.text(`CIN: ${data.seller.cin || 'N/A'}`);

            // Buyer Info (Right)
            const buyerX = 320;
            doc.fillColor('#AE8638').font('Helvetica-Bold').fontSize(12).text('BILL TO:', buyerX, startY);
            doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10).text(data.customer.name, buyerX, startY + 18);
            doc.fillColor('#333333').font('Helvetica').fontSize(9);
            if (data.customer.address) doc.text(data.customer.address, buyerX, doc.y + 3, { width: columnWidth });
            if (data.customer.state) doc.text(`State: ${data.customer.state}`, buyerX, doc.y + 3);
            doc.text(`Email: ${data.customer.email}`, buyerX, doc.y + 3);
            if (data.customer.phone) doc.text(`Phone: ${data.customer.phone}`, buyerX, doc.y + 3);

            doc.moveDown(2);

            // --- Place of Supply (Gold Accent) ---
            doc.rect(40, doc.y, 515, 24).fill('#AE8638').stroke('#AE8638');
            doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10).text(`Place of Supply: ${data.customer.state || 'N/A'}`, 50, doc.y + 7);
            doc.moveDown(2);

            // --- Items Table ---
            const tableTop = doc.y + 15;
            const col1 = 40;  // Description
            const col2 = 280; // HSN
            const col3 = 340; // Qty
            const col4 = 380; // Rate
            const col5 = 450; // GST
            const col6 = 500; // Amount

            // Table Header Background (Black)
            doc.rect(40, tableTop, 515, 24).fill('#000000').stroke('#000000');
            doc.fillColor('#AE8638').fontSize(9).font('Helvetica-Bold');
            doc.text('Description', col1 + 10, tableTop + 8);
            doc.text('HSN', col2, tableTop + 8);
            doc.text('Qty', col3, tableTop + 8);
            doc.text('Rate', col4, tableTop + 8);
            doc.text('GST', col5, tableTop + 8);
            doc.text('Amount', col6, tableTop + 8);

            // Table Body
            doc.fillColor('#333333').font('Helvetica').fontSize(9);
            let itemY = tableTop + 35;

            data.items.forEach((item, index) => {
                doc.text(item.description, col1 + 10, itemY, { width: 230 });
                doc.text(data.event.hsnCode, col2, itemY);
                doc.text(item.quantity.toString(), col3, itemY);
                doc.text(item.basePrice.toFixed(2), col4, itemY);
                doc.text(item.gstAmount.toFixed(2), col5, itemY);
                doc.text(item.totalAmount.toFixed(2), col6, itemY);
                
                itemY += 25;
                doc.moveTo(40, itemY - 5).lineTo(555, itemY - 5).lineWidth(0.5).strokeColor('#E5E7EB').stroke();
            });

            // --- Summary Section ---
            doc.moveDown(2);
            const summaryY = doc.y + 10;
            
            // Amount in words
            doc.fillColor('#AE8638').font('Helvetica-Bold').fontSize(9).text('Amount in Words:', 40, summaryY);
            const words = toWords(Math.round(data.totalAmount)).toUpperCase();
            doc.fillColor('#333333').font('Helvetica-Oblique').text(`${words} RUPEES ONLY`, 40, summaryY + 14, { width: 280 });

            // Financial Summary Box
            const boxX = 355;
            doc.fillColor('#333333').font('Helvetica').fontSize(9);
            
            doc.text('Subtotal:', boxX, summaryY);
            doc.text(data.subtotal.toFixed(2), 500, summaryY, { align: 'right', width: 55 });
            
            if (data.taxBreakdown.igst > 0) {
                doc.text(`IGST (${data.taxBreakdown.gstRate}%):`, boxX, summaryY + 18);
                doc.text(data.taxBreakdown.igst.toFixed(2), 500, summaryY + 18, { align: 'right', width: 55 });
            } else {
                doc.text(`CGST (${data.taxBreakdown.gstRate/2}%):`, boxX, summaryY + 18);
                doc.text(data.taxBreakdown.cgst.toFixed(2), 500, summaryY + 18, { align: 'right', width: 55 });
                doc.text(`SGST (${data.taxBreakdown.gstRate/2}%):`, boxX, summaryY + 36);
                doc.text(data.taxBreakdown.sgst.toFixed(2), 500, summaryY + 36, { align: 'right', width: 55 });
            }

            // Grand Total (Black Box with Gold Text)
            doc.moveDown(1.5);
            doc.rect(boxX - 5, doc.y, 205, 30).fill('#000000').stroke('#000000');
            doc.fillColor('#AE8638').font('Helvetica-Bold').fontSize(12);
            doc.text('Grand Total:', boxX, doc.y + 9);
            doc.text(`${data.currency} ${data.totalAmount.toFixed(2)}`, 450, doc.y - 12, { align: 'right', width: 100 });

            // --- Footer / Signature ---
            const footerY = 700;
            
            // Signature Block
            if (data.seller.authorizedSignatory) {
                const sigBuffer = await fetchImage(data.seller.authorizedSignatory);
                if (sigBuffer) {
                    doc.image(sigBuffer, 400, footerY - 70, { height: 45 });
                }
            }
            
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000').text(`For ${data.seller.companyName}`, 380, footerY - 20, { align: 'right', width: 175 });
            doc.font('Helvetica').fontSize(8).fillColor('#AE8638').text('Authorised Signatory', 380, footerY - 5, { align: 'right', width: 175 });

            // Footer Note
            doc.moveTo(40, footerY + 15).lineTo(555, footerY + 15).lineWidth(1).strokeColor('#AE8638').stroke();
            doc.font('Helvetica').fontSize(8).fillColor('#666666');
            doc.text('This is a computer generated invoice and does not require a physical signature.', 40, footerY + 25, { align: 'center', width: 515 });

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
