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
                // Important: Wait for video to be ready before playing
                videoRef.current.onloadedmetadata = () => {
                    console.log('🎥 Video metadata loaded, playing...');
                    videoRef.current?.play().catch(e => console.error('Play error:', e));
                };

                streamRef.current = stream;
                setScanning(true);
                requestAnimationFrame(tick);
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
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log('Track stopped:', track.label);
            });
            streamRef.current = null;
        }
    };

    const tick = () => {
        if (!scanning) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video && canvas) {
            const ctx = canvas.getContext('2d');

            if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'attemptBoth',
                });

                if (code) {
                    console.log('🎉 QR Code Found:', code.data);
                    onResult(code.data);
                    // Debounce or stop logic handled by parent
                }
            } else {
                // console.log('Waiting for video data...', video.readyState);
            }
        }

        if (scanning) {
            requestAnimationFrame(tick);
        }
    };

    return (
        <div className="w-full aspect-square bg-black rounded-lg overflow-hidden relative">
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

            <div className="absolute inset-0 border-2 border-primary/50 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary rounded-lg shadow-[0_0_0_100vw_rgba(0,0,0,0.5)]"></div>
            </div>
        </div>
    );
}
