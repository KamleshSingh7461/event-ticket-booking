import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET /api/user/profile — return current user's name, email, phone
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(session.user.id).select('name email phone').lean() as any;

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PATCH /api/user/profile — update name and/or phone
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, phone } = body;

        if (!name || name.trim() === '') {
            return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
        }

        await dbConnect();
        await User.findByIdAndUpdate(session.user.id, {
            name: name.trim(),
            phone: phone?.trim() || '',
            updatedAt: new Date(),
        });

        return NextResponse.json({ success: true, message: 'Profile updated successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
