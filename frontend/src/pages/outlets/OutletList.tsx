import { useState } from 'react';
import {
    useOutlets,
    useCreateOutlet,
    useUpdateOutlet,
    useUpdateOutletAlerts,
    useDeleteOutlet,
} from '@/hooks/useOutlets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Store,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    MapPin,
    Phone,
    Mail,
    Bell,
    BellOff,
    Users,
    Package,
    ShoppingCart,
    Search,
    X,
    AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Outlet, CreateOutletPayload } from '@/lib/api/endpoints/outlets';

type DialogMode = { type: 'create' } | { type: 'edit'; outlet: Outlet } | { type: 'alerts'; outlet: Outlet } | null;

interface OutletFormProps {
    initial?: Partial<Outlet>;
    onSubmit: (data: CreateOutletPayload) => void;
    isPending: boolean;
    onClose: () => void;
}

function OutletForm({ initial, onSubmit, isPending, onClose }: OutletFormProps) {
    const [name, setName] = useState(initial?.name ?? '');
    const [address, setAddress] = useState(initial?.address ?? '');
    const [phone, setPhone] = useState(initial?.phone ?? '');
    const [email, setEmail] = useState(initial?.email ?? '');

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit({ name, address, phone, email });
            }}
            className="space-y-4 pt-2"
        >
            <div className="space-y-2">
                <Label htmlFor="name">Outlet Name *</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Downtown Auto Hub"
                    required
                    className="h-11 rounded-xl"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Street, City"
                    className="h-11 rounded-xl"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+216 ..."
                        className="h-11 rounded-xl"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Alert Email</Label>
                    <Input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alerts@outlet.com"
                        type="email"
                        className="h-11 rounded-xl"
                    />
                </div>
            </div>
            <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl h-11">
                    Cancel
                </Button>
                <Button disabled={isPending} className="flex-1 rounded-xl h-11 bg-primary text-white font-bold">
                    {isPending ? 'Saving...' : initial?.id ? 'Update Outlet' : 'Create Outlet'}
                </Button>
            </div>
        </form>
    );
}

function AlertSettingsForm({ outlet, onSubmit, isPending, onClose }: { outlet: Outlet; onSubmit: (data: { alertsEnabled: boolean; email?: string }) => void; isPending: boolean; onClose: () => void }) {
    const [alertsEnabled, setAlertsEnabled] = useState(outlet.alertsEnabled);
    const [email, setEmail] = useState(outlet.email ?? '');

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit({ alertsEnabled, email });
            }}
            className="space-y-6 pt-2"
        >
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                    <Label className="text-base font-bold">Enable Stock Alerts</Label>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Notify when products in this outlet fall below minimum stock levels.
                    </p>
                </div>
                <Switch checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
            </div>

            {alertsEnabled && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label htmlFor="alert-email">Notification Email *</Label>
                    <Input
                        id="alert-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="notifications@outlet.com"
                        type="email"
                        required={alertsEnabled}
                        className="h-11 rounded-xl"
                    />
                </div>
            )}

            <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl h-11">
                    Cancel
                </Button>
                <Button disabled={isPending} className="flex-1 rounded-xl h-11 bg-primary text-white font-bold">
                    {isPending ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>
        </form>
    );
}

