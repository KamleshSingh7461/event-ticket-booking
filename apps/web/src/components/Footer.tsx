import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-[#0A0A0A] text-white py-16 md:py-24 border-t border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[#AE8638]/50 to-transparent" />
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center space-x-3 group mb-6">
                            <img src="https://res.cloudinary.com/desdbjzzt/image/upload/v1777203252/logo_yswfeg.png" alt="WYLDCARD Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
                            <div className="flex flex-col">
                                <span className="text-base font-black tracking-widest text-white uppercase leading-none">WYLDCARD</span>
                                <span className="text-[10px] font-semibold tracking-[0.3em] text-[#AE8638] uppercase">Stats</span>
                            </div>
                        </Link>
                        <p className="text-sm text-gray-400 font-light leading-relaxed">
                            Enterprise-grade ticketing infrastructure for the world's most demanding event organizers. Built for scale.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#AE8638] mb-6">Platform</h4>
                        <ul className="space-y-4 text-sm text-gray-400 font-medium">
                            <li><Link href="/events" className="hover:text-white transition-colors">Directory</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="/partners" className="hover:text-white transition-colors">Enterprise API</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#AE8638] mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-gray-400 font-medium">
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/refunds" className="hover:text-white transition-colors">Refund Policy</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#AE8638] mb-6">Contact</h4>
                        <ul className="space-y-4 text-sm text-gray-400 font-medium">
                            <li><a href="mailto:support@wildcardstat.com" className="hover:text-white transition-colors">support@wildcardstat.com</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-xs text-gray-500 font-medium tracking-widest uppercase">
                        © 2025 WYLDCARD STATS PVT LTD.
                    </div>
                </div>
            </div>
        </footer>
    );
}
