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
      <section className="relative bg-gradient-to-br from-primary/10 via-purple-50 to-pink-50 dark:from-primary/20 dark:via-purple-900/20 dark:to-pink-900/20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:20px_20px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 via-transparent to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative py-16 md:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-primary/10 rounded-full border border-primary/20 mb-2 md:mb-4">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary" />
              <span className="text-xs md:text-sm font-medium text-primary">Discover Amazing Events</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight px-4">
              <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Your Gateway to
              </span>
              <br />
              <span className="text-slate-900 dark:text-white">Unforgettable Experiences</span>
            </h1>

            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Book tickets for concerts, conferences, workshops, and more. Join thousands of event-goers discovering their next adventure.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto px-4">
              <div className="relative group">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  className="pl-10 md:pl-12 pr-20 md:pr-24 h-12 md:h-14 text-sm md:text-lg border-2 focus:border-primary shadow-lg group-hover:shadow-xl transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 h-9 md:h-10 text-xs md:text-sm">
                  Search
                </Button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4">
              <Link href="/events" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-11 md:h-12 px-6 md:px-8 text-sm md:text-base shadow-lg hover:shadow-xl transition-all">
                  Explore Events
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-11 md:h-12 px-6 md:px-8 text-sm md:text-base border-2">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 md:py-12 bg-white dark:bg-slate-900 border-y">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
            {[
              { icon: Users, label: 'Active Users', value: '50K+' },
              { icon: Calendar, label: 'Events Hosted', value: '10K+' },
              { icon: TrendingUp, label: 'Tickets Sold', value: '500K+' },
              { icon: Star, label: 'Satisfaction', value: '4.9/5' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center space-y-1 md:space-y-2">
                <stat.icon className="w-6 h-6 md:w-8 md:h-8 mx-auto text-primary" />
                <div className="text-xl md:text-3xl font-bold">{stat.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">Featured Events</h2>
              <p className="text-sm md:text-base text-muted-foreground">Don't miss out on these amazing experiences</p>
            </div>
            <Link href="/events">
              <Button variant="outline" className="gap-2 text-sm md:text-base">
                View All
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-40 md:h-48 bg-muted animate-pulse" />
                  <CardContent className="p-4 md:p-6 space-y-2 md:space-y-3">
                    <div className="h-3 md:h-4 bg-muted animate-pulse rounded" />
                    <div className="h-3 md:h-4 bg-muted animate-pulse rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : events.length === 0 ? (
            <Card className="p-8 md:p-12 text-center">
              <Calendar className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">No Events Yet</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">Be the first to create an amazing event!</p>
              <Link href="/login">
                <Button className="text-sm md:text-base">Get Started</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {events.map((event) => (
                <Link key={event._id} href={`/events/${event._id}`}>
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer border-2 hover:border-primary/50 h-full">
                    <div className="relative h-40 md:h-48 bg-gradient-to-br from-primary/20 to-purple-500/20 overflow-hidden">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute top-3 right-3 md:top-4 md:right-4">
                        <Badge className="bg-white/90 text-primary border-0 shadow-lg text-xs">
                          {event.type}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Calendar className="w-12 h-12 md:w-16 md:h-16 text-white/30" />
                      </div>
                    </div>
                    <CardContent className="p-4 md:p-6 space-y-2 md:space-y-3">
                      <h3 className="font-bold text-base md:text-xl line-clamp-1 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                      </div>
                      {event.type === 'OFFLINE' && (
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="line-clamp-1">{event.venue}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 md:pt-3 border-t">
                        <span className="text-lg md:text-2xl font-bold text-primary">
                          ₹{event.ticketPrice?.toLocaleString()}
                        </span>
                        <Button size="sm" className="group-hover:bg-primary group-hover:text-white text-xs md:text-sm h-8 md:h-9">
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
      <section className="py-12 md:py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">Why Choose EventZone?</h2>
            <p className="text-sm md:text-lg text-muted-foreground">
              The most trusted platform for discovering and booking events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Zap,
                title: 'Instant Booking',
                description: 'Book tickets in seconds with our streamlined checkout process',
                color: 'text-yellow-500'
              },
              {
                icon: Users,
                title: 'Trusted Community',
                description: 'Join thousands of happy event-goers and organizers',
                color: 'text-blue-500'
              },
              {
                icon: Star,
                title: 'Verified Events',
                description: 'All events are verified for authenticity and quality',
                color: 'text-purple-500'
              },
            ].map((feature, idx) => (
              <Card key={idx} className="p-6 md:p-8 text-center hover:shadow-xl transition-all border-2 hover:border-primary/50">
                <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center`}>
                  <feature.icon className={`w-6 h-6 md:w-8 md:h-8 ${feature.color}`} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-primary to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto">
            Create your account today and start discovering amazing events in your area
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto h-11 md:h-12 px-6 md:px-8 text-sm md:text-base shadow-xl">
                Sign Up Free
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/events" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-11 md:h-12 px-6 md:px-8 text-sm md:text-base border-2 border-white text-white hover:bg-white hover:text-primary">
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
