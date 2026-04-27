import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function AdminRoot() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'SUPER_ADMIN') {
    redirect('/admin/dashboard');
  } else if (session.user.role === 'VENUE_MANAGER') {
    redirect('/venue-manager/dashboard');
  } else if (session.user.role === 'COORDINATOR') {
    redirect('/coordinator/dashboard');
  } else {
    // Fallback for unauthorized roles
    redirect(`${process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000'}`);
  }
}
