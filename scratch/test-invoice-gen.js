
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');
const { toWords } = require('number-to-words');
const axios = require('axios');

async function fetchImage(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (error) {
        console.error('Failed to fetch image:', url, error);
        return null;
    }
}

async function generateInvoicePDF(data) {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });

            // --- Header & Logo ---
            if (data.seller.logoUrl) {
                const logoBuffer = await fetchImage(data.seller.logoUrl);
                if (logoBuffer) {
                    doc.image(logoBuffer, 40, 35, { height: 50 });
                }
            }

            doc.font('Helvetica-Bold').fontSize(16).text('TAX INVOICE', 400, 40, { align: 'right' });
            doc.font('Helvetica').fontSize(9).text(`Invoice #: ${data.invoiceNumber}`, 400, 60, { align: 'right' });
            doc.text(`Date: ${new Date(data.invoiceDate).toLocaleDateString('en-IN')}`, 400, 72, { align: 'right' });
            
            doc.moveDown(4);

            // --- Seller & Buyer Section (Boxed) ---
            const startY = 110;
            const columnWidth = 250;

            // Seller Info
            doc.font('Helvetica-Bold').fontSize(10).text(data.seller.companyName, 40, startY);
            doc.font('Helvetica').fontSize(8).text(data.seller.address, 40, startY + 15, { width: columnWidth });
            doc.moveDown(0.5);
            doc.text(`GSTIN: ${data.seller.gstin || 'N/A'}`);
            doc.text(`PAN: ${data.seller.pan || 'N/A'}`);
            doc.text(`CIN: ${data.seller.cin || 'N/A'}`);

            // Buyer Info
            const buyerX = 320;
            doc.font('Helvetica-Bold').fontSize(10).text('BILL TO:', buyerX, startY);
            doc.font('Helvetica').fontSize(9).text(data.customer.name, buyerX, startY + 15);
            doc.fontSize(8);
            if (data.customer.address) doc.text(data.customer.address, buyerX, doc.y + 2, { width: columnWidth });
            if (data.customer.state) doc.text(`State: ${data.customer.state}`, buyerX, doc.y + 2);
            doc.text(`Email: ${data.customer.email}`, buyerX, doc.y + 2);
            if (data.customer.phone) doc.text(`Phone: ${data.customer.phone}`, buyerX, doc.y + 2);

            doc.moveDown(2);

            // --- Place of Supply ---
            doc.rect(40, doc.y, 515, 20).fill('#f3f4f6').stroke('#e5e7eb');
            doc.fillColor('#000').font('Helvetica-Bold').text(`Place of Supply: ${data.customer.state || 'N/A'}`, 50, doc.y + 6);
            doc.moveDown(2);

            // --- Items Table ---
            const tableTop = doc.y + 10;
            const col1 = 40;  // Description
            const col2 = 280; // HSN
            const col3 = 340; // Qty
            const col4 = 380; // Rate
            const col5 = 450; // GST
            const col6 = 500; // Amount

            // Table Header Background
            doc.rect(40, tableTop, 515, 20).fill('#000').stroke('#000');
            doc.fillColor('#fff').fontSize(8).font('Helvetica-Bold');
            doc.text('Description', col1 + 5, tableTop + 6);
            doc.text('HSN', col2, tableTop + 6);
            doc.text('Qty', col3, tableTop + 6);
            doc.text('Rate', col4, tableTop + 6);
            doc.text('GST', col5, tableTop + 6);
            doc.text('Amount', col6, tableTop + 6);

            // Table Body
            doc.fillColor('#000').font('Helvetica');
            let itemY = tableTop + 25;

            data.items.forEach((item, index) => {
                doc.text(item.description, col1 + 5, itemY, { width: 230 });
                doc.text(data.event.hsnCode, col2, itemY);
                doc.text(item.quantity.toString(), col3, itemY);
                doc.text(item.basePrice.toFixed(2), col4, itemY);
                doc.text(item.gstAmount.toFixed(2), col5, itemY);
                doc.text(item.totalAmount.toFixed(2), col6, itemY);
                
                itemY += 25;
                doc.moveTo(40, itemY - 5).lineTo(555, itemY - 5).lineWidth(0.5).strokeColor('#e5e7eb').stroke();
            });

            // --- Summary Section ---
            doc.moveDown(1);
            const summaryY = doc.y + 10;
            
            doc.font('Helvetica-Bold').fontSize(8).text('Amount in Words:', 40, summaryY);
            const words = toWords(Math.round(data.totalAmount)).toUpperCase();
            doc.font('Helvetica').text(`${words} RUPEES ONLY`, 40, summaryY + 12, { width: 280 });

            const boxX = 355;
            doc.fontSize(9);
            
            doc.text('Subtotal:', boxX, summaryY);
            doc.text(data.subtotal.toFixed(2), 500, summaryY, { align: 'right', width: 55 });
            
            if (data.taxBreakdown.igst > 0) {
                doc.text(`IGST (${data.taxBreakdown.gstRate}%):`, boxX, summaryY + 15);
                doc.text(data.taxBreakdown.igst.toFixed(2), 500, summaryY + 15, { align: 'right', width: 55 });
            } else {
                doc.text(`CGST (${data.taxBreakdown.gstRate/2}%):`, boxX, summaryY + 15);
                doc.text(data.taxBreakdown.cgst.toFixed(2), 500, summaryY + 15, { align: 'right', width: 55 });
                doc.text(`SGST (${data.taxBreakdown.gstRate/2}%):`, boxX, summaryY + 30);
                doc.text(data.taxBreakdown.sgst.toFixed(2), 500, summaryY + 30, { align: 'right', width: 55 });
            }

            doc.moveDown(1);
            doc.rect(boxX - 5, doc.y, 205, 25).fill('#f3f4f6').stroke('#000');
            doc.fillColor('#000').font('Helvetica-Bold').fontSize(11);
            doc.text('Grand Total:', boxX, doc.y + 7);
            doc.text(`${data.currency} ${data.totalAmount.toFixed(2)}`, 450, doc.y, { align: 'right', width: 100 });

            // --- Footer / Signature ---
            const footerY = 700;
            doc.font('Helvetica').fontSize(7).fillColor('#6b7280');
            doc.text('This is a computer generated invoice and does not require a physical signature.', 40, footerY, { align: 'center', width: 515 });
            
            if (data.seller.authorizedSignatory) {
                const sigBuffer = await fetchImage(data.seller.authorizedSignatory);
                if (sigBuffer) {
                    doc.image(sigBuffer, 400, footerY - 60, { height: 40 });
                }
            }
            
            doc.font('Helvetica-Bold').fontSize(9).fillColor('#000').text(`For ${data.seller.companyName}`, 380, footerY - 15, { align: 'right', width: 175 });
            doc.fontSize(7).text('Authorised Signatory', 380, footerY, { align: 'right', width: 175 });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

