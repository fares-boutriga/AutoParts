import { useState } from 'react';
import {
    useCustomers,
    useCustomer,
    useCreateCustomer,
    useUpdateCustomer,
    useDeleteCustomer,
} from '@/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
    Users,
    Search,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    AlertTriangle,
    Phone,
    Mail,
    ShoppingBag,
    TrendingUp,
    UserCheck,
    Clock,
    Package,
    X,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Customer } from '@/lib/api/endpoints/customers';

type DialogMode = { type: 'create' } | { type: 'edit'; customer: Customer } | null;

function CustomerForm({
    initial,
    onSubmit,
    isPending,
    onClose,
}: {
    initial?: Partial<Customer>;
    onSubmit: (data: { name: string; phone: string; email: string }) => void;
    isPending: boolean;
    onClose: () => void;
}) {
    const [name, setName] = useState(initial?.name ?? '');
    const [phone, setPhone] = useState(initial?.phone ?? '');
    const [email, setEmail] = useState(initial?.email ?? '');

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit({ name, phone, email });
            }}
            className="space-y-5 pt-2"
        >
            <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-500">Full Name *</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ahmed Brahim"
                    required
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-primary/30 font-medium"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-slate-500">Phone</Label>
                <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+216 XX XXX XXX"
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-primary/30 font-medium"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-500">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-2 focus-visible:ring-primary/30 font-medium"
                />
            </div>
            <div className="flex gap-3 pt-2">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    {isPending ? 'Saving...' : initial?.id ? 'Save Changes' : 'Create Customer'}
                </Button>
            </div>
        </form>
    );
}

