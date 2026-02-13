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
import { MoreHorizontal, Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function OrderList() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useOrders({ page, search, limit: 10 });
    const updateStatus = useUpdateOrderStatus();

    const handleStatusUpdate = async (id: string, status: string) => {
        await updateStatus.mutateAsync({ id, status });
    };

    if (isError) {
        return <div className="p-8 text-red-500">Error loading orders.</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'default';
            case 'PENDING': return 'secondary';
            case 'CANCELLED': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search orders..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading...
                                </TableCell>
                            </TableRow>
                        ) : data?.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                                    <TableCell>{order.customerName || 'Walk-in Customer'}</TableCell>
                                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusColor(order.status) as any}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{format(new Date(order.createdAt), 'MMM d, yyyy')}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}>
                                                    Mark as Completed
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'PENDING')}>
                                                    Mark as Pending
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'CANCELLED')} className="text-red-600">
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
