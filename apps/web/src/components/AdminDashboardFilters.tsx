'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function AdminDashboardFilters({ events }: { events: { id: string, title: string }[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [eventId, setEventId] = useState(searchParams.get('eventId') || 'ALL');
    const [from, setFrom] = useState(searchParams.get('from') || '');
    const [to, setTo] = useState(searchParams.get('to') || '');

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (eventId !== 'ALL') params.set('eventId', eventId);
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        
        router.push(`/admin/dashboard?${params.toString()}`);
    };

    const clearFilters = () => {
        setEventId('ALL');
        setFrom('');
        setTo('');
        router.push('/admin/dashboard');
    };

    return (
        <div className="bg-neutral-900/50 border border-[#AE8638]/20 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-end mb-8">
            <div className="space-y-1 w-full md:w-1/3">
                <label className="text-xs text-[#AE8638]">Filter by Event</label>
                <Select value={eventId} onValueChange={setEventId}>
                    <SelectTrigger className="bg-black border-[#AE8638]/30 text-white">
                        <SelectValue placeholder="All Events" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-[#AE8638]/30 text-white">
                        <SelectItem value="ALL">All Events</SelectItem>
                        {events.map(ev => (
                            <SelectItem key={ev.id} value={ev.id}>{ev.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="space-y-1 w-full md:w-1/4">
                <label className="text-xs text-[#AE8638]">From Date</label>
                <Input 
                    type="date" 
                    value={from} 
                    onChange={(e) => setFrom(e.target.value)} 
                    className="bg-black border-[#AE8638]/30 text-white scheme-dark"
                />
            </div>
            
            <div className="space-y-1 w-full md:w-1/4">
                <label className="text-xs text-[#AE8638]">To Date</label>
                <Input 
                    type="date" 
                    value={to} 
                    onChange={(e) => setTo(e.target.value)} 
                    className="bg-black border-[#AE8638]/30 text-white scheme-dark"
                />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
                <Button onClick={applyFilters} className="bg-[#AE8638] text-black hover:bg-[#AE8638]/90 font-bold">
                    Apply
                </Button>
                <Button onClick={clearFilters} variant="outline" className="border-[#AE8638]/30 text-[#AE8638] hover:bg-[#AE8638]/10">
                    Clear
                </Button>
            </div>
        </div>
    );
}
