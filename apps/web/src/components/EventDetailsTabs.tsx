'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { CalendarClock, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

interface SubHeading {
    title: string;
    content: string;
}

interface EventDetailsTabsProps {
    description: string;
    schedule: string[];
    subHeadings: SubHeading[];
}

export default function EventDetailsTabs({ description, schedule, subHeadings }: EventDetailsTabsProps) {
    const [activeTab, setActiveTab] = useState<'about' | 'schedule' | 'terms'>('about');

    return (
        <div className="bg-[#111111] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            {/* Tab Buttons */}
            <div className="flex border-b border-white/10 bg-black/40">
                <button
                    onClick={() => setActiveTab('about')}
                    className={`flex-1 py-4 text-xs md:text-sm uppercase tracking-widest font-bold transition-colors border-b-2 ${activeTab === 'about'
                        ? 'border-[#AE8638] text-[#AE8638] bg-white/5'
                        : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`flex-1 py-4 text-xs md:text-sm uppercase tracking-widest font-bold transition-colors border-b-2 ${activeTab === 'schedule'
                        ? 'border-[#AE8638] text-[#AE8638] bg-white/5'
                        : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                >
                    Schedule
                </button>
                <button
                    onClick={() => setActiveTab('terms')}
                    className={`flex-1 py-4 text-xs md:text-sm uppercase tracking-widest font-bold transition-colors border-b-2 ${activeTab === 'terms'
                        ? 'border-[#AE8638] text-[#AE8638] bg-white/5'
                        : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                >
                    Policies
                </button>
            </div>

            {/* Content Area */}
            <div className="p-8">
                {activeTab === 'about' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="prose prose-invert max-w-none">
                            <p className="whitespace-pre-line leading-relaxed text-gray-300 font-light text-base md:text-lg">{description}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 relative group/slider">
                        {schedule && schedule.length > 0 ? (
                            <>
                                {/* Navigation Buttons */}
                                <div className="absolute top-1/2 -translate-y-1/2 left-0 z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            const container = document.getElementById('schedule-slider');
                                            if (container) container.scrollBy({ left: -container.clientWidth, behavior: 'smooth' });
                                        }}
                                        className="p-2 m-2 bg-[#111] border border-white/20 shadow-xl hover:bg-[#AE8638] text-white hover:text-black transition-colors rounded-full"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="absolute top-1/2 -translate-y-1/2 right-0 z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            const container = document.getElementById('schedule-slider');
                                            if (container) container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
                                        }}
                                        className="p-2 m-2 bg-[#111] border border-white/20 shadow-xl hover:bg-[#AE8638] text-white hover:text-black transition-colors rounded-full"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Slider Container */}
                                <div
                                    id="schedule-slider"
                                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide border border-white/10 bg-black/50 rounded-xl"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {schedule.map((img, idx) => (
                                        <div key={idx} className="flex-none w-full min-w-full snap-center relative">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <div className="w-full cursor-pointer relative group/item h-[60vh] flex items-center justify-center bg-transparent">
                                                        <img
                                                            src={img}
                                                            alt={`Schedule ${idx + 1}`}
                                                            className="w-full h-full object-contain"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/60 transition-colors flex items-center justify-center opacity-0 group-hover/item:opacity-100 backdrop-blur-[2px]">
                                                            <Maximize2 className="text-[#AE8638] w-12 h-12" />
                                                        </div>
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-5xl w-full p-0 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl">
                                                    <div className="relative w-full h-[90vh] flex items-center justify-center pointer-events-none p-4">
                                                        <img
                                                            src={img}
                                                            alt="Full View"
                                                            className="max-w-full max-h-full object-contain pointer-events-auto"
                                                        />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-center text-xs text-gray-500 mt-4 md:hidden uppercase tracking-widest font-bold">
                                    Swipe to view timeline
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-500 bg-black/20 border border-dashed border-white/10 rounded-xl">
                                <CalendarClock className="w-12 h-12 mb-4 opacity-50" />
                                <p className="font-light uppercase tracking-widest text-xs">No schedule available.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'terms' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
                        {subHeadings && subHeadings.length > 0 ? (
                            subHeadings.map((sub, idx) => (
                                <div key={idx} className="space-y-3">
                                    <h3 className="text-base font-bold uppercase tracking-widest text-white border-l-2 border-[#AE8638] pl-3">{sub.title}</h3>
                                    <p className="text-gray-400 whitespace-pre-line leading-relaxed text-sm font-light pl-3">{sub.content}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8 font-light italic">No policy documents attached to this event.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
