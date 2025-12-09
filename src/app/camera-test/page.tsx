'use client';

import { useEffect, useRef, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CameraTestPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string>('');
    const [stream, setStream] = useState<MediaStream | null>(null);

    const startCamera = async () => {
        try {
            setError('');
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
            }
        } catch (err: any) {
            setError(`Camera Error: ${err.message}`);
            console.error('Camera error:', err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container py-8 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Camera Test</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Button onClick={startCamera}>Start Camera</Button>
                            <Button onClick={stopCamera} variant="outline">Stop Camera</Button>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="text-sm text-muted-foreground space-y-2">
                            <p><strong>Instructions:</strong></p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Click "Start Camera"</li>
                                <li>Allow camera access when prompted</li>
                                <li>If you see video, camera works!</li>
                                <li>If you see an error, camera is blocked</li>
                            </ol>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
