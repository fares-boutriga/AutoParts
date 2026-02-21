
import { useState } from 'react';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MoreHorizontal, ShoppingBag, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function OrderList() {
    const [search, setSearch] = useState('');
    const [page] = useState(1);
    const { data, isLoading, isError } = useOrders({ page, search, limit: 10 });
    const updateStatus = useUpdateOrderStatus();

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await updateStatus.mutateAsync({ id, status });
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const getStatusColor = (status: string) => {
        const s = (status || '').toUpperCase();
        switch (s) {
            case 'COMPLETED': return 'default';
            case 'PENDING': return 'secondary';
            case 'CANCELLED': return 'destructive';
            default: return 'outline';
        }
    };

    if (isError) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="text-center space-y-4">
                    <p className="text-destructive font-medium">Error loading orders. Please try again.</p>
                    <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
                    <p className="text-muted-foreground">Monitor and manage all customer sales and transactions.</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by ID or customer..."
                        className="pl-9 h-10 bg-background"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="font-bold">Order ID</TableHead>
                            <TableHead className="font-bold">Customer</TableHead>
                            <TableHead className="font-bold">Total Amount</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                            <TableHead className="font-bold">Date</TableHead>
                            <TableHead className="text-right font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                                        <span className="text-sm font-medium text-muted-foreground">Fetching transaction history...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : !data?.data || data.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <ShoppingBag className="h-8 w-8 opacity-20" />
                                        <p>No orders found. {search ? 'Try adjusting your search filters.' : 'Sales will appear here once transactions are made.'}</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.data.map((order: any) => (
                                <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-mono text-xs font-semibold text-primary">
                                        #{order.id ? order.id.substring(0, 8).toUpperCase() : 'N/A'}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {order.customer?.name || 'Walk-in Customer'}
                                    </TableCell>
                                    <TableCell className="font-bold">
                                        ${Number(order.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusColor(order.status) as any} className="font-bold uppercase text-[10px]">
                                            {order.status || 'UNKNOWN'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {order.createdAt ? format(new Date(order.createdAt), 'MMM d, yyyy HH:mm') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}>
                                                    Mark as Completed
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'PENDING')}>
                                                    Mark as Pending
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'CANCELLED')} className="text-destructive">
                                                    Mark as Cancelled
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
