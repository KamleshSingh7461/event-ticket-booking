'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Search, Shield, BarChart3, Globe, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/events');
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success) {
        setEvents(data.data.slice(0, 6)); // Show top 6 events
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white selection:bg-[#AE8638] selection:text-black">
      <Navbar />

      {/* Premium Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden border-b border-white/5">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#AE8638]/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-[#AE8638]/10 rounded-full blur-[150px] mix-blend-screen animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto space-y-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 border border-[#AE8638]/30 bg-[#AE8638]/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#AE8638]">
              <Zap className="w-4 h-4" /> Enterprise Event Management
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-[6rem] font-bold tracking-tighter text-white leading-[1.1]">
              Seamless Ticketing.<br />
              <span className="bg-gradient-to-r from-[#AE8638] via-[#F7EF8A] to-[#AE8638] bg-[length:200%_auto] animate-mesh bg-clip-text text-transparent">
                Exceptional Delivery.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl font-light leading-relaxed mx-auto md:mx-0">
              The premium standard for secure, high-performance event ticketing. Built for organizers who demand excellence.
            </p>

            {/* Glassmorphism Search Bar */}
            <div className="max-w-3xl pt-6 mx-auto md:mx-0">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#AE8638]/40 to-transparent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                <div className="relative flex flex-col sm:flex-row items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-2 gap-2 shadow-2xl">
                  <div className="relative w-full flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search for premium events, conferences..."
                      className="w-full pl-12 h-14 text-lg bg-transparent border-none text-white placeholder:text-gray-500 focus-visible:ring-0 rounded-lg"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full sm:w-auto h-14 px-8 bg-[#AE8638] hover:bg-[#F7EF8A] text-black font-bold text-base rounded-lg transition-colors shadow-[0_0_20px_rgba(174,134,56,0.3)]">
                    Explore
                  </Button>
                </div>
              </form>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 border-t border-white/5 mt-16">
               {[
                { label: 'Uptime', value: '99.99%' },
                { label: 'Secure', value: 'AES-256' },
                { label: 'Global', value: 'Access' },
                { label: 'Support', value: '24/7' },
              ].map((stat, idx) => (
                <div key={idx} className="flex flex-col items-center md:items-start space-y-1">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500 font-medium tracking-widest uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events - Dynamic Grid */}
      <section className="py-24 md:py-32 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Featured <span className="text-[#AE8638]">Engagements</span>
            </h2>
            <Link href="/events" className="text-sm font-semibold text-[#AE8638] hover:text-[#F7EF8A] transition-colors uppercase tracking-widest mt-4 md:mt-0 flex items-center gap-2 group">
              View Directory <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-[450px]" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="p-16 text-center bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
              <h3 className="text-xl font-medium text-white mb-2">No Active Events</h3>
              <p className="text-gray-400">The premium schedule is currently clear.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <Link key={event._id} href={event.isSoldOut ? '#' : `/events/${event._id}`} className={event.isSoldOut ? 'cursor-not-allowed opacity-60' : 'group'}>
                  <Card className="h-full bg-[#111111] border border-white/10 hover:border-[#AE8638]/50 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-[0_10px_40px_rgba(174,134,56,0.15)] flex flex-col hover:-translate-y-2">
                    <div className="relative h-64 overflow-hidden bg-black">
                      {event.banner ? (
                        <img
                          src={event.banner}
                          alt={event.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                          <Calendar className="w-12 h-12 text-[#AE8638]/50" />
                        </div>
                      )}
                      
                      {/* Gradient Overlay for text legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-80" />

                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-black/60 backdrop-blur-md border border-white/10 text-[#AE8638] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                          {event.type}
                        </span>
                        {event.isSoldOut && (
                          <span className="bg-red-950/80 backdrop-blur-md border border-red-500/50 text-red-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
                            Sold Out
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <CardContent className="p-8 flex-1 flex flex-col justify-between relative z-10 bg-[#111111]">
                      <div>
                        <h3 className="font-bold text-2xl text-white leading-tight mb-4 group-hover:text-[#AE8638] transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                      
                      <div className="space-y-4 pt-6 mt-6 border-t border-white/10">
                        <div className="flex items-center text-sm text-gray-400">
                          <Calendar className="w-4 h-4 mr-3 text-[#AE8638]" />
                          {new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        {event.type === 'OFFLINE' && (
                          <div className="flex items-center text-sm text-gray-400">
                            <MapPin className="w-4 h-4 mr-3 text-[#AE8638]" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center pt-4">
                          <span className="text-2xl font-bold text-white">
                            ₹{event.ticketConfig?.price?.toLocaleString()}
                          </span>
                          {!event.isSoldOut && (
                             <div className="w-10 h-10 rounded-full border border-[#AE8638]/30 flex items-center justify-center group-hover:bg-[#AE8638] group-hover:text-black transition-colors">
                               <ArrowRight className="w-5 h-5" />
                             </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bento Box Capabilities */}
      <section className="py-24 bg-black border-y border-white/5 relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Engineered for Scale.</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light">
              Robust infrastructure for high-volume ticketing, secure access control, and comprehensive analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Box 1 */}
            <div className="col-span-1 md:col-span-2 bg-[#111] border border-white/10 rounded-3xl p-8 hover:border-[#AE8638]/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] group-hover:bg-green-500/20 transition-colors pointer-events-none" />
              <Shield className="w-10 h-10 text-[#AE8638] mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">Bank-Grade Security</h3>
              <p className="text-gray-400 font-light max-w-md">End-to-end encryption for all transactions. Role-based access control and comprehensive audit logs ensure your data and revenue are always protected.</p>
              <div className="mt-8 space-y-3">
                {['PCI-DSS Compliant Processing', 'Automated Fraud Prevention', 'Encrypted Ticket QR Codes'].map((t, i) => (
                  <div key={i} className="flex items-center text-sm text-gray-300">
                     <CheckCircle2 className="w-4 h-4 text-green-500 mr-3" /> {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Box 2 */}
            <div className="col-span-1 bg-[#111] border border-white/10 rounded-3xl p-8 hover:border-[#AE8638]/50 transition-colors group relative overflow-hidden flex flex-col justify-between">
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] group-hover:bg-blue-500/20 transition-colors pointer-events-none" />
              <div>
                <Globe className="w-10 h-10 text-[#AE8638] mb-6" />
                <h3 className="text-2xl font-bold text-white mb-3">Global Access</h3>
                <p className="text-gray-400 font-light text-sm">Deploy events worldwide with multi-currency support and localized infrastructure for blazing fast response times.</p>
              </div>
              <div className="mt-8 pt-8 border-t border-white/10">
                 <div className="text-4xl font-black text-white">99.9%</div>
                 <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Uptime SLA</div>
              </div>
            </div>

            {/* Box 3 */}
            <div className="col-span-1 md:col-span-3 bg-[#111] border border-white/10 rounded-3xl p-8 hover:border-[#AE8638]/50 transition-colors group relative overflow-hidden">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#AE8638]/5 rounded-full blur-[100px] group-hover:bg-[#AE8638]/10 transition-colors pointer-events-none" />
               <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                 <div className="flex-1">
                    <BarChart3 className="w-10 h-10 text-[#AE8638] mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-3">Real-time Analytics</h3>
                    <p className="text-gray-400 font-light max-w-lg mb-6">Make data-driven decisions with live attendance tracking, revenue dashboards, and comprehensive demographic reporting.</p>
                    <Link href="/demo" className="inline-flex items-center text-[#AE8638] hover:text-[#F7EF8A] text-sm font-bold uppercase tracking-widest transition-colors">
                      View Demo Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                 </div>
                 
                 {/* Abstract Chart Graphic */}
                 <div className="flex-1 w-full max-w-sm flex items-end justify-between h-32 gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                    {[30, 50, 40, 70, 60, 90, 80].map((height, i) => (
                      <div key={i} className="w-full bg-white/5 rounded-t-md relative overflow-hidden group-hover:bg-white/10 transition-colors">
                        <div 
                          className="absolute bottom-0 w-full bg-gradient-to-t from-[#AE8638] to-[#F7EF8A] rounded-t-md transition-all duration-1000 ease-out" 
                          style={{ height: `${height}%`, transitionDelay: `${i * 100}ms` }}
                        />
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grand CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-[#AE8638]/20" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

        <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
            Initiate Your Deployment.
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-12 font-light max-w-2xl mx-auto leading-relaxed">
            Register your organization today and access the industry's most powerful event management tools. Join the network of top-tier professionals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto h-14 px-10 bg-[#AE8638] text-black hover:bg-[#F7EF8A] rounded-xl font-bold text-base transition-colors shadow-[0_0_30px_rgba(174,134,56,0.3)] hover:shadow-[0_0_50px_rgba(174,134,56,0.5)]">
                Create Organization <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/events">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 border-white/20 text-white bg-transparent hover:bg-white/10 rounded-xl font-medium text-base transition-colors backdrop-blur-md">
                View Directory
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
