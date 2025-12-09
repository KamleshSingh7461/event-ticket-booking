import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="container py-12 prose dark:prose-invert max-w-4xl mx-auto">
                <h1>Privacy Policy</h1>
                <p>Your privacy is important to us.</p>

                <h2>1. Information Collection</h2>
                <p>We collect information you provide such as name, email, phone number, age, and gender when you book a ticket.</p>

                <h2>2. Usage of Information</h2>
                <ul>
                    <li>To process your booking and send tickets.</li>
                    <li>To communicate event updates.</li>
                    <li>To improve our services.</li>
                </ul>

                <h2>3. Data Sharing</h2>
                <p>We do not sell your personal data. Data is shared with payment processors (PayU) solely for transaction purposes.</p>
            </main>
            <Footer />
        </div>
    );
}
