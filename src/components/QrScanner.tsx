'use client';

import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

interface QrScannerProps {
    onResult: (result: string) => void;
}

export default function QrScanner({ onResult }: QrScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const streamRef = useRef<MediaStream | null>(null);
    const scanningRef = useRef(false); // Use ref to avoid closure issues

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        console.log('📷 QR Scanner: Requesting camera access...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            console.log('✅ QR Scanner: Camera access granted', stream.id);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;

                // Important: Wait for video to be ready before playing
                videoRef.current.onloadedmetadata = () => {
                    console.log('🎥 Video metadata loaded, playing...');
                    videoRef.current?.play().catch(e => console.error('Play error:', e));
                };

                setScanning(true);
                scanningRef.current = true;
                // Start scanning loop immediately
                console.log('🚀 Starting scan loop...');
                setTimeout(() => tick(), 100); // Small delay to ensure state is set
            }
        } catch (err: any) {
            const errorMsg = err?.name === 'NotAllowedError'
                ? 'Camera permission denied. Please allow access.'
                : `Camera error: ${err.message || 'Unknown error'}`;

            setError(errorMsg);
            console.error('❌ QR Scanner Error:', err);
        }
    };

    const stopCamera = () => {
        console.log('🛑 QR Scanner: Stopping camera...');
        setScanning(false);
        scanningRef.current = false;
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log('Track stopped:', track.label);
            });
            streamRef.current = null;
        }
    };

    const tick = () => {
        // Always schedule next frame first to ensure loop continues
        if (scanningRef.current) {
            requestAnimationFrame(tick);
        } else {
            console.log('⏹️ Scan loop stopped');
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) {
            console.log('❌ Video or Canvas ref is null');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
            // Video not ready yet, skip this frame
            return;
        }

        if (video.paused || video.ended) {
            // Video paused, skip this frame
            return;
        }

        // Optimization: Limit scan resolution to max 800px width for performance
        const MAX_WIDTH = 800;
        const scale = Math.min(1, MAX_WIDTH / video.videoWidth);

        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;

        // Draw scaled image
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Log scan attempt every 60 frames (about 1 second)
        if (Math.random() < 0.016) {
            console.log(`🔍 Scanning... (${canvas.width}x${canvas.height})`);
        }

        // Attempt scan
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
        });

        if (code) {
            console.log('🎉 QR Code Found:', code.data);
            onResult(code.data);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                if (canvas) {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height, {
                            inversionAttempts: 'attemptBoth',
                        });
                        if (code) {
                            console.log('📂 File QR Found:', code.data);
                            onResult(code.data);
                        } else {
                            setError('No QR code found in image');
                        }
                    }
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="w-full bg-black rounded-lg overflow-hidden relative flex flex-col gap-2">
            <div className="relative w-full aspect-square bg-black mb-2 overflow-hidden rounded-lg">
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10 p-4">
                        <div className="text-center text-white space-y-3">
                            <p className="text-sm font-semibold">Camera Access Required</p>
                            <p className="text-xs text-white/70">{error}</p>
                            <button
                                onClick={() => {
                                    setError(null);
                                    startCamera();
                                }}
                                className="mt-2 px-4 py-2 bg-primary text-white text-xs rounded hover:bg-primary/90"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />

                <canvas ref={canvasRef} className="hidden" />

                {/* Scanning indicator */}
                {scanning && !error && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                        📷 Scanning...
                    </div>
                )}

                {/* Scanning frame overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-[#AE8638] rounded-lg shadow-[0_0_0_100vw_rgba(0,0,0,0.5)]"></div>
                </div>
            </div>

            <div className="mt-2 text-center">
                <p className="text-xs text-gray-400 mb-2">- OR -</p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#AE8638]/10 hover:bg-[#AE8638]/20 border border-[#AE8638]/30 rounded-lg cursor-pointer transition-colors text-sm text-[#AE8638]">
                    <span>Upload QR Image</span>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </label>
            </div>
        </div>
    );
}
