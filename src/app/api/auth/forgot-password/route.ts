import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // For security, don't reveal if user exists
            return NextResponse.json({ success: true, message: 'If an account exists, an email has been sent.' });
        }

        // Generate Token
        const token = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = Date.now() + 3600000; // 1 hour

        user.resetPasswordToken = token;
        user.resetPasswordExpires = tokenExpiry;
        await user.save();

        // Send Email
        await sendPasswordResetEmail(user.email, token);

        return NextResponse.json({ success: true, message: 'If an account exists, an email has been sent.' });

    } catch (error: any) {
        console.error('Forgot Password Error:', error);
        return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 });
    }
}
