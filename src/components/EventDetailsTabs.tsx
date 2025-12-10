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
        <div className="bg-black border border-[#AE8638]/20 rounded-xl overflow-hidden shadow-sm">
            {/* Tab Buttons */}
            <div className="flex border-b border-[#AE8638]/20 bg-black">
                <button
                    onClick={() => setActiveTab('about')}
                    className={`flex-1 py-4 text-sm md:text-base font-bold transition-colors border-b-4 ${activeTab === 'about'
                        ? 'border-[#AE8638] text-[#AE8638] bg-[#AE8638]/10'
                        : 'border-transparent text-[#AE8638]/60 hover:text-[#AE8638] hover:bg-[#AE8638]/5'
                        }`}
                >
                    About the Event
                </button>
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`flex-1 py-4 text-sm md:text-base font-bold transition-colors border-b-4 ${activeTab === 'schedule'
                        ? 'border-[#AE8638] text-[#AE8638] bg-[#AE8638]/10'
                        : 'border-transparent text-[#AE8638]/60 hover:text-[#AE8638] hover:bg-[#AE8638]/5'
                        }`}
                >
                    Schedule
                </button>
                <button
                    onClick={() => setActiveTab('terms')}
                    className={`flex-1 py-4 text-sm md:text-base font-bold transition-colors border-b-4 ${activeTab === 'terms'
                        ? 'border-[#AE8638] text-[#AE8638] bg-[#AE8638]/10'
                        : 'border-transparent text-[#AE8638]/60 hover:text-[#AE8638] hover:bg-[#AE8638]/5'
                        }`}
                >
                    Terms & Condition
                </button>
            </div>

            {/* Content Area */}
            <div className="p-6">
                {activeTab === 'about' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="prose dark:prose-invert max-w-none">
                            <p className="whitespace-pre-line leading-relaxed text-[#AE8638]/90">{description}</p>
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
                                        className="p-2 m-2 rounded-full bg-black/80 backdrop-blur-sm border border-[#AE8638]/30 shadow-lg hover:bg-black hover:text-[#AE8638] text-[#AE8638] transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="absolute top-1/2 -translate-y-1/2 right-0 z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            const container = document.getElementById('schedule-slider');
                                            if (container) container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
                                        }}
                                        className="p-2 m-2 rounded-full bg-black/80 backdrop-blur-sm border border-[#AE8638]/30 shadow-lg hover:bg-black hover:text-[#AE8638] text-[#AE8638] transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Slider Container */}
                                <div
                                    id="schedule-slider"
                                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-lg border border-[#AE8638]/20 bg-[#AE8638]/5"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {schedule.map((img, idx) => (
                                        <div key={idx} className="flex-none w-full min-w-full snap-center relative">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <div className="w-full cursor-pointer relative group/item h-[60vh] flex items-center justify-center bg-black/5">
                                                        <img
                                                            src={img}
                                                            alt={`Schedule ${idx + 1}`}
                                                            className="w-full h-full object-contain"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/item:opacity-100">
                                                            <Maximize2 className="text-[#AE8638] w-12 h-12 drop-shadow-lg" />
                                                        </div>
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-5xl w-full p-0 bg-transparent border-none shadow-none">
                                                    <div className="relative w-full h-[90vh] flex items-center justify-center pointer-events-none">
                                                        <img
                                                            src={img}
                                                            alt="Full View"
                                                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl pointer-events-auto"
                                                        />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-center text-xs text-[#AE8638]/60 mt-2 md:hidden">
                                    Swipe to see more pages
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-[#AE8638]/60 bg-[#AE8638]/5 rounded-lg border border-dashed border-[#AE8638]/30">
                                <CalendarClock className="w-12 h-12 mb-3 opacity-50" />
                                <p>No schedule available yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'terms' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
                        {subHeadings && subHeadings.length > 0 ? (
                            subHeadings.map((sub, idx) => (
                                <div key={idx} className="space-y-2">
                                    <h3 className="text-lg font-semibold text-[#AE8638]">{sub.title}</h3>
                                    <p className="text-[#AE8638]/90 whitespace-pre-line leading-relaxed text-sm">{sub.content}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8 italic">No specific terms or additional information provided.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
