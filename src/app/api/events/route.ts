import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== 'VENUE_MANAGER' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Only venue managers and admins can create events' },
                { status: 401 }
            );
        }

        await dbConnect();

        const formData = await req.formData();
        const file = formData.get('banner') as File | null;
        let bannerUrl = '';

        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uploadDir = join(process.cwd(), 'public', 'uploads', 'events');
            await mkdir(uploadDir, { recursive: true });

            const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
            const filepath = join(uploadDir, filename);

            await writeFile(filepath, buffer);
            bannerUrl = `/uploads/events/${filename}`;
        } else if (typeof formData.get('banner') === 'string') {
            // Handle case where banner might be a URL string (backward compatibility)
            bannerUrl = formData.get('banner') as string;
        }

        // Parse detailed fields from FormData stringified JSON
        const body: any = {};
        formData.forEach((value, key) => {
            if (key !== 'banner') {
                try {
                    // Try parsing JSON for objects/arrays
                    body[key] = JSON.parse(value as string);
                } catch {
                    body[key] = value;
                }
            }
        });

        // Manual assignment for flattened fields if they came individually (fallback)
        if (!body.title) body.title = formData.get('title');
        if (!body.description) body.description = formData.get('description');
        if (!body.type) body.type = formData.get('type');
        if (!body.venue) body.venue = formData.get('venue');
        if (!body.startDate) body.startDate = formData.get('startDate');
        if (!body.endDate) body.endDate = formData.get('endDate');


        let venueManagerId = session.user.id;

        // Super Admin Logic
        if (session.user.role === 'SUPER_ADMIN') {
            const vmDetails = formData.get('venueManagerDetails');
            if (vmDetails) {
                const { name, email, mode, id } = JSON.parse(vmDetails as string);

                if (mode === 'create') {
                    let user = await User.findOne({ email });
                    if (user) {
                        return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 });
                    }
                    const generatedPassword = Math.random().toString(36).slice(-8);
                    const hashedPassword = await bcrypt.hash(generatedPassword, 10);
                    user = await User.create({ name, email, password: hashedPassword, role: 'VENUE_MANAGER' });

                    const { sendWelcomeEmail } = await import('@/lib/email');
                    await sendWelcomeEmail(email, name, 'VENUE_MANAGER', generatedPassword);
                    venueManagerId = user._id;

                } else if (mode === 'existing') {
                    const user = await User.findById(id);
                    if (!user || user.role !== 'VENUE_MANAGER') {
                        return NextResponse.json({ success: false, error: 'Invalid Venue Manager' }, { status: 400 });
                    }
                    venueManagerId = user._id;
                }
            } else {
                return NextResponse.json({ success: false, error: 'Venue Manager details required' }, { status: 400 });
            }
        }

        const eventData = {
            ...body,
            banner: bannerUrl,
            venueManager: venueManagerId,
            createdBy: session.user.id
        };

        // Handle Ticket Config if it was stringified
        if (typeof eventData.ticketConfig === 'string') {
            eventData.ticketConfig = JSON.parse(eventData.ticketConfig);
        }
        if (typeof eventData.subHeadings === 'string') {
            eventData.subHeadings = JSON.parse(eventData.subHeadings);
        }

        delete eventData.venueManagerDetails;

        const event = await Event.create(eventData);
        return NextResponse.json({ success: true, data: event }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const events = await Event.find({ isActive: true }).sort({ startDate: 1 });
        return NextResponse.json({ success: true, data: events });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
