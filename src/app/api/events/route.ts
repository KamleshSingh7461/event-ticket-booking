import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';

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
        const body = await req.json();
        let venueManagerId = session.user.id;

        // Super Admin Logic for assigning Venue Manager
        if (session.user.role === 'SUPER_ADMIN') {
            if (body.venueManagerDetails) {
                const { name, email, mode } = body.venueManagerDetails;

                if (mode === 'create') {
                    // Check if user exists
                    let user = await User.findOne({ email });
                    if (user) {
                        return NextResponse.json({ success: false, error: 'User with this email already exists' }, { status: 400 });
                    }

                    // Create new Venue Manager
                    const generatedPassword = Math.random().toString(36).slice(-8); // Simple random password
                    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

                    user = await User.create({
                        name,
                        email,
                        password: hashedPassword,
                        role: 'VENUE_MANAGER'
                    });

                    // Send email
                    const { sendWelcomeEmail } = await import('@/lib/email');
                    await sendWelcomeEmail(email, name, 'VENUE_MANAGER', generatedPassword);

                    venueManagerId = user._id;
                } else if (mode === 'existing') {
                    const user = await User.findById(body.venueManagerDetails.id);
                    if (!user || user.role !== 'VENUE_MANAGER') {
                        return NextResponse.json({ success: false, error: 'Invalid Venue Manager selected' }, { status: 400 });
                    }
                    venueManagerId = user._id;
                }
            } else {
                return NextResponse.json({ success: false, error: 'Venue Manager details required for Super Admin' }, { status: 400 });
            }
        }

        const eventData = {
            ...body,
            venueManager: venueManagerId,
            createdBy: session.user.id
        };

        // Remove venueManagerDetails from body if it leaked in
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
