import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const invoice = await Invoice.findById(params.id);

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Permission check
        const isAdmin = session.user.role === 'SUPER_ADMIN';
        const isManager = session.user.role === 'VENUE_MANAGER';
        const isOwner = invoice.user.toString() === session.user.id;

        // Venue managers can only see invoices for their events
        // (This would require checking event ownership, for now let's allow if manager/admin or owner)
        if (!isAdmin && !isManager && !isOwner) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (!invoice.pdfUrl) {
            return NextResponse.json({ error: 'Invoice PDF not generated yet' }, { status: 404 });
        }

        // Redirect to the Cloudinary URL
        return NextResponse.redirect(invoice.pdfUrl);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
