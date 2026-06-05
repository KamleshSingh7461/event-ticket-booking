import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        let invoice = await Invoice.findById(id).lean() as any;

        // If not found by ID, try treating it as a booking reference (for convenience)
        if (!invoice) {
            // Try to auto-create if it looks like an ID
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Permission check
        const isAdmin = session.user.role === 'SUPER_ADMIN';
        const isManager = session.user.role === 'VENUE_MANAGER';
        const isOwner = invoice.user?.toString() === session.user.id;

        if (!isAdmin && !isManager && !isOwner) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Redirect to the HTML invoice page
        return NextResponse.redirect(new URL(`/invoice/${invoice._id}`, req.url));

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
