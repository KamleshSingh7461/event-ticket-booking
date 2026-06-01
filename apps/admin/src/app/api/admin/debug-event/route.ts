import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const event = await Event.findById('6a1dd7697927e6209cfba3c4').lean();
        return NextResponse.json({ success: true, event });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message });
    }
}
