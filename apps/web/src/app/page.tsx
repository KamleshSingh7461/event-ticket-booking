'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Search, Sparkles, TrendingUp, Users, Zap, ArrowRight, Star } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Minimal Corporate Hero Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="inline-block border border-black px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-black">
              Enterprise Event Management
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-[5.5rem] font-medium tracking-tight text-black leading-[1.05]">
              Seamless Ticketing.<br />
              <span className="text-gray-800">Professional Delivery.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl font-light leading-relaxed">
              The industry standard for secure, reliable event ticketing. Designed for organizers who demand excellence and attendees who expect perfection.
            </p>

            {/* Stark Search Bar */}
            <div className="max-w-3xl pt-8">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search global events, conferences, and seminars..."
                    className="w-full pl-12 h-14 text-lg bg-gray-50 border-gray-200 text-black placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-black rounded-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto h-14 px-8 bg-black hover:bg-gray-800 text-white font-medium text-base rounded-none transition-colors">
                  Search
                </Button>
              </form>
            </div>

            {/* Corporate Stats inline */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-gray-100 mt-16">
               {[
                { label: 'Uptime', value: '99.99%' },
                { label: 'Secure Transactions', value: '100%' },
                { label: 'Global Events', value: 'Live' },
                { label: 'Enterprise Support', value: '24/7' },
              ].map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-2xl font-semibold text-black">{stat.value}</div>
                  <div className="text-sm text-gray-500 font-medium tracking-wide uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events - Minimalist Grid */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 border-b border-gray-200 pb-6">
            <h2 className="text-3xl font-semibold text-black tracking-tight">Featured Engagements</h2>
            <Link href="/events" className="text-sm font-semibold text-black hover:underline transition-all uppercase tracking-widest mt-4 md:mt-0 flex items-center gap-2">
              View Directory <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white border border-gray-100 h-96" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="p-16 text-center bg-white border border-gray-200">
              <h3 className="text-xl font-medium text-black mb-2">No Active Events</h3>
              <p className="text-gray-500">The schedule is currently clear.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <Link key={event._id} href={event.isSoldOut ? '#' : `/events/${event._id}`} className={event.isSoldOut ? 'cursor-not-allowed opacity-50 grayscale' : ''}>
                  <Card className="h-full bg-white border border-gray-200 hover:border-black rounded-none shadow-none transition-colors group flex flex-col">
                    <div className="relative h-60 overflow-hidden bg-gray-100">
                      {event.banner ? (
                        <img
                          src={event.banner}
                          alt={event.title}
                          className="w-full h-full object-cover mix-blend-multiply"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                          {event.type}
                        </span>
                        {event.isSoldOut && (
                          <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                            Sold Out
                          </span>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-semibold text-xl text-black leading-tight group-hover:underline transition-all">
                            {event.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-6 leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                      
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-3 text-black" />
                          {new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        {event.type === 'OFFLINE' && (
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-3 text-black" />
                            <span className="truncate">{event.venue}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-4">
                          <span className="text-lg font-medium text-black">
                            ₹{event.ticketConfig?.price?.toLocaleString()}
                          </span>
                          <span className="text-sm font-semibold text-black uppercase tracking-wider group-hover:underline">
                            Register &rarr;
                          </span>
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

      {/* Corporate Features */}
      <section className="py-24 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-medium text-black mb-6 tracking-tight">Engineered for Scale.</h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed font-light">
                Wyldcard Stats provides a robust infrastructure for managing high-volume ticketing, secure access control, and comprehensive analytics for professional event organizers.
              </p>
              <ul className="space-y-6">
                {[
                  { title: 'Bank-Grade Security', desc: 'End-to-end encryption for all transactions.' },
                  { title: 'Real-time Analytics', desc: 'Actionable data on attendance and revenue.' },
                  { title: 'Seamless Integration', desc: 'API-first architecture for enterprise needs.' }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="flex-shrink-0 w-1.5 h-1.5 mt-2.5 bg-black rounded-none mr-4" />
                    <div>
                      <h4 className="text-base font-semibold text-black">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* CSS Dashboard Mockup */}
            <div className="relative aspect-square w-full rounded-sm border border-gray-200 bg-white shadow-2xl overflow-hidden flex flex-col">
              {/* Dashboard Header */}
              <div className="h-12 border-b border-gray-100 bg-gray-50 flex items-center px-4 justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">WYLDCARD ADMIN</div>
              </div>
              
              {/* Dashboard Body */}
              <div className="flex-1 flex bg-white">
                {/* Sidebar */}
                <div className="w-1/4 border-r border-gray-100 p-3 space-y-3 bg-gray-50/50">
                  <div className="h-2 w-1/2 bg-gray-300 rounded-sm mb-6" />
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-2 rounded-sm ${i === 1 ? 'bg-black w-full' : 'bg-gray-200 w-5/6'}`} />
                  ))}
                </div>

                {/* Main Content Area */}
                <div className="w-3/4 p-6 flex flex-col gap-6">
                  {/* Top Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-gray-100 p-3 rounded-sm bg-white shadow-sm">
                      <div className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Total Revenue</div>
                      <div className="text-xl font-bold text-black">₹4,250,000</div>
                      <div className="text-[10px] text-green-500 font-medium mt-1">+14.2% this week</div>
                    </div>
                    <div className="border border-gray-100 p-3 rounded-sm bg-white shadow-sm">
                      <div className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Tickets Sold</div>
                      <div className="text-xl font-bold text-black">12,405</div>
                      <div className="text-[10px] text-green-500 font-medium mt-1">+5.8% this week</div>
                    </div>
                  </div>

                  {/* Chart Area */}
                  <div className="flex-1 border border-gray-100 rounded-sm p-4 flex flex-col justify-end relative bg-white">
                    <div className="text-[10px] font-bold text-black absolute top-4 left-4 uppercase tracking-widest">Attendance Flow</div>
                    {/* CSS Bar Chart */}
                    <div className="flex items-end justify-between h-24 gap-2 mt-auto w-full">
                      {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                         <div key={i} className="w-full bg-black/5 rounded-t-sm group relative">
                           <div 
                             className="absolute bottom-0 w-full bg-black transition-all duration-500 rounded-t-sm" 
                             style={{ height: `${height}%` }}
                           />
                         </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stark CTA */}
      <section className="py-32 bg-white border-t border-gray-200 relative overflow-hidden">
        {/* Architectural Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Geometric Accents */}
        <div className="absolute left-0 top-0 w-32 h-32 border-b border-r border-black/5" />
        <div className="absolute right-0 bottom-0 w-32 h-32 border-t border-l border-black/5" />

        <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
          <div className="inline-block border border-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black mb-8">
            Ready For Production
          </div>
          <h2 className="text-4xl md:text-6xl font-medium text-black mb-6 tracking-tighter leading-tight">
            Initiate Your Deployment.
          </h2>
          <p className="text-lg md:text-xl text-gray-500 mb-12 font-light max-w-2xl mx-auto leading-relaxed">
            Register your organization today and access the industry's most powerful event management tools. Join the network of top-tier professionals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto h-14 px-10 bg-black text-white hover:bg-gray-800 rounded-none font-semibold text-base transition-colors group flex items-center">
                Open Account <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/events">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-10 border-gray-200 text-black hover:bg-gray-50 rounded-none font-medium text-base transition-colors">
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
