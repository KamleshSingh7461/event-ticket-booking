import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t bg-muted/50">
            <div className="container py-8 md:py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">EventZone</h3>
                        <p className="text-sm text-muted-foreground">
                            Your premium platform for booking events, online and offline.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/events">Browse Events</Link></li>
                            <li><Link href="/pricing">Pricing</Link></li>
                            <li><Link href="/partners">For Partners</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/help">Help Center</Link></li>
                            <li><Link href="/terms">Terms of Service</Link></li>
                            <li><Link href="/privacy">Privacy Policy</Link></li>
                            <li><Link href="/refunds">Refund Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>Email: support@eventzone.com</li>
                            <li>Phone: +1 234 567 890</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} EventZone. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
