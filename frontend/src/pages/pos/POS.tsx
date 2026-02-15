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
    const { data: productsData, isLoading } = useProducts({ search, limit: 50 });
    const createOrder = useCreateOrder();

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

        try {
            await createOrder.mutateAsync({
                items: cart.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.sellingPrice,
                })),
                status: 'COMPLETED',
            });
            setCart([]);
            toast.success('Order completed successfully!');
        } catch (error) {
            // Error handling is done in the hook
        }
    };

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-4">
            {/* Product Selection Area */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>

                <ScrollArea className="flex-1 rounded-md border p-4">
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : !productsData?.data || productsData.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                <Search className="h-10 w-10 text-primary" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-lg font-medium">No products found</p>
                                <p className="text-sm text-muted-foreground">
                                    {search ? 'Try a different search term' : 'Add products to get started'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {productsData.data.map((product) => (
                                <Card
                                    key={product.id}
                                    className="cursor-pointer hover:bg-accent transition-colors"
                                    onClick={() => addToCart(product)}
                                >
                                    <CardContent className="p-4 flex flex-col gap-2">
                                        <div className="font-semibold truncate" title={product.name}>
                                            {product.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">{product.reference}</div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="font-bold">${Number(product.sellingPrice).toFixed(2)}</span>
                                            <Badge variant={product.minStockLevel > 0 ? "outline" : "destructive"}>
                                                stock: {product.minStockLevel}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Cart Sidebar */}
            <div className="w-96 flex flex-col border rounded-md bg-card">
                <div className="p-4 border-b">
                    <h2 className="font-semibold flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" /> Current Order
                    </h2>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {cart.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                Cart is empty
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.productId} className="flex gap-2 items-center">
                                    <div className="flex-1">
                                        <div className="font-medium text-sm line-clamp-1">{item.name}</div>
                                        <div className="text-xs text-muted-foreground">${Number(item.sellingPrice).toFixed(2)}</div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => updateQuantity(item.productId, -1)}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => updateQuantity(item.productId, 1)}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    <div className="w-16 text-right font-medium text-sm">
                                        ${(Number(item.sellingPrice) * item.quantity).toFixed(2)}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-destructive hover:text-destructive"
                                        onClick={() => removeFromCart(item.productId)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-muted/50 space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span>${totalAmount.toFixed(2)}</span>
                    </div>

                    <Button
                        className="w-full"
                        size="lg"
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || createOrder.isPending}
                    >
                        {createOrder.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Checkout
                    </Button>
                </div>
            </div>
        </div>
    );
}
