'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Search, Sparkles, TrendingUp, Users, Zap, ArrowRight, Star } from 'lucide-react';

export default function HomePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success) {
        setEvents(data.data.slice(0, 6)); // Show top 6 events
      }
    } catch (err) {
      console.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-black overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative py-16 md:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-[#AE8638]/10 rounded-full border border-[#AE8638]/20 mb-2 md:mb-4">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-[#AE8638]" />
              <span className="text-xs md:text-sm font-medium text-[#AE8638]">Discover Amazing Events</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight px-4">
              <span className="text-white">
                Your Gateway to
              </span>
              <br />
              <span className="text-[#AE8638]">Unforgettable Experiences</span>
            </h1>

            <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Book tickets for concerts, conferences, workshops, and more. Join thousands of event-goers discovering their next adventure.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto px-4">
              <div className="relative group">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  className="pl-10 md:pl-12 pr-20 md:pr-24 h-12 md:h-14 text-sm md:text-lg bg-white/5 border-2 border-[#AE8638]/20 text-white placeholder:text-gray-500 focus:border-[#AE8638] shadow-lg group-hover:shadow-xl transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 h-9 md:h-10 text-xs md:text-sm bg-[#AE8638] hover:bg-[#AE8638]/90 text-black font-bold">
                  Search
                </Button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4">
              <Link href="/events" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-11 md:h-12 px-6 md:px-8 text-sm md:text-base shadow-lg hover:shadow-xl transition-all bg-[#AE8638] hover:bg-[#AE8638]/90 text-black font-bold">
                  Explore Events
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-11 md:h-12 px-6 md:px-8 text-sm md:text-base border-2 border-[#AE8638]/30 text-[#AE8638] hover:border-[#AE8638] hover:bg-[#AE8638]/10 font-medium">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 md:py-12 bg-black border-y border-[#AE8638]/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
            {[
              { icon: Users, label: 'Active Users', value: '50K+' },
              { icon: Calendar, label: 'Events Hosted', value: '10K+' },
              { icon: TrendingUp, label: 'Tickets Sold', value: '500K+' },
              { icon: Star, label: 'Satisfaction', value: '4.9/5' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center space-y-1 md:space-y-2">
                <stat.icon className="w-6 h-6 md:w-8 md:h-8 mx-auto text-[#AE8638]" />
                <div className="text-xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-12 md:py-20 bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2 text-white">Featured Events</h2>
              <p className="text-sm md:text-base text-gray-400">Don't miss out on these amazing experiences</p>
            </div>
            <Link href="/events">
              <Button variant="outline" className="gap-2 text-sm md:text-base border-[#AE8638]/30 text-[#AE8638] hover:border-[#AE8638] hover:bg-[#AE8638]/10 hover:text-[#AE8638]">
                View All
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden bg-black border border-[#AE8638]/20">
                  <div className="h-40 md:h-48 bg-[#AE8638]/10 animate-pulse" />
                  <CardContent className="p-4 md:p-6 space-y-2 md:space-y-3">
                    <div className="h-3 md:h-4 bg-[#AE8638]/10 animate-pulse rounded" />
                    <div className="h-3 md:h-4 bg-[#AE8638]/10 animate-pulse rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : events.length === 0 ? (
            <Card className="p-8 md:p-12 text-center bg-black border border-dashed border-[#AE8638]/30">
              <Calendar className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-[#AE8638]/50" />
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-white">No Events Yet</h3>
              <p className="text-sm md:text-base text-gray-400 mb-4 md:mb-6">Be the first to create an amazing event!</p>
              <Link href="/login">
                <Button className="text-sm md:text-base bg-[#AE8638] text-black hover:bg-[#AE8638]/90">Get Started</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {events.map((event) => (
                <Link key={event._id} href={event.isSoldOut ? '#' : `/events/${event._id}`} className={event.isSoldOut ? 'cursor-not-allowed opacity-70 grayscale' : ''}>
                  <Card className="overflow-hidden hover:shadow-2xl hover:shadow-[#AE8638]/10 transition-all duration-300 group cursor-pointer border border-[#AE8638]/20 hover:border-[#AE8638] h-full bg-black">
                    <div className="relative h-40 md:h-48 overflow-hidden bg-white/5">
                      {event.banner ? (
                        <img
                          src={event.banner}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#AE8638]/20 to-black flex items-center justify-center">
                          <Calendar className="w-12 h-12 md:w-16 md:h-16 text-[#AE8638]/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
                        <Badge className="bg-[#AE8638] text-black border-0 shadow-lg text-xs font-bold mb-1">
                          {event.type}
                        </Badge>
                        {event.isSoldOut && (
                          <Badge className="bg-red-600 text-white font-bold border-0 shadow-lg text-xs animate-pulse block w-fit">
                            SOLD OUT
                          </Badge>
                        )}
                        {event.isSellingFast && !event.isSoldOut && (
                          <Badge className="bg-orange-500 text-white font-bold border-0 shadow-lg text-xs animate-pulse block w-fit">
                            SELLING FAST 🔥
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4 md:p-6 space-y-2 md:space-y-3">
                      <h3 className="font-bold text-base md:text-xl line-clamp-1 group-hover:text-[#AE8638] transition-colors text-white">
                        {event.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-400 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs md:text-sm text-[#AE8638]">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                      </div>
                      {event.type === 'OFFLINE' && (
                        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
                          <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="line-clamp-1">{event.venue}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-[#AE8638]/20">
                        <span className="text-lg md:text-2xl font-bold text-[#AE8638]">
                          ₹{event.ticketConfig?.price?.toLocaleString()}
                        </span>
                        <Button size="sm" className="bg-[#AE8638] text-black hover:bg-[#AE8638]/90 text-xs md:text-sm h-8 md:h-9 transition-colors">
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 text-white">Why Choose WYLDCARD STATS PRIVATE LIMITED?</h2>
            <p className="text-sm md:text-lg text-gray-400">
              The most trusted platform for discovering and booking events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Zap,
                title: 'Instant Booking',
                description: 'Book tickets in seconds with our streamlined checkout process',
                color: 'text-[#AE8638]'
              },
              {
                icon: Users,
                title: 'Trusted Community',
                description: 'Join thousands of happy event-goers and organizers',
                color: 'text-[#AE8638]'
              },
              {
                icon: Star,
                title: 'Verified Events',
                description: 'All events are verified for authenticity and quality',
                color: 'text-[#AE8638]'
              },
            ].map((feature, idx) => (
              <Card key={idx} className="p-6 md:p-8 text-center hover:shadow-xl hover:shadow-[#AE8638]/10 transition-all border border-[#AE8638]/20 hover:border-[#AE8638] bg-black">
                <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-[#AE8638]/10 flex items-center justify-center`}>
                  <feature.icon className={`w-6 h-6 md:w-8 md:h-8 ${feature.color}`} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-sm md:text-base text-gray-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-[#AE8638] text-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-base md:text-xl text-black/80 mb-6 md:mb-8 max-w-2xl mx-auto font-medium">
            Create your account today and start discovering amazing events in your area
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-11 md:h-12 px-6 md:px-8 text-sm md:text-base shadow-xl bg-black hover:bg-black/80 text-[#AE8638] font-bold border-0">
                Sign Up Free
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/events" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-11 md:h-12 px-6 md:px-8 text-sm md:text-base border-2 border-black/20 text-black hover:border-black hover:bg-black/5">
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
