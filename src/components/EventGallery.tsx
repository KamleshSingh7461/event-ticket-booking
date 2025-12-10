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
                            <div className="flex-none min-w-full w-full h-[35vh] md:h-[50vh] relative overflow-hidden cursor-pointer group snap-center bg-muted">
                                <img
                                    src={img}
                                    alt={`Gallery Image ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <Maximize2 className="text-white w-12 h-12 drop-shadow-lg" />
                                </div>
                            </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-7xl w-full p-0 bg-transparent border-none shadow-none text-white">
                            <DialogTitle className="sr-only">Event Image {idx + 1}</DialogTitle>
                            <div className="relative w-full h-[90vh] flex items-center justify-center pointer-events-none">
                                <img
                                    src={img}
                                    alt="Full View"
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl pointer-events-auto"
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                ))}
            </div>
        </div>
    );
}
