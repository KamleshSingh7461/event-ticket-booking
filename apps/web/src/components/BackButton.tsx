'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ className = '' }: { className?: string }) {
    const router = useRouter();

    return (
        <Button
            variant="ghost"
            size="sm"
            className={`gap-2 text-muted-foreground hover:text-foreground ${className}`}
            onClick={() => router.back()}
        >
            <ArrowLeft className="w-4 h-4" />
            Back
        </Button>
    );
}
