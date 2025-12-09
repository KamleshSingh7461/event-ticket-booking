import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin } from 'lucide-react';

interface EventProps {
    _id: string;
    title: string;
    description: string;
    startDate: string;
    ticketConfig: {
        price: number;
        currency: string;
    };
    venue?: string;
    type: 'ONLINE' | 'OFFLINE';
}

export function EventCard({ event }: { event: EventProps }) {
    const date = new Date(event.startDate).toLocaleDateString();

    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-none bg-card/50 backdrop-blur-sm ring-1 ring-white/10">
            <div className="aspect-video bg-muted relative overflow-hidden">
                {/* Placeholder for image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    {/* Image would actully go here */}
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse absolute inset-0 -z-10" />
                    <span className="text-white font-bold text-lg drop-shadow-md bg-black/50 px-2 py-1 rounded">
                        {event.title}
                    </span>
                </div>
            </div>
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {event.title}
                    </h3>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {event.type}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{date}</span>
                </div>
                {event.type === 'OFFLINE' && (
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{event.venue || 'TBA'}</span>
                    </div>
                )}
                <p className="line-clamp-2 mt-2">{event.description}</p>
            </CardContent>
            <CardFooter className="p-4 pt-2 border-t bg-muted/20 flex justify-between items-center">
                <div className="font-bold text-lg">
                    {event.ticketConfig.currency} {event.ticketConfig.price}
                </div>
                <Button asChild size="sm" className="rounded-full">
                    <Link href={`/events/${event._id}`}>
                        Book Now
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
