import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Event from '@/models/Event';
import JSZip from 'jszip';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'VENUE_MANAGER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const eventId = searchParams.get('eventId');
        const invoiceIds = searchParams.get('ids')?.split(',');

        await dbConnect();

        let query: any = {};
        if (eventId) {
            query.event = eventId;
            // If venue manager, verify event ownership
            if (session.user.role === 'VENUE_MANAGER') {
                const event = await Event.findOne({ _id: eventId, venueManager: session.user.id });
                if (!event) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            }
        } else if (invoiceIds) {
            query._id = { $in: invoiceIds };
        } else {
            return NextResponse.json({ error: 'Missing eventId or ids' }, { status: 400 });
        }

        const invoices = await Invoice.find(query);
        if (invoices.length === 0) {
            return NextResponse.json({ error: 'No invoices found' }, { status: 404 });
        }

        const zip = new JSZip();
        
        // Fetch PDFs in parallel with a limit to avoid overloading
        const BATCH_SIZE = 10;
        for (let i = 0; i < invoices.length; i += BATCH_SIZE) {
            const batch = invoices.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (invoice) => {
                if (!invoice.pdfUrl) return;
                try {
                    const response = await fetch(invoice.pdfUrl);
                    if (response.ok) {
                        const buffer = await response.arrayBuffer();
                        zip.file(`${invoice.invoiceNumber}.pdf`, buffer);
                    }
                } catch (err) {
                    console.error(`Failed to fetch PDF for ${invoice.invoiceNumber}`, err);
                }
            }));
        }

        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

        return new NextResponse(zipBuffer, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="invoices_${eventId || 'bulk'}.zip"`
            }
        });

    } catch (error: any) {
        console.error('Bulk Download Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