// Mock data for testing
const mockData = {
    invoiceNumber: 'INV-2026-001',
    invoiceDate: new Date(),
    bookingReference: 'BK-123456',
    seller: {
        companyName: 'WYLDCARD STATS',
        address: '123, Sports Complex, Gachibowli, Hyderabad, Telangana - 500032',
        gstin: '36AAAAA0000A1Z5',
        pan: 'AAAAA0000A',
        cin: 'U74999TG2024PTC123456',
        logoUrl: 'https://res.cloudinary.com/desdbjzzt/image/upload/v1777203252/logo_yswfeg.png',
        authorizedSignatory: 'https://res.cloudinary.com/desdbjzzt/image/upload/v1777203252/logo_yswfeg.png'
    },
    customer: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        address: 'Flat 402, Sunshine Apartments, Jubilee Hills',
        state: 'Telangana'
    },
    event: {
        title: 'TELANGANA PRO BASKETBALL LEAGUE',
        dates: ['2026-04-26'],
        hsnCode: '998599'
    },
    items: [
        {
            description: 'TELANGANA PRO BASKETBALL LEAGUE - Daily Pass (2026-04-26)',
            quantity: 2,
            basePrice: 500,
            gstAmount: 90,
            totalAmount: 590
        }
    ],
    subtotal: 1000,
    gstAmount: 180,
    taxBreakdown: {
        cgst: 90,
        sgst: 90,
        igst: 0,
        gstRate: 18
    },
    totalAmount: 1180,
    currency: 'INR',
    paymentMethod: 'UPI',
    transactionId: 'TXN-987654321'
};

async function test() {
    const fs = require('fs');
    const path = require('path');
    try {
        console.log('Generating test invoice...');
        const buffer = await generateInvoicePDF(mockData);
        const outputPath = path.join(__dirname, 'test-invoice.pdf');
        fs.writeFileSync(outputPath, buffer);
        console.log('Invoice generated successfully at:', outputPath);
    } catch (error) {
        console.error('Error generating invoice:', error);
    }
}

test();
