import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { AxiosError } from 'axios';
import {
    AlertTriangle,
    DollarSign,
    Loader2,
    Package,
    RefreshCw,
    ShoppingBag,
    Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { useAuthStore } from '@/lib/auth/store';
import { hasPermission } from '@/lib/auth/permissions';

const formatCurrency = (value?: number) => `${Number(value ?? 0).toFixed(3)} TND`;

const formatOrderDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return format(date, 'dd/MM/yyyy HH:mm');
};

export default function Dashboard() {
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);
    const canSeeSales = hasPermission(user, 'sell_products');
    const canSeeInventory = hasPermission(user, 'manage_stock');

    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
        refetch,
    } = useDashboardSummary({ period: 'today' });

    const kpis = data?.kpis;
    const recentSales = data?.recentSales ?? [];
    const hasAnyCards = canSeeSales || canSeeInventory;
    const isApiOffline = (error as AxiosError | null)?.code === 'ERR_NETWORK';

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="gap-2 rounded-xl"
                >
                    {isFetching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4" />
                    )}
                    {t('dashboard_page.refresh')}
                </Button>
            </div>

            {isError ? (
                <Card className="border border-rose-200 bg-rose-50/40 dark:bg-rose-900/10">
                    <CardContent className="py-8 text-center space-y-4">
                        <p className="text-lg font-bold text-rose-600 dark:text-rose-300">
                            {t('dashboard_page.errorTitle')}
                        </p>
                        <p className="text-sm text-rose-500 dark:text-rose-200">
                            {isApiOffline
                                ? t('dashboard_page.errorApiOffline')
                                : t('dashboard_page.errorSub')}
                        </p>
                        <Button onClick={() => refetch()}>{t('dashboard_page.retry')}</Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {hasAnyCards ? (
                        <div
                            className={cn(
                                'grid gap-6',
                                canSeeInventory ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2',
                            )}
                        >
                            {isLoading ? (
                                Array.from({ length: canSeeInventory ? 4 : 2 }).map((_, idx) => (
                                    <Card
                                        key={idx}
                                        className="relative overflow-hidden border-0 shadow-lg animate-fade-in"
                                    >
                                        <div className="absolute inset-0 bg-slate-200/40 dark:bg-slate-700/40" />
                                        <CardContent className="relative p-6">
                                            <div className="space-y-3">
                                                <div className="h-4 w-28 rounded bg-white/40 animate-pulse" />
                                                <div className="h-8 w-36 rounded bg-white/40 animate-pulse" />
                                                <div className="h-3 w-24 rounded bg-white/40 animate-pulse" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <>
                                    {canSeeSales && (
                                        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in">
                                            <div className="absolute inset-0 gradient-card-blue opacity-100" />
                                            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium text-white/90">
                                                    {t('dashboard_page.totalRevenue')}
                                                </CardTitle>
                                                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                    <DollarSign className="h-5 w-5 text-white" />
                                                </div>
                                            </CardHeader>
                                            <CardContent className="relative">
                                                <div className="text-3xl font-bold text-white">
                                                    {formatCurrency(kpis?.todayRevenue)}
                                                </div>
                                                <p className="text-sm text-white/80 font-medium mt-1">
                                                    {t('dashboard_page.periodToday')}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {canSeeSales && (
                                        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in">
                                            <div className="absolute inset-0 gradient-card-purple opacity-100" />
                                            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium text-white/90">
                                                    {t('dashboard_page.todayOrders')}
                                                </CardTitle>
                                                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-white" />
                                                </div>
                                            </CardHeader>
                                            <CardContent className="relative">
                                                <div className="text-3xl font-bold text-white">
                                                    {kpis?.todayOrdersCount ?? 0}
                                                </div>
                                                <p className="text-sm text-white/80 font-medium mt-1">
                                                    {t('dashboard_page.periodToday')}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {canSeeInventory && (
                                        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in">
                                            <div className="absolute inset-0 gradient-card-green opacity-100" />
                                            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium text-white/90">
                                                    {t('dashboard_page.productsInStock')}
                                                </CardTitle>
                                                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                    <Package className="h-5 w-5 text-white" />
                                                </div>
                                            </CardHeader>
                                            <CardContent className="relative">
                                                <div className="text-3xl font-bold text-white">
                                                    {kpis?.inStockProductsCount ?? 0}
                                                </div>
                                                <p className="text-sm text-white/80 font-medium mt-1">
                                                    {t('dashboard_page.liveInventory')}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {canSeeInventory && (
                                        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-fade-in">
                                            <div className="absolute inset-0 gradient-card-red opacity-100" />
                                            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium text-white/90">
                                                    {t('dashboard_page.lowStockAlerts')}
                                                </CardTitle>
                                                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                    <AlertTriangle className="h-5 w-5 text-white" />
                                                </div>
                                            </CardHeader>
                                            <CardContent className="relative">
                                                <div className="text-3xl font-bold text-white">
                                                    {kpis?.lowStockItemsCount ?? 0}
                                                </div>
                                                <p className="text-sm text-white/80 font-medium mt-1">
                                                    {t('dashboard_page.requiresAttention')}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <Card className="border-0 shadow-lg">
                            <CardContent className="py-10 text-center text-muted-foreground">
                                {t('dashboard_page.noWidgets')}
                            </CardContent>
                        </Card>
                    )}

                    {canSeeSales && (
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
                            <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
                                <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    {t('dashboard_page.recentSales.title')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {isLoading ? (
                                    <div className="space-y-3">
                                        {Array.from({ length: 5 }).map((_, idx) => (
                                            <div key={idx} className="h-12 rounded-lg bg-muted/60 animate-pulse" />
                                        ))}
                                    </div>
                                ) : recentSales.length === 0 ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center space-y-3">
                                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto">
                                                <ShoppingBag className="h-8 w-8 text-primary" />
                                            </div>
                                            <p className="text-muted-foreground text-lg">{t('dashboard_page.recentSales.empty')}</p>
                                            <p className="text-sm text-muted-foreground/70">{t('dashboard_page.recentSales.emptySub')}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{t('dashboard_page.recentSales.table.id')}</TableHead>
                                                <TableHead>{t('dashboard_page.recentSales.table.customer')}</TableHead>
                                                <TableHead>{t('dashboard_page.recentSales.table.cashier')}</TableHead>
                                                <TableHead className="text-right">{t('dashboard_page.recentSales.table.items')}</TableHead>
                                                <TableHead className="text-right">{t('dashboard_page.recentSales.table.total')}</TableHead>
                                                <TableHead>{t('dashboard_page.recentSales.table.payment')}</TableHead>
                                                <TableHead>{t('dashboard_page.recentSales.table.date')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentSales.map((sale) => (
                                                <TableRow key={sale.id}>
                                                    <TableCell className="font-mono text-xs font-semibold text-primary">
                                                        #{sale.id.slice(0, 8).toUpperCase()}
                                                    </TableCell>
                                                    <TableCell>{sale.customerName || t('dashboard_page.recentSales.walkIn')}</TableCell>
                                                    <TableCell>{sale.cashierName || '-'}</TableCell>
                                                    <TableCell className="text-right">{sale.itemsCount}</TableCell>
                                                    <TableCell className="text-right font-bold">
                                                        {formatCurrency(sale.totalAmount)}
                                                    </TableCell>
                                                    <TableCell className="uppercase text-xs">
                                                        {sale.paymentMethod}
                                                    </TableCell>
                                                    <TableCell>{formatOrderDate(sale.createdAt)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
