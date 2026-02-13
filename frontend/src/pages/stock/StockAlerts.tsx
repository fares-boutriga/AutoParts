import { useState } from 'react';
import { useStockAlerts, useAcknowledgeAlert } from '@/hooks/useStock';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function StockAlerts() {
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useStockAlerts({ page, limit: 20 });
    const acknowledgeAlert = useAcknowledgeAlert();

    const handleAcknowledge = async (id: string) => {
        await acknowledgeAlert.mutateAsync(id);
    };

    if (isError) {
        return <div className="p-8 text-red-500">Error loading alerts.</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Stock Alerts</h1>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Current Stock</TableHead>
                            <TableHead>Min Level</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading...
                                </TableCell>
                            </TableRow>
                        ) : data?.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No alerts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.data.map((alert) => (
                                <TableRow key={alert.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                            {alert.productName}
                                        </div>
                                    </TableCell>
                                    <TableCell>{alert.sku}</TableCell>
                                    <TableCell className="text-red-600 font-bold">{alert.currentStock}</TableCell>
                                    <TableCell>{alert.minStockLevel}</TableCell>
                                    <TableCell>
                                        <Badge variant={alert.status === 'PENDING' ? 'destructive' : 'secondary'}>
                                            {alert.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{format(new Date(alert.createdAt), 'MMM d, yyyy')}</TableCell>
                                    <TableCell className="text-right">
                                        {alert.status === 'PENDING' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleAcknowledge(alert.id)}
                                                disabled={acknowledgeAlert.isPending}
                                            >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Acknowledge
                                            </Button>
                                        )}
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
