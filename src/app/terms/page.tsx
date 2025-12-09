import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="container py-12 prose dark:prose-invert max-w-4xl mx-auto">
                <h1>Terms and Conditions</h1>
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <h2>1. Introduction</h2>
                <p>Welcome to EventZone. By accessing our website and booking tickets, you agree to these terms.</p>

                <h2>2. Booking Policy</h2>
                <ul>
                    <li>All bookings are final and subject to availability.</li>
                    <li>Tickets must be presented at the venue for entry.</li>
                    <li>One ticket allows entry for one person unless specified otherwise.</li>
                </ul>

                <h2>3. Cancellation</h2>
                <p>Event organizers reserve the right to cancel or reschedule events. In such cases, refunds will be processed according to our Refund Policy.</p>

                <h2>4. Conduct</h2>
                <p>Attendees must adhere to venue rules and regulations. We reserve the right to refuse entry.</p>
            </main>
            <Footer />
        </div>
    );
}
