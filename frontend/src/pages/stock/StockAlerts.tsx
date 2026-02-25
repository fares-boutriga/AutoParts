import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Package,
    ArrowRight,
    Bell,
    CheckCheck,
    RefreshCcw,
} from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/api/client';
import { cn } from '@/lib/utils';

interface StockAlert {
    id: string;
    productId: string;
    productName: string;
    reference: string;
    currentStock: number;
    minStockLevel: number;
    status: 'PENDING' | 'ACKNOWLEDGED';
    message: string;
    createdAt: string;
}

export default function StockAlerts() {
    const queryClient = useQueryClient();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['stock-alerts'],
        queryFn: async () => {
            const response = await api.get<{ data: StockAlert[] }>('/stock/alerts');
            return response.data.data;
        },
    });

    const acknowledgeMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/stock/alerts/${id}/acknowledge`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock-alerts'] });
            toast.success('Alert acknowledged');
        },
        onError: () => {
            toast.error('Failed to acknowledge alert');
        },
    });

    if (isError) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <Card className="max-w-md border-destructive/50 shadow-lg bg-white/50 backdrop-blur-xl">
                    <CardContent className="p-6 text-center space-y-4">
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto animate-bounce" />
                        <h2 className="text-xl font-bold">Error Loading Alerts</h2>
                        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const pendingAlerts = data?.filter((a: StockAlert) => a.status === 'PENDING') ?? [];
    const acknowledgedAlerts = data?.filter((a: StockAlert) => a.status === 'ACKNOWLEDGED') ?? [];

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-rose-500 via-primary to-orange-500 bg-clip-text text-transparent animate-gradient-x">
                        Stock Monitoring
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Real-time alerts for low stock levels and inventory disruptions.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => refetch()}
                        className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                    >
                        <RefreshCcw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stat Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="border-none shadow-xl bg-rose-500/5 border-l-4 border-l-rose-500">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-black uppercase tracking-widest text-rose-500">Critical Alerts</p>
                            <p className="text-4xl font-black text-slate-900 dark:text-white">{pendingAlerts.length}</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Needs immediate attention</p>
                        </div>
                        <div className="h-16 w-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                            <Bell className="h-8 w-8 animate-tada" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-xl bg-emerald-500/5 border-l-4 border-l-emerald-500">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-black uppercase tracking-widest text-emerald-500">Resolved Today</p>
                            <p className="text-4xl font-black text-slate-900 dark:text-white">{acknowledgedAlerts.length}</p>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Marked as resolved</p>
                        </div>
                        <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <CheckCheck className="h-8 w-8" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts Table */}
            <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-6">
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-rose-500" />
                        Inventory Warnings
                    </CardTitle>
                    <CardDescription className="font-medium">
                        Showing all active and recently resolved stock notifications.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 border-none">
                                <TableHead className="py-4 pl-8 font-bold">Severity</TableHead>
                                <TableHead className="py-4 font-bold">Product Information</TableHead>
                                <TableHead className="py-4 font-bold">Stock Status</TableHead>
                                <TableHead className="py-4 font-bold">Alert Message</TableHead>
                                <TableHead className="py-4 font-bold">Time</TableHead>
                                <TableHead className="py-4 pr-8 text-right font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                            <span className="text-slate-500 font-bold animate-pulse">Scanning inventory logs...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : !data?.length ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-96 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto">
                                            <div className="h-24 w-24 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shadow-inner">
                                                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-2xl font-black">All stocked up!</p>
                                                <p className="text-slate-500 font-medium italic">
                                                    No low-stock alerts detected at the moment.
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((alert: StockAlert) => (
                                    <TableRow
                                        key={alert.id}
                                        className={cn(
                                            "group border-slate-100/50 dark:border-slate-800/50 transition-colors",
                                            alert.status === 'PENDING' ? "bg-rose-500/[0.02] dark:bg-rose-500/[0.01]" : "opacity-60"
                                        )}
                                    >
                                        <TableCell className="pl-8">
                                            {alert.status === 'PENDING' ? (
                                                <Badge className="bg-rose-500 text-white border-none rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider animate-pulse">
                                                    Critical
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-slate-100 text-slate-400 dark:bg-slate-800 border-none rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider">
                                                    Resolved
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                    <Package className="h-5 w-5 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-slate-100">{alert.productName}</p>
                                                    <p className="text-xs font-mono text-slate-400">{alert.reference}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-11 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-sm text-rose-500">
                                                    {alert.currentStock}
                                                </div>
                                                <ArrowRight className="h-3 w-3 text-slate-300" />
                                                <div className="h-8 w-11 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-sm text-slate-400">
                                                    {alert.minStockLevel || 10}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-xs leading-snug">
                                                {alert.message}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                                <Clock className="h-3.5 w-3.5" />
                                                {format(new Date(alert.createdAt), 'MMM d, HH:mm')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            {alert.status === 'PENDING' ? (
                                                <Button
                                                    size="sm"
                                                    onClick={() => acknowledgeMutation.mutate(alert.id)}
                                                    disabled={acknowledgeMutation.isPending}
                                                    className="rounded-xl bg-slate-900 hover:bg-black text-white px-4 font-bold text-xs"
                                                >
                                                    {acknowledgeMutation.isPending ? 'Working...' : 'Resolve Alert'}
                                                </Button>
                                            ) : (
                                                <div className="text-emerald-500 flex items-center justify-end gap-1 font-bold text-xs uppercase tracking-widest">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Handled
                                                </div>
                                            )}
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
