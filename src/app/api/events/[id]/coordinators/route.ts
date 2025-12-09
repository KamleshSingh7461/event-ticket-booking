import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import User from '@/models/User';
import Ticket from '@/models/Ticket';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';
import mongoose from 'mongoose';

// GET: Fetch coordinators assigned to this event with their stats
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== 'VENUE_MANAGER' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const event = await Event.findById(id).populate('assignedCoordinators', 'name email _id');

        if (!event) {
            return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
        }

        if (session.user.role === 'VENUE_MANAGER' && event.venueManager.toString() !== session.user.id) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }

        // Calculate stats for each coordinator
        const coordinatorsWithStats = await Promise.all(event.assignedCoordinators.map(async (coord: any) => {
            const scanCount = await Ticket.countDocuments({
                event: id,
                redeemedBy: coord._id
            });

            return {
                _id: coord._id,
                name: coord.name,
                email: coord.email,
                stats: {
                    ticketsScanned: scanCount
                }
            };
        }));

        return NextResponse.json({ success: true, data: coordinatorsWithStats });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST: Create and Assign Coordinator OR Assign Existing
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== 'VENUE_MANAGER' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const event = await Event.findById(id);

        if (!event) {
            return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
        }

        const body = await req.json();

        // Mode 1: Assign Existing (by ID)
        if (body.coordinatorId) {
            if (!event.assignedCoordinators.includes(body.coordinatorId)) {
                event.assignedCoordinators.push(body.coordinatorId);
                await event.save();
            }
            return NextResponse.json({ success: true, message: 'Coordinator assigned' });
        }

        // Mode 2: Create New & Assign
        if (body.name && body.email) {
            const { name, email } = body;

            // Check if user exists
            let user = await User.findOne({ email });
            if (user) {
                // If user exists but is not a coordinator, maybe upgrade? 
                // For now, if role is not COORDINATOR, reject or handle?
                // Assuming we just use existing if found, but check role.
                if (user.role !== 'COORDINATOR') {
                    return NextResponse.json({ success: false, error: 'User exists but is not a coordinator' }, { status: 400 });
                }

                // If exists and IS coordinator, just assign
                if (!event.assignedCoordinators.includes(user._id)) {
                    event.assignedCoordinators.push(user._id);
                    await event.save();
                }
                return NextResponse.json({ success: true, message: 'Existing coordinator assigned' });
            }

            // Create New Coordinator
            const generatedPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);

            user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: 'COORDINATOR',
                createdBy: session.user.id
            });

            // Assign to Event
            event.assignedCoordinators.push(user._id);
            await event.save();

            // Send Email
            try {
                await sendWelcomeEmail(email, name, 'COORDINATOR', generatedPassword);
            } catch (emailError) {
                console.error('Failed to send email:', emailError);
                // Continue execution, don't fail the request just for email
            }

            return NextResponse.json({ success: true, data: user });
        }

        return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE: Remove Coordinator from Event (Unassign)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'VENUE_MANAGER') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const event = await Event.findById(id);

        if (!event) return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });

        const { coordinatorId } = await req.json();

        event.assignedCoordinators = event.assignedCoordinators.filter(
            (cid: mongoose.Types.ObjectId) => cid.toString() !== coordinatorId
        );

        await event.save();

        return NextResponse.json({ success: true, message: 'Coordinator removed from event' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