export default function OutletList() {
    const [search, setSearch] = useState('');
    const [dialogMode, setDialogMode] = useState<DialogMode>(null);

    const { data: outlets, isLoading, isError } = useOutlets();
    const createOutlet = useCreateOutlet();
    const updateOutlet = useUpdateOutlet();
    const updateAlerts = useUpdateOutletAlerts();
    const deleteOutlet = useDeleteOutlet();

    const filteredOutlets = outlets?.filter((o) =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.address?.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

    const totalOutlets = outlets?.length ?? 0;
    const activeAlerts = outlets?.filter(o => o.alertsEnabled).length ?? 0;
    const totalOrders = outlets?.reduce((sum, o) => sum + (o._count?.orders ?? 0), 0) ?? 0;

    const handleCreate = (payload: CreateOutletPayload) => {
        createOutlet.mutate(payload, { onSuccess: () => setDialogMode(null) });
    };

    const handleUpdate = (payload: CreateOutletPayload) => {
        if (dialogMode?.type !== 'edit') return;
        updateOutlet.mutate({ id: dialogMode.outlet.id, payload }, { onSuccess: () => setDialogMode(null) });
    };

    const handleUpdateAlerts = (payload: { alertsEnabled: boolean; email?: string }) => {
        if (dialogMode?.type !== 'alerts') return;
        updateAlerts.mutate({ id: dialogMode.outlet.id, payload }, { onSuccess: () => setDialogMode(null) });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this outlet? This will also remove its stock records.')) {
            deleteOutlet.mutate(id);
        }
    };

    if (isError) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <Card className="max-w-md border-destructive/50 shadow-lg bg-white/50 backdrop-blur-xl">
                    <CardContent className="p-6 text-center space-y-4">
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
                        <h2 className="text-xl font-bold">Error Loading Outlets</h2>
                        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Outlet Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Manage your distribution points, track sales performance, and configure stock alerts.
                    </p>
                </div>
                <Button
                    onClick={() => setDialogMode({ type: 'create' })}
                    className="rounded-xl px-6 bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    <Plus className="mr-2 h-5 w-5" /> Add New Outlet
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Total Outlets', value: totalOutlets, icon: Store, color: 'primary' },
                    { label: 'Stock Alerts Active', value: activeAlerts, icon: Bell, color: 'amber' },
                    { label: 'Global Orders', value: totalOrders, icon: ShoppingCart, color: 'emerald' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl group hover:scale-[1.02] transition-all">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-bold">{stat.value}</p>
                            </div>
                            <div className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:rotate-12",
                                stat.color === 'primary' ? "bg-primary/10 text-primary" :
                                    stat.color === 'amber' ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30" :
                                        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                            )}>
                                <stat.icon className="h-7 w-7" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Card */}
            <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl overflow-hidden">
                <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="Filter by name or address..."
                                className="pl-11 h-12 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-2xl"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50/50 border-none">
                                <TableHead className="py-4 pl-8 font-bold">Outlet Details</TableHead>
                                <TableHead className="py-4 font-bold">Contact Info</TableHead>
                                <TableHead className="py-4 font-bold">Stats</TableHead>
                                <TableHead className="py-4 font-bold">Stock Alerts</TableHead>
                                <TableHead className="py-4 pr-8 text-right font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [1, 2, 3].map((i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5} className="py-8">
                                            <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse mx-8" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : filteredOutlets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <Store className="h-12 w-12 text-slate-300" />
                                            <p className="text-lg font-bold text-slate-500">No outlets found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOutlets.map((outlet) => (
                                    <TableRow key={outlet.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 border-slate-100/50 dark:border-slate-800/50 transition-colors">
                                        <TableCell className="pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary shadow-sm">
                                                    <MapPin className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{outlet.name}</p>
                                                    <p className="text-xs font-medium text-slate-500 line-clamp-1">{outlet.address || 'No address provided'}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {outlet.phone && (
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                                                        <Phone className="h-3.5 w-3.5 text-primary" />
                                                        {outlet.phone}
                                                    </div>
                                                )}
                                                {outlet.email && (
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                                                        <Mail className="h-3.5 w-3.5 text-primary" />
                                                        {outlet.email}
                                                    </div>
                                                )}
                                                {!outlet.phone && !outlet.email && <span className="text-xs italic text-slate-400">N/A</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="text-center group-hover:scale-110 transition-transform">
                                                    <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-0.5">
                                                        <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <span className="text-[10px] font-black">{outlet._count?.users ?? 0}</span>
                                                </div>
                                                <div className="text-center group-hover:scale-110 transition-transform delay-75">
                                                    <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mb-0.5">
                                                        <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                    </div>
                                                    <span className="text-[10px] font-black">{outlet._count?.stocks ?? 0}</span>
                                                </div>
                                                <div className="text-center group-hover:scale-110 transition-transform delay-150">
                                                    <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-0.5">
                                                        <ShoppingCart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <span className="text-[10px] font-black">{outlet._count?.orders ?? 0}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {outlet.alertsEnabled ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-none rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                        <Bell className="h-3 w-3" />
                                                        Subscribed
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-slate-100 text-slate-400 dark:bg-slate-800 border-none rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                        <BellOff className="h-3 w-3" />
                                                        Inactive
                                                    </Badge>
                                                )}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                                                    onClick={() => setDialogMode({ type: 'alerts', outlet })}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl">
                                                        <MoreHorizontal className="h-5 w-5 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-2xl w-48 border-none shadow-2xl p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                                                    <DropdownMenuLabel className="px-4 py-2 font-black uppercase text-[10px] tracking-widest text-slate-400">Management</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        className="rounded-xl px-4 py-3 focus:bg-primary/5 cursor-pointer"
                                                        onClick={() => setDialogMode({ type: 'edit', outlet })}
                                                    >
                                                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3">
                                                            <Pencil className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-bold">Edit Outlet</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="rounded-xl px-4 py-3 focus:bg-primary/5 cursor-pointer"
                                                        onClick={() => setDialogMode({ type: 'alerts', outlet })}
                                                    >
                                                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center mr-3">
                                                            <Bell className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-bold">Notifications</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-100 dark:border-slate-800 my-1 mx-2" />
                                                    <DropdownMenuItem
                                                        className="rounded-xl px-4 py-3 focus:bg-rose-500/10 text-rose-500 focus:text-rose-600 cursor-pointer font-bold"
                                                        onClick={() => handleDelete(outlet.id)}
                                                    >
                                                        <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center mr-3">
                                                            <Trash2 className="h-4 w-4" />
                                                        </div>
                                                        Delete Outlet
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Dialogs */}
            <Dialog open={!!dialogMode} onOpenChange={(open) => !open && setDialogMode(null)}>
                <DialogContent className="rounded-3xl border-none shadow-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">
                            {dialogMode?.type === 'create' ? 'Create New Outlet' :
                                dialogMode?.type === 'edit' ? 'Update Outlet' :
                                    'Notification Settings'}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">
                            {dialogMode?.type === 'alerts' ? 'Configure automated stock notifications for this outlet.' : 'Enter the primary details for this distribution location.'}
                        </DialogDescription>
                    </DialogHeader>

                    {dialogMode?.type === 'create' && (
                        <OutletForm
                            onSubmit={handleCreate}
                            isPending={createOutlet.isPending}
                            onClose={() => setDialogMode(null)}
                        />
                    )}

                    {dialogMode?.type === 'edit' && (
                        <OutletForm
                            initial={dialogMode.outlet}
                            onSubmit={handleUpdate}
                            isPending={updateOutlet.isPending}
                            onClose={() => setDialogMode(null)}
                        />
                    )}

                    {dialogMode?.type === 'alerts' && (
                        <AlertSettingsForm
                            outlet={dialogMode.outlet}
                            onSubmit={handleUpdateAlerts}
                            isPending={updateAlerts.isPending}
                            onClose={() => setDialogMode(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
