import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // Check if any event exists
        const count = await Event.countDocuments();
        if (count > 0) {
            return NextResponse.json({ message: 'Events already seeded', count });
        }

        const sampleEvent = {
            title: "Summer Music Festival 2024",
            description: "Experience the biggest music festival of the year with top artists from around the globe. Join us for a weekend of music, food, and fun!",
            type: "OFFLINE",
            venue: "Central City Park, NY",
            startDate: new Date("2024-07-15T18:00:00"),
            endDate: new Date("2024-07-15T23:00:00"),
            ticketConfig: {
                price: 499,
                currency: "INR",
                quantity: 1000,
                offers: [
                    {
                        code: "EARLYBIRD",
                        discountPercentage: 10,
                        description: "Early bird discount"
                    }
                ]
            },
            subHeadings: [
                {
                    title: "Lineup",
                    content: "Artist A, Artist B, Artist C"
                },
                {
                    title: "Terms",
                    content: "No refunds. Age 18+ only."
                }
            ],
            isActive: true
        };

        const event = await Event.create(sampleEvent);
        return NextResponse.json({ success: true, message: 'Seeded successfully', data: event });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
