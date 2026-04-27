'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Building2, FileText, Landmark, UserCheck, Image as ImageIcon } from 'lucide-react';

export default function BillingSettingsPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [settings, setSettings] = useState({
        billing: {
            companyName: 'WYLDCARD STATS',
            address: '',
            gstin: '',
            pan: '',
            cin: '',
            authorizedSignatory: '',
            logoUrl: 'https://res.cloudinary.com/desdbjzzt/image/upload/v1777203252/logo_yswfeg.png'
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings/billing');
            const data = await res.json();
            if (data.success && data.data) {
                setSettings({
                    billing: {
                        ...settings.billing,
                        ...data.data.billing
                    }
                });
            }
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings/billing', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Settings updated successfully');
            } else {
                toast.error(data.error || 'Update failed');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin h-8 w-8 border-4 border-[#AE8638] border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#AE8638]">Global Billing Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">Configure company details for tax-compliant invoices.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="bg-black border-[#AE8638]/20 shadow-xl overflow-hidden">
                    <CardHeader className="border-b border-[#AE8638]/10 bg-[#AE8638]/5">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-[#AE8638]" />
                            <div>
                                <CardTitle className="text-white">Company Information</CardTitle>
                                <CardDescription className="text-gray-500">Official company details as they appear on the invoice.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName" className="text-gray-300">Company Name</Label>
                                <Input
                                    id="companyName"
                                    value={settings.billing.companyName}
                                    onChange={(e) => setSettings({ ...settings, billing: { ...settings.billing, companyName: e.target.value } })}
                                    className="bg-black border-[#AE8638]/20 text-white focus:border-[#AE8638]"
                                    placeholder="WYLDCARD STATS"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gstin" className="text-gray-300">GSTIN</Label>
                                <Input
                                    id="gstin"
                                    value={settings.billing.gstin}
                                    onChange={(e) => setSettings({ ...settings, billing: { ...settings.billing, gstin: e.target.value } })}
                                    className="bg-black border-[#AE8638]/20 text-white focus:border-[#AE8638]"
                                    placeholder="22AAAAA0000A1Z5"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-gray-300">Registered Address</Label>
                            <textarea
                                id="address"
                                value={settings.billing.address}
                                onChange={(e) => setSettings({ ...settings, billing: { ...settings.billing, address: e.target.value } })}
                                className="flex min-h-[80px] w-full rounded-md border border-[#AE8638]/20 bg-black px-3 py-2 text-sm text-white focus:border-[#AE8638] focus:outline-none"
                                placeholder="Enter full registered address..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pan" className="text-gray-300">PAN Number</Label>
                                <Input
                                    id="pan"
                                    value={settings.billing.pan}
                                    onChange={(e) => setSettings({ ...settings, billing: { ...settings.billing, pan: e.target.value } })}
                                    className="bg-black border-[#AE8638]/20 text-white focus:border-[#AE8638]"
                                    placeholder="ABCDE1234F"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cin" className="text-gray-300">CIN (Corporate ID)</Label>
                                <Input
                                    id="cin"
                                    value={settings.billing.cin}
                                    onChange={(e) => setSettings({ ...settings, billing: { ...settings.billing, cin: e.target.value } })}
                                    className="bg-black border-[#AE8638]/20 text-white focus:border-[#AE8638]"
                                    placeholder="U74999TG2024PTC000000"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-black border-[#AE8638]/20 shadow-xl overflow-hidden">
                    <CardHeader className="border-b border-[#AE8638]/10 bg-[#AE8638]/5">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-[#AE8638]" />
                            <div>
                                <CardTitle className="text-white">Assets & Signatures</CardTitle>
                                <CardDescription className="text-gray-500">Logo and authorized signatory images.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="logoUrl" className="text-gray-300">Company Logo URL (Cloudinary)</Label>
                            <Input
                                id="logoUrl"
                                value={settings.billing.logoUrl}
                                onChange={(e) => setSettings({ ...settings, billing: { ...settings.billing, logoUrl: e.target.value } })}
                                className="bg-black border-[#AE8638]/20 text-white focus:border-[#AE8638]"
                                placeholder="https://res.cloudinary.com/..."
                            />
                            {settings.billing.logoUrl && (
                                <div className="mt-2 p-2 border border-[#AE8638]/10 w-fit rounded">
                                    <img src={settings.billing.logoUrl} alt="Logo Preview" className="h-10 object-contain" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="authorizedSignatory" className="text-gray-300">Authorized Signatory (Signature Image URL)</Label>
                            <Input
                                id="authorizedSignatory"
                                value={settings.billing.authorizedSignatory}
                                onChange={(e) => setSettings({ ...settings, billing: { ...settings.billing, authorizedSignatory: e.target.value } })}
                                className="bg-black border-[#AE8638]/20 text-white focus:border-[#AE8638]"
                                placeholder="https://res.cloudinary.com/..."
                            />
                            {settings.billing.authorizedSignatory && (
                                <div className="mt-2 p-2 border border-[#AE8638]/10 w-fit rounded bg-white">
                                    <img src={settings.billing.authorizedSignatory} alt="Signature Preview" className="h-10 object-contain" />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="bg-[#AE8638] text-black hover:bg-[#AE8638]/90 font-bold px-8"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                                Saving...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save className="w-4 h-4" />
                                Save Billing Settings
                            </div>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
