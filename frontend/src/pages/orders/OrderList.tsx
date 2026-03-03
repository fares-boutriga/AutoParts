
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MoreHorizontal, ShoppingBag, Search, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import InvoiceModal from '@/components/InvoiceModal';

export default function OrderList() {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [page] = useState(1);
    const { data, isLoading, isError } = useOrders({ page, search, limit: 10 });
    const updateStatus = useUpdateOrderStatus();
    const [invoiceOrderId, setInvoiceOrderId] = useState<string | null>(null);

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
                    <p className="text-destructive font-medium">{t('orders_page.error')}</p>
                    <Button onClick={() => window.location.reload()} variant="outline">{t('orders_page.retry')}</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('orders_page.title')}</h1>
                    <p className="text-muted-foreground">{t('orders_page.subtitle')}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('orders_page.search')}
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
                            <TableHead className="font-bold">{t('orders_page.table.id')}</TableHead>
                            <TableHead className="font-bold">{t('orders_page.table.customer')}</TableHead>
                            <TableHead className="font-bold">{t('orders_page.table.amount')}</TableHead>
                            <TableHead className="font-bold">{t('orders_page.table.status')}</TableHead>
                            <TableHead className="font-bold">{t('orders_page.table.date')}</TableHead>
                            <TableHead className="text-right font-bold">{t('orders_page.table.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                                        <span className="text-sm font-medium text-muted-foreground">{t('orders_page.fetching')}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : !data?.data || data.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <ShoppingBag className="h-8 w-8 opacity-20" />
                                        <p>{t('orders_page.noOrders')} {search ? t('orders_page.noOrdersSearch') : t('orders_page.noOrdersEmpty')}</p>
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
                                        {order.customer?.name || t('orders_page.walkIn')}
                                    </TableCell>
                                    <TableCell className="font-bold">
                                        {Number(order.totalAmount || 0).toFixed(3)} TND
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusColor(order.status) as any} className="font-bold uppercase text-[10px]">
                                            {order.status ? t(`orders_page.status.${order.status.toLowerCase()}`) : t('orders_page.status.unknown')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {order.createdAt ? format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm') : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Invoice button */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1.5 rounded-lg border-primary/20 text-primary hover:bg-primary/5"
                                                onClick={() => setInvoiceOrderId(order.id)}
                                            >
                                                <Receipt className="h-3.5 w-3.5" />
                                                Facture
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>{t('orders_page.actions.changeStatus')}</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}>
                                                        {t('orders_page.actions.completed')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'PENDING')}>
                                                        {t('orders_page.actions.pending')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'CANCELLED')} className="text-destructive">
                                                        {t('orders_page.actions.cancelled')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Invoice Modal */}
            <InvoiceModal
                orderId={invoiceOrderId}
                open={!!invoiceOrderId}
                onClose={() => setInvoiceOrderId(null)}
            />
        </div>
    );
}
