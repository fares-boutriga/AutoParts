import { useState, useMemo } from 'react';
import { useAuthStore } from '@/lib/auth/store';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useOrders, useCreateOrder } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    Plus,
    Minus,
    Trash2,
    ShoppingCart,
    User,
    CreditCard,
    Printer,
    CheckCircle2,
    Package,
    AlertCircle,
    X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/api/endpoints/products';

interface CartItem {
    product: Product;
    quantity: number;
}

export default function POS() {
    const [search, setSearch] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const { user } = useAuthStore();
    const { data: productsData, isLoading: isLoadingProducts } = useProducts({ search, limit: 50 });
    const { data: customersData } = useCustomers({ limit: 100 });
    const { mutate: createOrder } = useCreateOrder();

    const currentOutletId = user?.outlets?.[0]?.outlet.id;

    const filteredProducts = productsData?.data ?? [];
    const customers = customersData?.data ?? [];

    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + Number(item.product.sellingPrice) * item.quantity, 0);
    }, [cart]);

    const addToCart = (product: Product) => {
        if (Number(product.totalQuantity) <= 0) {
            toast.error('Product out of stock');
            return;
        }

        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                if (existing.quantity >= Number(product.totalQuantity)) {
                    toast.error('Cannot add more than available stock');
                    return prev;
                }
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prev) => {
            return prev.map((item) => {
                if (item.product.id === productId) {
                    const newQty = item.quantity + delta;
                    if (newQty > Number(item.product.totalQuantity)) {
                        toast.error('Exceeds available stock');
                        return item;
                    }
                    return newQty > 0 ? { ...item, quantity: newQty } : item;
                }
                return item;
            });
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.error('Cart is empty');
            return;
        }

        if (!currentOutletId) {
            toast.error('No outlet assigned to your account');
            return;
        }

        setIsProcessing(true);
        createOrder(
            {
                customerId: selectedCustomerId || undefined,
                items: cart.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    unitPrice: Number(item.product.sellingPrice),
                    subtotal: Number(item.product.sellingPrice) * item.quantity,
                })),
                totalAmount: cartTotal,
                paymentMethod: 'cash',
                outletId: currentOutletId,
            },
            {
                onSuccess: () => {
                    toast.success('Order completed successfully!');
                    setCart([]);
                    setSelectedCustomerId('');
                    setIsProcessing(false);
                },
                onError: () => {
                    toast.error('Failed to process order');
                    setIsProcessing(false);
                },
            }
        );
    };

    return (
        <div className="flex h-[calc(100vh-120px)] gap-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Product Selection Side */}
            <div className="flex-1 flex flex-col space-y-4 min-w-0">
                <Card className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Parts Selection
                            </CardTitle>
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search parts or reference..."
                                    className="pl-9 h-10 rounded-xl border-none bg-slate-100 dark:bg-slate-800 focus-visible:ring-2 focus-visible:ring-primary/20"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                {search && (
                                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-full">
                        <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                            {isLoadingProducts ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                    ))}
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                    <Package className="h-16 w-16 mb-4 opacity-20" />
                                    <p className="text-lg font-bold">No products found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredProducts.map((product) => (
                                        <button
                                            key={product.id}
                                            disabled={Number(product.totalQuantity) <= 0}
                                            onClick={() => addToCart(product)}
                                            className={cn(
                                                "group relative flex flex-col p-4 rounded-2xl border-2 transition-all text-left",
                                                Number(product.totalQuantity) > 0
                                                    ? "bg-white dark:bg-slate-900 border-white hover:border-primary/50 dark:border-slate-900 shadow-lg hover:shadow-primary/10 hover:scale-[1.02]"
                                                    : "bg-slate-50 dark:bg-slate-950 border-transparent opacity-60 cursor-not-allowed"
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="outline" className="rounded-lg font-mono text-[10px] py-0">
                                                    {product.reference}
                                                </Badge>
                                                <span className="text-lg font-black text-primary">
                                                    ${Number(product.sellingPrice).toFixed(2)}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                                {product.name}
                                            </h3>
                                            <div className="mt-auto flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={cn(
                                                        "h-2 w-2 rounded-full",
                                                        Number(product.totalQuantity) > 10 ? "bg-emerald-500" :
                                                            Number(product.totalQuantity) > 0 ? "bg-amber-500" : "bg-rose-500"
                                                    )} />
                                                    <span className="text-xs font-bold text-slate-500">
                                                        {product.totalQuantity} in stock
                                                    </span>
                                                </div>
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                                    <Plus className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Cart Side */}
            <div className="w-[450px] flex flex-col space-y-4">
                <Card className="flex-1 flex flex-col border-none shadow-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-white dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-xl font-black">
                                <ShoppingCart className="h-6 w-6 text-primary" />
                                Shopping Cart
                            </CardTitle>
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1 rounded-full font-black uppercase text-[10px]">
                                {cart.length} items
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                        {/* Customer Selection */}
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Walk-in Customer</label>
                                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                                    <SelectTrigger className="h-11 rounded-xl border-none bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-primary/20">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-slate-400" />
                                            <SelectValue placeholder="Select a customer (Optional)" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl bg-white dark:bg-slate-900">
                                        <SelectItem value="walk-in" className="rounded-lg">Walk-in Customer</SelectItem>
                                        {customers.map((c) => (
                                            <SelectItem key={c.id} value={c.id} className="rounded-lg">
                                                {c.name}
                                                {c.phone && <span className="ml-2 text-[10px] text-slate-400">({c.phone})</span>}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Cart Items */}
                        <ScrollArea className="flex-1 px-4">
                            {cart.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center text-slate-300">
                                    <ShoppingCart className="h-12 w-12 mb-2 opacity-20" />
                                    <p className="font-bold">Cart is empty</p>
                                </div>
                            ) : (
                                <div className="space-y-4 py-4">
                                    {cart.map((item) => (
                                        <div key={item.product.id} className="group flex items-start justify-between gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            <div className="space-y-1 min-w-0">
                                                <p className="font-bold text-sm truncate leading-tight group-hover:text-primary transition-colors">
                                                    {item.product.name}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                        REF: {item.product.reference}
                                                    </span>
                                                    <span className="text-xs font-black text-primary">
                                                        ${Number(item.product.sellingPrice).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, -1)}
                                                        className="p-1 px-2 hover:text-primary transition-colors"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, 1)}
                                                        className="p-1 px-2 hover:text-primary transition-colors"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.product.id)}
                                                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-white dark:border-slate-800">
                        <div className="w-full space-y-2">
                            <div className="flex justify-between text-slate-500 font-bold text-sm">
                                <span>Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-xl font-black">Total Amount</span>
                                <span className="text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    ${cartTotal.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full">
                            <Button
                                variant="outline"
                                className="h-14 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest gap-2"
                                disabled={cart.length === 0}
                            >
                                <Printer className="h-4 w-4" />
                                Save Draft
                            </Button>
                            <Button
                                className="h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                                disabled={cart.length === 0 || isProcessing}
                                onClick={handleCheckout}
                            >
                                {isProcessing ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CreditCard className="h-4 w-4" />
                                        Pay & Complete
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardFooter>
                </Card>

                {/* Quick Info */}
                <Card className="border-none shadow-xl bg-primary/5 border border-primary/10">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold text-primary/80 leading-snug">
                            Make sure to double check product references before completing the order.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
