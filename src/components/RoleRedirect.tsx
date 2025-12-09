'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function RoleRedirect() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role) {
            switch (session.user.role) {
                case 'SUPER_ADMIN':
                    router.push('/admin/dashboard');
                    break;
                case 'VENUE_MANAGER':
                    router.push('/venue-manager/dashboard');
                    break;
                case 'COORDINATOR':
                    router.push('/coordinator/dashboard');
                    break;
                case 'USER':
                    router.push('/user/dashboard');
                    break;
                default:
                    router.push('/');
            }
        } else if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [session, status, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}
