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
        const invoice = await Invoice.findById(id).lean() as any;

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Permission check
        const isAdmin = session.user.role === 'SUPER_ADMIN';
        const isManager = session.user.role === 'VENUE_MANAGER';
        const isOwner = invoice.user?.toString() === session.user.id;

        if (!isAdmin && !isManager && !isOwner) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Redirect to the Web App's HTML invoice page
        const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
        return NextResponse.redirect(new URL(`/invoice/${invoice._id}`, webUrl));

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
