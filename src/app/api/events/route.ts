import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import TicketModel from '@/models/Ticket';

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
        const banner = formData.get('banner') as File | string | null;
        let bannerUrl = '';

        // Handle Banner (File or String)
        if (banner) {
            if (typeof banner === 'string') {
                bannerUrl = banner;
            } else if (banner.size > 0) {
                const bytes = await banner.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const uploadDir = join(process.cwd(), 'public', 'uploads', 'events');
                await mkdir(uploadDir, { recursive: true });
                const filename = `${Date.now()}-${banner.name.replace(/\s/g, '_')}`;
                const filepath = join(uploadDir, filename);
                await writeFile(filepath, buffer);
                bannerUrl = `/uploads/events/${filename}`;
            }
        }

        // Handle Gallery and Schedule fields
        const scheduleRaw = formData.get('schedule') as string;
        const galleryRaw = formData.get('gallery') as string;
        let gallery: string[] = [];
        let schedule: string[] = [];

        if (galleryRaw) {
            try {
                gallery = JSON.parse(galleryRaw);
            } catch (e) {
                gallery = [];
            }
        }

        if (scheduleRaw) {
            try {
                schedule = JSON.parse(scheduleRaw);
            } catch (e) {
                schedule = [];
            }
        }

        let venueManagerId = session.user.id;

        // Super Admin Logic for Venue Manager Assignment
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
            }
        }

        // Construct Event Data
        const eventData: any = {
            title: formData.get('title'),
            description: formData.get('description'),
            type: formData.get('type'),
            venue: formData.get('venue'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            entryTime: formData.get('entryTime'),
            ticketConfig: formData.get('ticketConfig'), // Will be parsed below
            subHeadings: formData.get('subHeadings'),   // Will be parsed below
            banner: bannerUrl,
            gallery: gallery,
            schedule: schedule,
            venueManager: venueManagerId,
            createdBy: session.user.id,
            isActive: true
        };

        // Parse JSON fields
        if (typeof eventData.ticketConfig === 'string') {
            try { eventData.ticketConfig = JSON.parse(eventData.ticketConfig); } catch { }
        }
        if (typeof eventData.subHeadings === 'string') {
            try { eventData.subHeadings = JSON.parse(eventData.subHeadings); } catch { }
        }

        const event = await Event.create(eventData);
        return NextResponse.json({ success: true, data: event }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const events = await Event.find({ isActive: true }).sort({ startDate: 1 }).lean();

        const eventsWithStats = await Promise.all(events.map(async (event) => {
            const soldCount = await TicketModel.countDocuments({
                event: event._id,
                paymentStatus: 'SUCCESS'
            });

            const totalCapacity = event.ticketConfig.quantity || 100;
            const percentSold = (soldCount / totalCapacity) * 100;

            return {
                ...event,
                isSoldOut: soldCount >= totalCapacity,
                isSellingFast: percentSold >= 70 && soldCount < totalCapacity,
                percentSold
            };
        }));

        return NextResponse.json({ success: true, data: eventsWithStats });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
