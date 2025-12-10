
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Plus, Search, Trash2, UserPlus, ShieldCheck, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('User created successfully');
                setIsCreateOpen(false);
                setNewUser({ name: '', email: '', password: '', role: 'USER' });
                fetchUsers();
            } else {
                toast.error(data.error);
            }
        } catch (err) {
            toast.error('Failed to create user');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                toast.success('User deleted');
                fetchUsers();
            } else {
                toast.error(data.error);
            }
        } catch (err) {
            toast.error('Failed to delete user');
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Role updated');
                fetchUsers();
            } else {
                toast.error(data.error);
            }
        } catch (err) {
            toast.error('Failed to update role');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <p className="text-[#AE8638] animate-pulse">Loading Users...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Manage Users</h1>
                    <p className="text-gray-400 mt-1">Control access roles and permissions</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#AE8638] hover:bg-[#AE8638]/90 text-black font-bold">
                            <UserPlus className="w-4 h-4 mr-2" /> Add User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1a1a1a] border-[#AE8638]/30 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-[#AE8638]">Add New User</DialogTitle>
                            <DialogDescription className="text-gray-400">Create a new account manually.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateUser} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-white">Name</Label>
                                <Input
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    required
                                    className="bg-black border-gray-700 text-white focus:ring-[#AE8638]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white">Email</Label>
                                <Input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                    className="bg-black border-gray-700 text-white focus:ring-[#AE8638]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white">Password</Label>
                                <Input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                    className="bg-black border-gray-700 text-white focus:ring-[#AE8638]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-white">Role</Label>
                                <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                                    <SelectTrigger className="bg-black border-gray-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-gray-700 text-white">
                                        <SelectItem value="USER">User</SelectItem>
                                        <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                                        <SelectItem value="VENUE_MANAGER">Venue Manager</SelectItem>
                                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={creating}
                                    className="bg-[#AE8638] hover:bg-[#AE8638]/90 text-black font-bold w-full"
                                >
                                    {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Create User
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filter */}
            <div className="mb-6 relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                    placeholder="Search users..."
                    className="pl-10 bg-black border-[#AE8638]/30 text-white focus:ring-[#AE8638]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Card className="bg-black border border-[#AE8638]/30">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="border-gray-800 bg-[#AE8638]/5">
                            <TableRow className="border-gray-800 hover:bg-transparent">
                                <TableHead className="text-[#AE8638] font-medium">Name</TableHead>
                                <TableHead className="text-[#AE8638] font-medium">Email</TableHead>
                                <TableHead className="text-[#AE8638] font-medium">Role</TableHead>
                                <TableHead className="text-[#AE8638] font-medium">Joined</TableHead>
                                <TableHead className="text-right text-[#AE8638] font-medium">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow className="border-gray-800 hover:bg-transparent">
                                    <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user._id} className="border-gray-800 hover:bg-[#AE8638]/5 transition-colors">
                                        <TableCell className="font-medium text-white">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-[#AE8638]/20 flex items-center justify-center text-[#AE8638] font-bold text-xs uppercase">
                                                    {user.name.charAt(0)}
                                                </div>
                                                {user.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3 h-3 text-gray-500" />
                                                {user.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`
                                                ${user.role === 'SUPER_ADMIN' ? 'border-red-500 text-red-400 bg-red-950/20' :
                                                    user.role === 'VENUE_MANAGER' ? 'border-[#AE8638] text-[#AE8638] bg-[#AE8638]/10' :
                                                        user.role === 'COORDINATOR' ? 'border-blue-500 text-blue-400 bg-blue-950/20' :
                                                            'border-gray-600 text-gray-400'}
                                            `}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-400 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right flex justify-end gap-2 items-center">
                                            <Select defaultValue={user.role} onValueChange={(val) => handleRoleChange(user._id, val)}>
                                                <SelectTrigger className="w-[140px] h-8 bg-black/50 border-gray-700 text-gray-300 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1a1a1a] border-gray-700 text-white">
                                                    <SelectItem value="USER">User</SelectItem>
                                                    <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                                                    <SelectItem value="VENUE_MANAGER">Venue Manager</SelectItem>
                                                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-950/30"
                                                onClick={() => handleDeleteUser(user._id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
