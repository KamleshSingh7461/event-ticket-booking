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


import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { logDebug } from '@/lib/debug';

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

        let body: any = {};
        let bannerUrl = event.banner;


        const contentType = req.headers.get('content-type') || '';
        await logDebug('PUT Request Content-Type:', contentType);

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const file = formData.get('banner');

            await logDebug('FormData Keys:', Array.from(formData.keys()));
            await logDebug('File received info:', file ? {
                type: typeof file,
                isString: typeof file === 'string',
                name: (file as any).name,
                size: (file as any).size
            } : 'No file');

            if (file && typeof file !== 'string' && (file as File).size > 0) {
                const fileObj = file as File;
                const bytes = await fileObj.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const uploadDir = join(process.cwd(), 'public', 'uploads', 'events');
                await mkdir(uploadDir, { recursive: true });
                const filename = `${Date.now()}-${fileObj.name.replace(/\s/g, '_')}`;
                const filepath = join(uploadDir, filename);
                await writeFile(filepath, buffer);
                bannerUrl = `/uploads/events/${filename}`;
                await logDebug('New Banner URL generated:', bannerUrl);
            }

            formData.forEach((value, key) => {
                if (key !== 'banner') {
                    try {
                        body[key] = JSON.parse(value as string);
                    } catch {
                        body[key] = value;
                    }
                }
            });
            // Also map direct fields if they exist
            if (!body.ticketConfig && formData.has('ticketConfig')) {
                try { body.ticketConfig = JSON.parse(formData.get('ticketConfig') as string); } catch { }
            }
        } else {
            body = await req.json();
            bannerUrl = body.banner || event.banner;
        }

        if (session.user.role === 'VENUE_MANAGER') {
            const currentQuantity = event.ticketConfig.quantity;
            const newQuantity = body.ticketConfig?.quantity ?? body.quantity; // handle both structures

            if (newQuantity !== undefined) {
                if (parseInt(newQuantity) < currentQuantity) {
                    return NextResponse.json({ success: false, error: 'Cannot decrease ticket quantity' }, { status: 400 });
                }
                event.ticketConfig.quantity = parseInt(newQuantity);
                await event.save();
                return NextResponse.json({ success: true, data: event });
            } else {
                return NextResponse.json({ success: false, error: 'No valid changes provided' }, { status: 400 });
            }

        } else {
            // SUPER_ADMIN
            const updateData: any = { ...body };
            if (bannerUrl) {
                updateData.banner = bannerUrl;
            }

            await logDebug('Final Update Data:', updateData);

            // Use set() to apply updates. This is safer for Mongoose documents.
            // event.set(updateData);

            // Explicitly set banner if strict mode ignored it for some reason (though unlikely)
            // if (bannerUrl) {
            //     event.banner = bannerUrl;
            // }

            // await event.save();

            // FIX: Use findByIdAndUpdate to force update even if schema is stale in dev mode
            const updatedEvent = await Event.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: false, strict: false }
            );

            await logDebug('Event saved successfully', updatedEvent);
            return NextResponse.json({ success: true, data: updatedEvent });
        }

    } catch (error: any) {
        console.error('PUT Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
