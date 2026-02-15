import { useState } from 'react';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Plus,
    Search,
    MoreHorizontal,
    Pencil,
    Trash2,
    Package,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function ProductList() {
    const [search, setSearch] = useState('');
    const [page] = useState(1);
    const { data, isLoading, isError } = useProducts({ page, search, limit: 10 });
    const deleteProduct = useDeleteProduct();

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            await deleteProduct.mutateAsync(id);
        }
    };

    if (isError) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <Card className="max-w-md border-destructive/50 shadow-lg shadow-destructive/10">
                    <CardContent className="p-6 text-center space-y-4">
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto animate-bounce" />
                        <h2 className="text-xl font-bold">Error Loading Products</h2>
                        <p className="text-muted-foreground">Detailed trace: We couldn't fetch the products from the server. Please check your connection and try again.</p>
                        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const totalProducts = data?.meta?.total || 0;
    const lowStockCount = data?.data?.filter(p => (p.minStockLevel || 0) > 0).length || 0; // Simplified for demo
    const activeProducts = data?.data?.filter(p => p.isActive).length || 0;

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient-x">
                        Product Inventory
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Manage your wholesale parts and monitor stock levels in real-time.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild className="rounded-xl px-6 bg-gradient-to-r from-primary to-secondary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all duration-300">
                        <Link to="/products/new">
                            <Plus className="mr-2 h-5 w-5" /> Add New Product
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Total Products', value: totalProducts, icon: Package, color: 'primary' },
                    { label: 'Low Stock Items', value: lowStockCount, icon: AlertTriangle, color: 'amber' },
                    { label: 'Active Status', value: activeProducts, icon: CheckCircle2, color: 'emerald' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl group hover:scale-[1.02] transition-all duration-300">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-3xl font-bold">{stat.value}</p>
                            </div>
                            <div className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner",
                                stat.color === 'primary' ? "bg-primary/10 text-primary" :
                                    stat.color === 'amber' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                            )}>
                                <stat.icon className="h-7 w-7 transition-transform group-hover:rotate-12" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Area */}
            <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 p-0">
                    <div className="p-6 flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Filter products by name, reference or supplier..."
                                className="pl-11 h-12 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-2xl ring-offset-background placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 border-none hover:bg-slate-50/50">
                                <TableHead className="py-4 pl-8 font-bold text-slate-700 dark:text-slate-300">Reference</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-300">Product Identity</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-300">Category</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-300">Pricing</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-300">Stock Status</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-300 text-center">Visibility</TableHead>
                                <TableHead className="py-4 pr-8 text-right font-bold text-slate-700 dark:text-slate-300">Options</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="relative">
                                                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                                <Package className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
                                            </div>
                                            <span className="text-lg font-semibold text-slate-500 animate-pulse">Synchronizing inventory...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : !data?.data || data.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-96 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-6 max-w-sm mx-auto">
                                            <div className="h-32 w-32 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner relative overflow-hidden">
                                                <Package className="h-16 w-16 text-slate-300 relative z-10" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-2xl font-bold">No items match your criteria</p>
                                                <p className="text-slate-500 font-medium">
                                                    {search ? "We couldn't find any products matching your search terms." : "Your inventory is currently empty. Start building your database."}
                                                </p>
                                            </div>
                                            {search && (
                                                <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5" onClick={() => setSearch('')}>
                                                    Clear search filters
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.data.map((product) => (
                                    <TableRow
                                        key={product.id}
                                        className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/80 border-slate-100/50 dark:border-slate-800/50 transition-colors"
                                    >
                                        <TableCell className="pl-8">
                                            <span className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-primary font-bold">
                                                {product.reference || 'REF-N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                    <Package className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 dark:text-slate-100">{product.name}</span>
                                                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">{product.supplier || 'Unknown Supplier'}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {product.category ? (
                                                <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-bold rounded-lg px-3 py-1 capitalize">
                                                    {product.category.name}
                                                </Badge>
                                            ) : (
                                                <span className="text-slate-400 italic text-sm">Uncategorized</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-lg font-black text-slate-900 dark:text-slate-100">${Number(product.sellingPrice).toFixed(2)}</span>
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Cost: ${Number(product.purchasePrice).toFixed(2)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1.5 min-w-[120px]">
                                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                                                    <span>Stock</span>
                                                    <span>Min: {product.minStockLevel || 0}</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                    {/* Using minStockLevel as dummy current stock since we don't have stock data yet */}
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-1000",
                                                            (product.minStockLevel > 20) ? "bg-emerald-500" :
                                                                (product.minStockLevel > 5) ? "bg-amber-500" : "bg-rose-500"
                                                        )}
                                                        style={{ width: `${Math.min((product.minStockLevel / 50) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={cn(
                                                "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none shadow-sm",
                                                product.isActive
                                                    ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                                                    : "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                                            )}>
                                                {product.isActive ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        Active
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                                        Inactive
                                                    </div>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all">
                                                        <MoreHorizontal className="h-5 w-5 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-2xl w-48 border-none shadow-2xl p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                                                    <DropdownMenuLabel className="px-4 py-2 font-black uppercase text-[10px] tracking-widest text-slate-400">Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild className="rounded-xl px-4 py-3 focus:bg-primary/5 cursor-pointer">
                                                        <Link to={`/products/${product.id}/edit`} className="flex items-center">
                                                            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mr-3">
                                                                <Pencil className="h-4 w-4" />
                                                            </div>
                                                            <span className="font-bold">Edit Details</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-100 dark:border-slate-800 my-1 mx-2" />
                                                    <DropdownMenuItem
                                                        className="rounded-xl px-4 py-3 focus:bg-rose-500/10 text-rose-500 focus:text-rose-600 cursor-pointer font-bold"
                                                        onClick={() => handleDelete(product.id)}
                                                    >
                                                        <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center mr-3">
                                                            <Trash2 className="h-4 w-4" />
                                                        </div>
                                                        Delete Product
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

            {/* Pagination Placeholder */}
            {(data?.meta?.totalPages || 0) > 1 && (
                <div className="flex items-center justify-center gap-2 py-4">
                    <Button variant="outline" className="rounded-xl border-none shadow-md" disabled={page === 1}>Previous</Button>
                    <div className="flex gap-1.5">
                        {Array.from({ length: data?.meta?.totalPages || 0 }, (_, i) => i + 1).map((p) => (
                            <Button
                                key={p}
                                variant={p === page ? 'default' : 'ghost'}
                                className={cn(
                                    "h-10 w-10 rounded-xl font-bold shadow-sm",
                                    p === page ? "bg-primary text-white shadow-primary/20 scale-110" : "hover:bg-primary/10 hover:text-primary"
                                )}
                            >
                                {p}
                            </Button>
                        ))}
                    </div>
                    <Button variant="outline" className="rounded-xl border-none shadow-md" disabled={page === (data?.meta?.totalPages || 0)}>Next</Button>
                </div>
            )}
        </div>
    );
}
