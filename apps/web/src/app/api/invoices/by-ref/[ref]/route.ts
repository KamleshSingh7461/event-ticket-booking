import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ ref: string }> }
) {
    try {
        const { ref } = await params;
        await dbConnect();
        const invoice = await Invoice.findOne({ bookingReference: ref }).lean();

        if (!invoice) {
            return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, invoice });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
