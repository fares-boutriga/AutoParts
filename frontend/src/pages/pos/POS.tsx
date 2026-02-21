import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCreateOrder } from '@/hooks/useOrders';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Trash2, Plus, Minus, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/lib/auth/store';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface CartItem {
    productId: string;
    name: string;
    sellingPrice: number;
    quantity: number;
    reference: string;
}

export default function POS() {
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const { data: productsData, isLoading } = useProducts({ search, limit: 50 });
    const createOrder = useCreateOrder();
    const user = useAuthStore((state) => state.user);
    const outletId = user?.outlets?.[0]?.outlet?.id;

    const addToCart = (product: any) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.productId === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [
                ...prev,
                {
                    productId: product.id,
                    name: product.name,
                    sellingPrice: product.sellingPrice,
                    quantity: 1,
                    reference: product.reference,
                },
            ];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.productId !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.productId === productId) {
                    const newQuantity = Math.max(1, item.quantity + delta);
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    const totalAmount = cart.reduce(
        (sum, item) => sum + item.sellingPrice * item.quantity,
        0
    );

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!outletId) {
            toast.error('No outlet assigned to your account. Please contact an administrator.');
            return;
        }

        try {
            await createOrder.mutateAsync({
                outletId,
                paymentMethod,
                totalAmount,
                items: cart.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: Number(item.sellingPrice),
                    subtotal: Number(item.sellingPrice) * item.quantity,
                })),
            });
            setCart([]);
            toast.success('Order completed successfully!');
        } catch (error) {
            // Error handling is done in the hook
        }
    };

    return (
        <div className="flex h-full gap-6 p-4 overflow-hidden">
            {/* Product Selection Area */}
            <div className="flex-1 flex flex-col gap-6">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search products by name or reference..."
                        className="pl-11 h-12 bg-background/50 backdrop-blur-sm border-white/10 focus:border-primary/50 transition-all rounded-xl text-lg shadow-lg"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>

                <ScrollArea className="flex-1 -mx-2 px-2">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-primary/50" />
                            <p className="text-muted-foreground animate-pulse font-medium">Loading catalog...</p>
                        </div>
                    ) : !productsData?.data || productsData.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-6">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center ring-1 ring-white/5 animate-bounce">
                                <Search className="h-10 w-10 text-primary/40" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-2xl font-semibold text-foreground/80">No matches found</p>
                                <p className="text-muted-foreground max-w-xs mx-auto">
                                    {search ? `We couldn't find any products matching "${search}"` : 'Your product catalog is currently empty'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-8">
                            {productsData.data.map((product) => (
                                <div
                                    key={product.id}
                                    className="group relative cursor-pointer"
                                    onClick={() => addToCart(product)}
                                >
                                    <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                    <Card className="relative h-full bg-background/60 backdrop-blur-md border-white/5 group-hover:border-primary/30 transition-all duration-300 overflow-hidden shadow-xl hover:shadow-primary/5 rounded-2xl">
                                        <CardContent className="p-4 flex flex-col h-full gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]" title={product.name}>
                                                        {product.name}
                                                    </h3>
                                                    <Badge variant="outline" className="bg-primary/5 border-primary/10 text-[10px] shrink-0 uppercase tracking-wider">
                                                        {product.category?.name || 'General'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 translate-y-0.5">
                                                    <span className="opacity-50 text-[10px]">REF</span>
                                                    {product.reference || 'N/A'}
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Price</span>
                                                        <span className="text-xl font-black text-primary">
                                                            ${Number(product.sellingPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Inventory</span>
                                                        <Badge variant={product.minStockLevel > 5 ? "secondary" : "destructive"} className="px-2 py-0 h-5 text-[10px] font-bold">
                                                            {product.minStockLevel} units
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <Button className="w-full h-9 rounded-xl gap-2 font-bold text-xs bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border-none transition-all">
                                                    <Plus className="h-3 w-3" />
                                                    Add to Order
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Cart Sidebar */}
            <div className="w-[400px] flex flex-col bg-background/40 backdrop-blur-xl border-l border-white/5 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-500">
                <div className="p-6 border-b border-white/5 bg-gradient-to-b from-background/50 to-transparent">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                            </div>
                            Current Order
                        </h2>
                        {cart.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCart([])}
                                className="text-xs text-muted-foreground hover:text-destructive transition-colors h-8"
                            >
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-6">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center">
                                    <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-base font-medium text-muted-foreground">Your cart is empty</p>
                                    <p className="text-xs text-muted-foreground/60 max-w-[180px]">Select products from the catalog to build an order</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div key={item.productId} className="group flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm truncate" title={item.name}>{item.name}</div>
                                            <div className="text-xs text-muted-foreground font-medium mt-0.5">${Number(item.sellingPrice).toFixed(2)} / unit</div>
                                        </div>

                                        <div className="flex items-center bg-background/50 rounded-lg p-1 border border-white/5">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-md hover:bg-white/10"
                                                onClick={() => updateQuantity(item.productId, -1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-8 text-center text-xs font-bold font-mono">{item.quantity}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 rounded-md hover:bg-white/10"
                                                onClick={() => updateQuantity(item.productId, 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        <div className="flex flex-col items-end gap-1.5 min-w-[70px]">
                                            <div className="font-black text-sm text-foreground">
                                                ${(Number(item.sellingPrice) * item.quantity).toFixed(2)}
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.productId)}
                                                className="text-xs text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-6 border-t border-white/5 bg-gradient-to-t from-background/50 to-transparent space-y-6">
                    <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
                            <span className="text-sm font-bold font-mono">${totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-white/5">
                            <span className="text-lg font-black uppercase tracking-tight">Total</span>
                            <span className="text-2xl font-black text-primary font-mono">${totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Payment Method</label>
                            <span className="h-1 w-12 bg-primary/20 rounded-full"></span>
                        </div>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger className="h-12 bg-background/50 border-white/10 rounded-xl font-bold">
                                <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10 rounded-xl">
                                <SelectItem value="cash" className="font-bold py-3 text-sm">Cash Settlement</SelectItem>
                                <SelectItem value="card" className="font-bold py-3 text-sm">Card Payment</SelectItem>
                                <SelectItem value="credit" className="font-bold py-3 text-sm">Store Credit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        className="w-full h-14 text-base font-black uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all bg-gradient-to-r from-primary to-primary/80"
                        size="lg"
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || createOrder.isPending}
                    >
                        {createOrder.isPending ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            'Process Checkout'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
