'use client';
import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';

interface EventGalleryProps {
    images: string[];
}

export default function EventGallery({ images }: EventGalleryProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = current.clientWidth; // Scroll one full screen
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!images || images.length === 0) return null;

    return (
        <div className="w-full space-y-4 py-8 bg-black">
            <div className="flex items-center justify-between px-4 md:px-8 max-w-7xl mx-auto w-full">
                <h2 className="text-2xl font-bold text-white">Event Gallery</h2>
                <div className="flex gap-2">
                    <button onClick={() => scroll('left')} className="p-2 rounded-full border border-[#AE8638]/30 hover:bg-[#AE8638]/10 text-[#AE8638] transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => scroll('right')} className="p-2 rounded-full border border-[#AE8638]/30 hover:bg-[#AE8638]/10 text-[#AE8638] transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {images.map((img, idx) => (
                    <Dialog key={idx}>
                        <DialogTrigger asChild>
                            <div className="flex-none min-w-full w-full h-[35vh] md:h-[50vh] relative overflow-hidden cursor-pointer group snap-center bg-black/20 border border-[#AE8638]/10 rounded-lg">
                                <img
                                    src={img}
                                    alt={`Gallery Image ${idx + 1}`}
                                    className="w-full h-full object-contain bg-black/50"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <Maximize2 className="text-white w-12 h-12 drop-shadow-lg" />
                                </div>
                            </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-[100vw] w-[100vw] h-[100dvh] sm:h-auto p-0 bg-black/95 border-none shadow-none text-white backdrop-blur-md flex flex-col items-center justify-center m-0 gap-0 focus:outline-none">
                            <DialogTitle className="sr-only">Event Image {idx + 1}</DialogTitle>

                            {/* Close Button */}
                            <DialogTrigger asChild>
                                <button className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-sm border md:border-none border-white/20">
                                    <Maximize2 className="w-6 h-6 rotate-45" /> {/* Close Icon Simulation */}
                                </button>
                            </DialogTrigger>

                            <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-1 sm:p-4 md:p-10 pointer-events-none">
                                <img
                                    src={img}
                                    alt="Full View"
                                    className="max-w-full max-h-full w-auto h-auto object-contain pointer-events-auto"
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                ))}
            </div>
        </div>
    );
}
