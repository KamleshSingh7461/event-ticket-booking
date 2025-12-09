import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();
        const event = await Event.findById(id);

        if (!event) {
            return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: event });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();
        const event = await Event.findByIdAndDelete(id);

        if (!event) {
            return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Event deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const event = await Event.findById(id);

        if (!event) {
            return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
        }

        // Authorization Check
        if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'VENUE_MANAGER') {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        if (session.user.role === 'VENUE_MANAGER' && event.venueManager.toString() !== session.user.id) {
            return NextResponse.json({ success: false, error: 'Forbidden - Not your event' }, { status: 403 });
        }

        const body = await req.json();

        // Venue Manager Restriction Logic
        if (session.user.role === 'VENUE_MANAGER') {
            const currentQuantity = event.ticketConfig.quantity;
            const newQuantity = body.ticketConfig?.quantity;

            // Check if they are trying to update anything else
            // We only allow ticketConfig.quantity to change.
            // Simplified check: We just ignore everything else and only apply quantity update if provided.

            if (newQuantity !== undefined) {
                if (newQuantity < currentQuantity) {
                    return NextResponse.json({ success: false, error: 'Cannot decrease ticket quantity' }, { status: 400 });
                }

                // Only update quantity
                event.ticketConfig.quantity = newQuantity;
                await event.save();
                return NextResponse.json({ success: true, data: event });
            } else {
                return NextResponse.json({ success: false, error: 'No valid changes provided' }, { status: 400 });
            }

        } else {
            // SUPER_ADMIN can update everything (for future proofing, mostly)
            Object.assign(event, body);
            await event.save();
            return NextResponse.json({ success: true, data: event });
        }

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