function CustomerDetailSheet({ customerId, onClose }: { customerId: string; onClose: () => void }) {
    const { data: customer, isLoading } = useCustomer(customerId);

    const totalSpend = customer?.orders?.reduce((sum, o) => sum + Number(o.totalAmount), 0) ?? 0;

    return (
        <Sheet open onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto border-l border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl font-sans">
                <SheetHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <SheetTitle className="text-xl font-black">{customer?.name ?? '—'}</SheetTitle>
                    <SheetDescription className="space-y-1">
                        {customer?.phone && (
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <Phone className="h-3.5 w-3.5 text-primary" />
                                {customer.phone}
                            </span>
                        )}
                        {customer?.email && (
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <Mail className="h-3.5 w-3.5 text-primary" />
                                {customer.email}
                            </span>
                        )}
                    </SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    </div>
                ) : (
                    <div className="mt-6 space-y-6">
                        {/* Mini Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Orders</p>
                                <p className="text-3xl font-black text-primary mt-1">{customer?.orders?.length ?? 0}</p>
                            </div>
                            <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/10 p-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Spent</p>
                                <p className="text-2xl font-black text-emerald-600 mt-1">${totalSpend.toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Order History */}
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Purchase History</h3>
                            {!customer?.orders?.length ? (
                                <div className="flex flex-col items-center justify-center py-12 rounded-2xl bg-slate-50 dark:bg-slate-900">
                                    <ShoppingBag className="h-10 w-10 text-slate-300 mb-2" />
                                    <p className="text-sm font-bold text-slate-400">No orders yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {customer.orders.map((order) => (
                                        <div key={order.id} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <ShoppingBag className="h-4 w-4 text-primary" />
                                                    <span className="font-black text-sm">${Number(order.totalAmount).toFixed(2)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={cn(
                                                        "rounded-full text-[10px] font-black border-none px-3 uppercase",
                                                        order.status === 'completed' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                                                    )}>
                                                        {order.status}
                                                    </Badge>
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                                                        <Clock className="h-3 w-3" />
                                                        {format(new Date(order.createdAt), 'MMM d, yy')}
                                                    </span>
                                                </div>
                                            </div>
                                            {order.items?.length > 0 && (
                                                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                                                    {order.items.map((item: any) => (
                                                        <div key={item.id} className="flex items-center justify-between text-xs">
                                                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                                                                <Package className="h-3 w-3 text-slate-400" />
                                                                {item.product?.name}
                                                                {item.product?.reference && (
                                                                    <span className="font-mono text-[10px] text-slate-400">({item.product.reference})</span>
                                                                )}
                                                            </span>
                                                            <span className="font-black text-slate-700 dark:text-slate-200">
                                                                {item.quantity}x ${Number(item.unitPrice).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

export default function CustomerList() {
    const [search, setSearch] = useState('');
    const [page] = useState(1);
    const [dialogMode, setDialogMode] = useState<DialogMode>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { data, isLoading, isError } = useCustomers({ search, page, limit: 20 });
    const createCustomer = useCreateCustomer();
    const updateCustomer = useUpdateCustomer();
    const deleteCustomer = useDeleteCustomer();

    const totalCustomers = data?.meta?.total ?? 0;
    const repeatBuyers = data?.data?.filter(c => c.orderCount > 1).length ?? 0;
    const activeToday = data?.data?.filter(c => {
        if (!c.lastOrderAt) return false;
        const last = new Date(c.lastOrderAt);
        const now = new Date();
        return last.getMonth() === now.getMonth() && last.getFullYear() === now.getFullYear();
    }).length ?? 0;

    const handleCreate = (d: { name: string; phone: string; email: string }) => {
        createCustomer.mutate(
            { name: d.name, phone: d.phone || undefined, email: d.email || undefined },
            { onSuccess: () => setDialogMode(null) }
        );
    };

    const handleEdit = (d: { name: string; phone: string; email: string }) => {
        if (dialogMode?.type !== 'edit') return;
        updateCustomer.mutate(
            { id: dialogMode.customer.id, payload: { name: d.name, phone: d.phone || undefined, email: d.email || undefined } },
            { onSuccess: () => setDialogMode(null) }
        );
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            deleteCustomer.mutate(id);
        }
    };

    if (isError) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <Card className="max-w-md border-destructive/50 shadow-lg bg-white/50 backdrop-blur-xl">
                    <CardContent className="p-6 text-center space-y-4">
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto animate-bounce" />
                        <h2 className="text-xl font-bold">Error Loading Customers</h2>
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
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient-x">
                        CRM Customers
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Manage client profiles, track purchase history, and drive retention.
                    </p>
                </div>
                <Button
                    onClick={() => setDialogMode({ type: 'create' })}
                    className="rounded-xl px-6 bg-gradient-to-r from-primary to-secondary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all duration-300"
                >
                    <Plus className="mr-2 h-5 w-5" /> Add Customer
                </Button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Total Clients', value: totalCustomers, icon: Users, color: 'primary', sub: 'in database' },
                    { label: 'Repeat Buyers', value: repeatBuyers, icon: UserCheck, color: 'emerald', sub: '2+ orders' },
                    { label: 'Active This Month', value: activeToday, icon: TrendingUp, color: 'amber', sub: 'recent activity' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl group hover:scale-[1.02] transition-all duration-300">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-bold">{stat.value}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.sub}</p>
                            </div>
                            <div className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner",
                                stat.color === 'primary' ? "bg-primary/10 text-primary" :
                                    stat.color === 'emerald' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                        "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                            )}>
                                <stat.icon className="h-7 w-7 transition-transform group-hover:rotate-12" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Table */}
            <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-0">
                    <div className="p-6 flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search by name, phone or email..."
                                className="pl-11 h-12 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 font-medium"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 border-none hover:bg-slate-50/50">
                                <TableHead className="py-4 pl-8 font-bold text-slate-700 dark:text-slate-300">Client</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-300">Contact</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-300">Orders</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-300">Last Purchase</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-300">Customer Since</TableHead>
                                <TableHead className="py-4 pr-8 text-right font-bold text-slate-700 dark:text-slate-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="relative">
                                                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                                <Users className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
                                            </div>
                                            <span className="text-lg font-semibold text-slate-500 animate-pulse">Loading client roster...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : !data?.data?.length ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-96 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-6 max-w-sm mx-auto">
                                            <div className="h-32 w-32 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner relative overflow-hidden">
                                                <Users className="h-16 w-16 text-slate-300 relative z-10" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-2xl font-bold">No clients found</p>
                                                <p className="text-slate-500 font-medium">
                                                    {search ? "No customers match your search." : "Your CRM is empty. Add your first client to get started."}
                                                </p>
                                            </div>
                                            {!search && (
                                                <Button
                                                    onClick={() => setDialogMode({ type: 'create' })}
                                                    className="rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" /> Add First Customer
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.data.map((customer) => (
                                    <TableRow
                                        key={customer.id}
                                        className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/80 border-slate-100/50 dark:border-slate-800/50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedId(customer.id)}
                                    >
                                        <TableCell className="pl-8">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-black text-sm shadow-sm group-hover:scale-110 transition-transform shrink-0">
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{customer.name}</p>
                                                    {customer.orderCount > 1 && (
                                                        <Badge className="rounded-full text-[9px] font-black border-none px-2 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                            Repeat buyer
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-0.5">
                                                {customer.phone && (
                                                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                                                        <Phone className="h-3.5 w-3.5 text-primary" />
                                                        {customer.phone}
                                                    </div>
                                                )}
                                                {customer.email && (
                                                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                                                        <Mail className="h-3.5 w-3.5 text-primary" />
                                                        {customer.email}
                                                    </div>
                                                )}
                                                {!customer.phone && !customer.email && (
                                                    <span className="text-slate-300 dark:text-slate-600 text-sm italic">No contact info</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "h-8 w-9 rounded-lg flex items-center justify-center font-black text-sm border",
                                                    customer.orderCount > 0
                                                        ? "bg-primary/10 border-primary/20 text-primary"
                                                        : "bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700"
                                                )}>
                                                    {customer.orderCount}
                                                </div>
                                                <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {customer.lastOrderAt ? (
                                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-400">
                                                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                                                    {format(new Date(customer.lastOrderAt), 'MMM d, yyyy')}
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 dark:text-slate-600 text-sm italic">Never</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-medium text-slate-500">
                                                {format(new Date(customer.createdAt), 'MMM d, yyyy')}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-8" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all">
                                                        <MoreHorizontal className="h-5 w-5 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-2xl w-48 border-none shadow-2xl p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                                                    <DropdownMenuLabel className="px-4 py-2 font-black uppercase text-[10px] tracking-widest text-slate-400">Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        className="rounded-xl px-4 py-3 focus:bg-primary/5 cursor-pointer"
                                                        onClick={() => setSelectedId(customer.id)}
                                                    >
                                                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3">
                                                            <ShoppingBag className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-bold">View History</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="rounded-xl px-4 py-3 focus:bg-primary/5 cursor-pointer"
                                                        onClick={() => setDialogMode({ type: 'edit', customer })}
                                                    >
                                                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3">
                                                            <Pencil className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-bold">Edit Details</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-100 dark:border-slate-800 my-1 mx-2" />
                                                    <DropdownMenuItem
                                                        className="rounded-xl px-4 py-3 focus:bg-rose-500/10 text-rose-500 focus:text-rose-600 cursor-pointer font-bold"
                                                        onClick={() => handleDelete(customer.id)}
                                                    >
                                                        <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center mr-3">
                                                            <Trash2 className="h-4 w-4" />
                                                        </div>
                                                        Delete Client
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

            {/* Create / Edit Dialog */}
            <Dialog open={!!dialogMode} onOpenChange={(open) => !open && setDialogMode(null)}>
                <DialogContent className="rounded-3xl border-none shadow-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">
                            {dialogMode?.type === 'edit' ? 'Edit Customer' : 'New Customer'}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">
                            {dialogMode?.type === 'edit'
                                ? 'Update the customer profile information.'
                                : 'Add a new client to your CRM database.'}
                        </DialogDescription>
                    </DialogHeader>
                    {dialogMode?.type === 'create' && (
                        <CustomerForm
                            onSubmit={handleCreate}
                            isPending={createCustomer.isPending}
                            onClose={() => setDialogMode(null)}
                        />
                    )}
                    {dialogMode?.type === 'edit' && (
                        <CustomerForm
                            initial={dialogMode.customer}
                            onSubmit={handleEdit}
                            isPending={updateCustomer.isPending}
                            onClose={() => setDialogMode(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Customer Detail Sheet */}
            {selectedId && (
                <CustomerDetailSheet customerId={selectedId} onClose={() => setSelectedId(null)} />
            )}
        </div>
    );
}
