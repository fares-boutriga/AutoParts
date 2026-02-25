import { useState } from 'react';
import { useStock, useAdjustStock, useUpdateStockSettings } from '@/hooks/useStock';
import { useOutlets } from '@/hooks/useOutlets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Box,
    Plus,
    Minus,
    History,
    AlertCircle,
    Search,
    Filter,
    ArrowRight,
    RefreshCcw,
    Settings2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Stock } from '@/lib/api/endpoints/stock';

export default function StockManagement() {
    const [search, setSearch] = useState('');
    const [selectedOutlet, setSelectedOutlet] = useState<string>('all');
    const [adjustingStock, setAdjustingStock] = useState<Stock | null>(null);
    const [adjustmentAmount, setAdjustmentAmount] = useState<string>('');
    const [editingStock, setEditingStock] = useState<Stock | null>(null);
    const [minStock, setMinStock] = useState<string>('');
    const [reason, setReason] = useState<string>('Inventory check');

    const { data: outlets } = useOutlets();
    const { data: stocks, isLoading, isError, refetch } = useStock({
        outletId: selectedOutlet === 'all' ? undefined : selectedOutlet
    });

    const adjustStock = useAdjustStock();
    const updateStockSettings = useUpdateStockSettings();

    const filteredStocks = stocks?.filter(s =>
        s.product.name.toLowerCase().includes(search.toLowerCase()) ||
        s.product.reference.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

    const handleAdjust = async () => {
        if (!adjustingStock || !adjustmentAmount) return;

        adjustStock.mutate({
            id: adjustingStock.id,
            payload: {
                adjustment: parseInt(adjustmentAmount, 10),
                reason: reason
            }
        }, {
            onSuccess: () => {
                setAdjustingStock(null);
                setAdjustmentAmount('');
                setReason('Inventory check');
            }
        });
    };

    const handleUpdateSettings = async () => {
        if (!editingStock || !minStock) return;

        updateStockSettings.mutate({
            id: editingStock.id,
            data: { minStockLevel: parseInt(minStock, 10) }
        }, {
            onSuccess: () => {
                setEditingStock(null);
                setMinStock('');
            }
        });
    };

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <h2 className="text-xl font-bold">Error loading stock levels</h2>
                <Button onClick={() => refetch()}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Inventory Levels
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Track and adjust stock levels across all your distribution outlets.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" asChild className="rounded-xl border-slate-200 shadow-sm px-6">
                        <Link to="/stock/alerts">
                            <AlertCircle className="mr-2 h-4 w-4 text-amber-500" />
                            View Alerts
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <Card className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Search by product name or reference..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-12 pl-11 rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50 focus-visible:ring-primary"
                        />
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                            <Filter className="h-5 w-5 text-slate-400" />
                            <Select value={selectedOutlet} onValueChange={setSelectedOutlet}>
                                <SelectTrigger className="h-12 w-[200px] rounded-2xl border-none bg-slate-100/50 dark:bg-slate-800/50">
                                    <SelectValue placeholder="All Outlets" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                    <SelectItem value="all">All Outlets</SelectItem>
                                    {outlets?.map(outlet => (
                                        <SelectItem key={outlet.id} value={outlet.id}>
                                            {outlet.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => refetch()}
                            disabled={isLoading}
                            className="h-12 w-12 rounded-2xl hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                            <RefreshCcw className={cn("h-5 w-5", isLoading && "animate-spin")} />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50/50 border-none">
                                <TableHead className="py-5 pl-8 font-bold text-slate-900 dark:text-slate-100">Product Info</TableHead>
                                <TableHead className="py-5 font-bold text-slate-900 dark:text-slate-100">Outlet</TableHead>
                                <TableHead className="py-5 font-bold text-slate-900 dark:text-slate-100">Status</TableHead>
                                <TableHead className="py-5 font-bold text-slate-900 dark:text-slate-100">Quantity</TableHead>
                                <TableHead className="py-5 pr-8 text-right font-bold text-slate-900 dark:text-slate-100">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map((i) => (
                                    <TableRow key={i} className="border-none">
                                        <TableCell colSpan={5} className="py-8">
                                            <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse mx-8" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : filteredStocks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-96 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Box className="h-12 w-12 text-slate-300" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xl font-bold text-slate-500">No stock records found</p>
                                                <p className="text-sm text-slate-400">Try adjusting your search or filters.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStocks.map((stock) => {
                                    const isLow = stock.quantity < (stock.minStockLevel ?? stock.product.minStockLevel);

                                    return (
                                        <TableRow key={stock.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-slate-100/50 dark:border-slate-800/50 transition-colors">
                                            <TableCell className="pl-8 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-primary/10 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                                        <Box className="h-6 w-6" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="font-black text-slate-900 dark:text-slate-100 line-clamp-1">{stock.product.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="rounded-lg text-[10px] py-0 font-bold border-slate-200">
                                                                {stock.product.reference}
                                                            </Badge>
                                                            {stock.product.category && (
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                    {stock.product.category.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                                    <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                                        {stock.outlet.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {isLow ? (
                                                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-none rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit animate-pulse">
                                                        <AlertCircle className="h-3.5 w-3.5" />
                                                        Low Stock
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-none rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                                        In Stock
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "text-xl font-black px-4 py-1 rounded-xl transition-all",
                                                        isLow ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20" : "text-slate-900 dark:text-slate-100"
                                                    )}>
                                                        {stock.quantity}
                                                    </div>
                                                    <div className="flex flex-col text-[10px] font-bold text-slate-400">
                                                        <span>MIN</span>
                                                        <span>{stock.minStockLevel ?? stock.product.minStockLevel}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-8 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-xl font-bold border-slate-200 hover:bg-slate-50 transition-colors"
                                                        onClick={() => {
                                                            setEditingStock(stock);
                                                            setMinStock((stock.minStockLevel ?? stock.product.minStockLevel).toString());
                                                        }}
                                                    >
                                                        <Settings2 className="h-4 w-4 mr-2 text-slate-500" />
                                                        Min
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="rounded-xl font-black bg-slate-900 text-white shadow-lg hover:scale-105 transition-all px-4"
                                                        onClick={() => setAdjustingStock(stock)}
                                                    >
                                                        <RefreshCcw className="h-4 w-4 mr-2" />
                                                        Adjust
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Adjust Stock Dialog */}
            <Dialog open={!!adjustingStock} onOpenChange={(open) => !open && setAdjustingStock(null)}>
                <DialogContent className="rounded-3xl border-none shadow-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Adjust Stock</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500">
                            {adjustingStock?.product.name} at {adjustingStock?.outlet.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                            <span className="text-sm font-bold text-slate-500">Current Balance</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{adjustingStock?.quantity}</span>
                        </div>

                        <div className="space-y-3 px-1">
                            <Label className="font-bold text-slate-600 dark:text-slate-400 ml-1">Adjustment Amount</Label>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-2xl transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                                    onClick={() => setAdjustmentAmount((prev) => (parseInt(prev || '0') - 1).toString())}
                                >
                                    <Minus className="h-5 w-5" />
                                </Button>
                                <Input
                                    type="number"
                                    value={adjustmentAmount}
                                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                                    placeholder="e.g. 5 or -5"
                                    className="h-14 text-center text-xl font-black rounded-2xl border-2 focus-visible:ring-primary"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-2xl transition-all hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                                    onClick={() => setAdjustmentAmount((prev) => (parseInt(prev || '0') + 1).toString())}
                                >
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </div>
                            <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest pt-2 flex items-center justify-center gap-2">
                                <History className="h-3 w-3" />
                                Resulting Stock: {adjustingStock ? adjustingStock.quantity + (parseInt(adjustmentAmount) || 0) : 0}
                            </p>
                        </div>

                        <div className="space-y-3 px-1">
                            <Label className="font-bold text-slate-600 dark:text-slate-400 ml-1">Reason for Adjustment</Label>
                            <Input
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Restock, inventory check, etc."
                                className="h-12 rounded-xl border-none bg-slate-100 dark:bg-slate-900 focus-visible:ring-primary"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setAdjustingStock(null)} className="flex-1 rounded-2xl h-12">Cancel</Button>
                        <Button
                            disabled={!adjustmentAmount || adjustStock.isPending}
                            onClick={handleAdjust}
                            className="flex-1 rounded-2xl h-12 bg-primary text-white font-black shadow-xl shadow-primary/20"
                        >
                            {adjustStock.isPending ? 'Saving...' : 'Confirm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Min Stock Dialog */}
            <Dialog open={!!editingStock} onOpenChange={(open) => !open && setEditingStock(null)}>
                <DialogContent className="rounded-3xl border-none shadow-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Configure Reorder Point</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500">
                            Set a minimum stock level for {editingStock?.product.name} at {editingStock?.outlet.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4 px-1">
                        <Label className="font-bold text-slate-600 dark:text-slate-400">Minimum Stock Level</Label>
                        <div className="relative">
                            <Box className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                type="number"
                                value={minStock}
                                onChange={(e) => setMinStock(e.target.value)}
                                placeholder="Alert threshold..."
                                className="h-14 pl-12 text-lg font-bold rounded-2xl border-2 focus-visible:ring-primary"
                            />
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                            When stock falls below this number, a <strong>Stock Alert</strong> will be generated automatically.
                        </p>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setEditingStock(null)} className="flex-1 rounded-2xl h-12">Cancel</Button>
                        <Button
                            disabled={!minStock || updateStockSettings.isPending}
                            onClick={handleUpdateSettings}
                            className="flex-1 rounded-2xl h-12 bg-primary text-white font-black shadow-xl shadow-primary/20"
                        >
                            {updateStockSettings.isPending ? 'Saving...' : 'Update'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
