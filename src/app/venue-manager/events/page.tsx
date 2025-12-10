
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Edit, Eye, Settings, BarChart2 } from 'lucide-react';

export default function VenueManagerEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/venue-manager/events')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setEvents(data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-[#AE8638] animate-pulse">Loading Events...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Events</h1>
                    <p className="text-gray-400 mt-1">Manage and track your assigned events</p>
                </div>
            </header>

            {events.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-gray-800 rounded-lg">
                    <p className="text-gray-500">No events assigned yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <Card key={event._id} className="bg-black border border-[#AE8638]/30 hover:border-[#AE8638] transition-all duration-300 group overflow-hidden">
                            {/* Banner Image Area */}
                            <div className="h-48 w-full bg-gray-900 relative">
                                {event.banner ? (
                                    <img
                                        src={event.banner}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-700 bg-gray-900">
                                        No Banner
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <Badge variant="outline" className="bg-black/70 text-[#AE8638] border-[#AE8638]">
                                        {event.type}
                                    </Badge>
                                </div>
                            </div>

                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl font-bold text-white truncate">{event.title}</CardTitle>
                                <CardDescription className="flex items-center gap-2 text-gray-400 text-xs">
                                    <Calendar className="w-3 h-3 text-[#AE8638]" />
                                    {new Date(event.startDate).toLocaleDateString()}
                                    {event.type === 'OFFLINE' && (
                                        <>
                                            <span className="mx-1">•</span>
                                            <MapPin className="w-3 h-3 text-[#AE8638]" />
                                            <span className="truncate max-w-[150px]">{event.venue}</span>
                                        </>
                                    )}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center text-sm border-t border-gray-800 pt-3">
                                    <div>
                                        <p className="text-gray-500 text-xs">Price</p>
                                        <p className="font-medium text-[#AE8638]">{event.ticketConfig.currency} {event.ticketConfig.price}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 text-xs">Capacity</p>
                                        <p className="font-medium text-white">{event.ticketConfig?.quantity || 'N/A'}/day</p>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="grid grid-cols-2 gap-3 pt-2">
                                <Link href={`/venue-manager/events/${event._id}`} className="w-full">
                                    <Button className="w-full bg-[#AE8638] hover:bg-[#AE8638]/90 text-black font-bold text-xs">
                                        <BarChart2 className="w-3 h-3 mr-2" />
                                        Manage & Stats
                                    </Button>
                                </Link>
                                <Link href={`/venue-manager/events/${event._id}/edit`} className="w-full">
                                    <Button variant="outline" className="w-full border-[#AE8638]/30 text-gray-300 hover:text-white hover:bg-[#AE8638]/10 text-xs">
                                        <Settings className="w-3 h-3 mr-2" />
                                        Config
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
