import { generateInvoicePDF } from './apps/web/src/lib/pdf-generator';
import fs from 'fs';
import path from 'path';

async function run() {
    const data = {
        invoiceNumber: 'WYL-INV-2024-00124',
        invoiceDate: new Date(),
        bookingReference: 'TXN-2024-001ABC',
        seller: {
            companyName: 'WYLDCARD STATS PRIVATE LIMITED',
            address: 'Ground Floor, Shop No.6/A, Ambica Darshan Society, C.P.Road, Kandivali East, Mumbai, Maharashtra 400101',
            gstin: '27AAECW1497L1ZQ',
            pan: 'AAECW1497L',
            cin: ''
        },
        customer: {
            name: 'Rahul Singh',
            email: 'rahul.singh@example.com',
            phone: '+91 9876543210',
            address: '45 Tech Avenue, HITEC City',
            state: 'Telangana'
        },
        event: {
            title: 'TELANGANA PRO BASKETBALL LEAGUE',
            dates: ['January 15, 2025'],
            hsnCode: '998599'
        },
        items: [
            {
                description: 'TELANGANA PRO BASKETBALL LEAGUE - Daily Pass',
                quantity: 2,
                basePrice: 2000.00,
                gstAmount: 360.00,
                totalAmount: 2360.00
            }
        ],
        subtotal: 2000.00,
        gstAmount: 360.00,
        // Because Seller is MH and Customer is TS, it should be IGST. 
        // I'll mock the IGST values here for the visual preview to be accurate.
        taxBreakdown: {
            cgst: 0,
            sgst: 0,
            igst: 360.00,
            gstRate: 18
        },
        totalAmount: 2360.00,
        currency: 'INR',
        paymentMethod: 'PayU',
        transactionId: '1234567890'
    };

    try {
        console.log('Generating PDF...');
        const buffer = await generateInvoicePDF(data);
        const outputPath = path.join(process.cwd(), 'sample_invoice.pdf');
        fs.writeFileSync(outputPath, buffer);
        console.log('PDF saved to:', outputPath);
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}

run();
