'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Users,
    UserCheck,
    Calendar,
    ChevronDown,
    ChevronRight,
    Search,
    Building2
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminHierarchyPage() {
    const [hierarchy, setHierarchy] = useState<any[]>([]);
    const [platformStats, setPlatformStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedVMs, setExpandedVMs] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchHierarchy();
    }, []);

    const fetchHierarchy = async () => {
        try {
            const res = await fetch('/api/admin/hierarchy');
            const data = await res.json();
            if (data.success) {
                setHierarchy(data.data.hierarchy);
                setPlatformStats(data.data.platformStats);
            } else {
                toast.error('Failed to load hierarchy');
            }
        } catch (error) {
            console.error('Failed to fetch hierarchy:', error);
            toast.error('Failed to load hierarchy');
        } finally {
            setLoading(false);
        }
    };

    const toggleVM = (vmId: string) => {
        const newExpanded = new Set(expandedVMs);
        if (newExpanded.has(vmId)) {
            newExpanded.delete(vmId);
        } else {
            newExpanded.add(vmId);
        }
        setExpandedVMs(newExpanded);
    };

    const filteredHierarchy = hierarchy.filter(h =>
        h.venueManager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.venueManager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.coordinators.some((c: any) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading hierarchy...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="container mx-auto px-6 py-4">
                    <h1 className="text-2xl font-bold">System Hierarchy</h1>
                    <p className="text-muted-foreground">View all venue managers, coordinators, and event assignments</p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Platform Stats */}
                {platformStats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Venue Managers</CardTitle>
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{platformStats.totalVenueManagers}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Coordinators</CardTitle>
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{platformStats.totalCoordinators}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Events</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{platformStats.totalEvents}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{platformStats.totalAssignments}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search venue managers or coordinators..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Hierarchy Tree */}
                <div className="space-y-4">
                    {filteredHierarchy.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No results found
                            </CardContent>
                        </Card>
                    ) : (
                        filteredHierarchy.map((item) => (
                            <Card key={item.venueManager._id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleVM(item.venueManager._id)}
                                            >
                                                {expandedVMs.has(item.venueManager._id) ? (
                                                    <ChevronDown className="h-4 w-4" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-lg">{item.venueManager.name}</CardTitle>
                                                    <Badge>Venue Manager</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{item.venueManager.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            <span>{item.stats.totalCoordinators} coordinators</span>
                                            <span>{item.stats.totalEvents} events</span>
                                        </div>
                                    </div>
                                </CardHeader>

                                {expandedVMs.has(item.venueManager._id) && (
                                    <CardContent className="pt-0">
                                        {/* Coordinators */}
                                        <div className="mb-6">
                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                <UserCheck className="h-4 w-4" />
                                                Coordinators ({item.coordinators.length})
                                            </h4>
                                            {item.coordinators.length === 0 ? (
                                                <p className="text-sm text-muted-foreground ml-6">No coordinators created</p>
                                            ) : (
                                                <div className="ml-6 space-y-2">
                                                    {item.coordinators.map((coord: any) => (
                                                        <div key={coord._id} className="p-3 border rounded-lg bg-gray-50">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="font-medium">{coord.name}</p>
                                                                    <p className="text-sm text-muted-foreground">{coord.email}</p>
                                                                </div>
                                                                <Badge variant="secondary">
                                                                    {coord.assignedEvents.length} events
                                                                </Badge>
                                                            </div>
                                                            {coord.assignedEvents.length > 0 && (
                                                                <div className="mt-2 ml-4 text-xs text-muted-foreground">
                                                                    Assigned to: {coord.assignedEvents.map((e: any) => e.title).join(', ')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Events */}
                                        <div>
                                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Events ({item.events.length})
                                            </h4>
                                            {item.events.length === 0 ? (
                                                <p className="text-sm text-muted-foreground ml-6">No events created</p>
                                            ) : (
                                                <div className="ml-6 space-y-2">
                                                    {item.events.map((event: any) => (
                                                        <div key={event._id} className="p-3 border rounded-lg">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="font-medium">{event.title}</p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {new Date(event.startDate).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Badge variant={event.isActive ? 'default' : 'secondary'}>
                                                                        {event.isActive ? 'Active' : 'Inactive'}
                                                                    </Badge>
                                                                    <Badge variant="outline">
                                                                        {event.assignedCoordinators.length} coordinators
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
