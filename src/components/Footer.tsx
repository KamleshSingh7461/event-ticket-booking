import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t bg-[#AE8638] text-black">
            <div className="container py-8 md:py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-black">WYLDCARD STATS PRIVATE LIMITED</h3>
                        <p className="text-sm text-black/80 font-medium">
                            Your premium platform for booking events, online and offline.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-black">Platform</h4>
                        <ul className="space-y-2 text-sm text-black/80 font-medium">
                            <li><Link href="/events" className="hover:text-black hover:underline">Browse Events</Link></li>
                            <li><Link href="/pricing" className="hover:text-black hover:underline">Pricing</Link></li>
                            <li><Link href="/partners" className="hover:text-black hover:underline">For Partners</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-black">Support</h4>
                        <ul className="space-y-2 text-sm text-black/80 font-medium">
                            <li><Link href="/help" className="hover:text-black hover:underline">Help Center</Link></li>
                            <li><Link href="/terms" className="hover:text-black hover:underline">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-black hover:underline">Privacy Policy</Link></li>
                            <li><Link href="/refunds" className="hover:text-black hover:underline">Refund Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-black">Contact</h4>
                        <ul className="space-y-2 text-sm text-black/80 font-medium">
                            <li>Email: supports@wildcardstat.com</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-black/10 text-center text-sm text-black/60 font-medium">
                    © {new Date().getFullYear()} WYLDCARD STATS PRIVATE LIMITED. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
