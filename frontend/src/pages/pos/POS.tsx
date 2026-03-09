import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '@/lib/auth/store';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCreateOrder } from '@/hooks/useOrders';
import { useOutlets } from '@/hooks/useOutlets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
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
    Package,
    AlertCircle,
    X,
    Receipt,
    LayoutGrid,
    List,
    ScanLine,
    Camera,
    Keyboard,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import type { Product } from '@/lib/api/endpoints/products';
import productsApi from '@/lib/api/endpoints/products';
import InvoiceModal from '@/components/InvoiceModal';

interface CartItem {
    product: Product;
    quantity: number;
}

type ScanState = 'idle' | 'scanning' | 'success';
type ScanErrorType =
    | 'not_found'
    | 'out_of_stock'
    | 'camera_permission'
    | 'camera_unsupported'
    | 'camera_init'
    | 'backend';

type BarcodeDetectorResult = { rawValue?: string };
type BarcodeDetectorInstance = {
    detect: (source: ImageBitmapSource | HTMLVideoElement) => Promise<BarcodeDetectorResult[]>;
};

type BarcodeDetectorCtor = {
    new (options?: { formats?: string[] }): BarcodeDetectorInstance;
    getSupportedFormats?: () => Promise<string[]>;
};

export default function POS() {
    const [productsView, setProductsView] = useState<'cards' | 'list'>('cards');
    const [search, setSearch] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastOrderId, setLastOrderId] = useState<string | null>(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [scanModalOpen, setScanModalOpen] = useState(false);
    const [scanState, setScanState] = useState<ScanState>('idle');
    const [scanErrorOpen, setScanErrorOpen] = useState(false);
    const [scanErrorType, setScanErrorType] = useState<ScanErrorType | null>(null);
    const [scanErrorMessage, setScanErrorMessage] = useState('');
    const [manualBarcode, setManualBarcode] = useState('');
    const [isCameraSupported, setIsCameraSupported] = useState(true);
    const [isCameraLoading, setIsCameraLoading] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const detectorRef = useRef<BarcodeDetectorInstance | null>(null);
    const scanFrameRef = useRef<number | null>(null);
    const isScanRunningRef = useRef(false);
    const isProcessingCodeRef = useRef(false);
    const lastScannedCodeRef = useRef('');

    const { user } = useAuthStore();
    const { data: productsData, isLoading: isLoadingProducts } = useProducts({ search, limit: 50 });
    const { data: customersData } = useCustomers({ limit: 100 });
    const { data: outletsData } = useOutlets();
    const { mutate: createOrder } = useCreateOrder();
    const { t } = useTranslation();

    const currentOutletId = user?.outlets?.[0]?.outlet.id ?? outletsData?.[0]?.id;

    const filteredProducts = productsData?.data ?? [];
    const customers = customersData?.data ?? [];
    const effectiveCustomerId = selectedCustomerId === 'walk-in' ? '' : selectedCustomerId;

    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + Number(item.product.sellingPrice) * item.quantity, 0);
    }, [cart]);

    const addToCart = (product: Product, options?: { showToast?: boolean }) => {
        const showToast = options?.showToast ?? true;
        if (Number(product.totalQuantity) <= 0) {
            if (showToast) toast.error(t('pos_page.toast.outOfStock'));
            return { ok: false as const, reason: 'out_of_stock' as const };
        }

        let result: { ok: true } | { ok: false; reason: 'exceeds_stock' } = { ok: true };
        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                if (existing.quantity >= Number(product.totalQuantity)) {
                    if (showToast) toast.error(t('pos_page.toast.exceedsStock'));
                    result = { ok: false, reason: 'exceeds_stock' };
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

        return result;
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart((prev) => {
            return prev.map((item) => {
                if (item.product.id === productId) {
                    const newQty = item.quantity + delta;
                    if (newQty > Number(item.product.totalQuantity)) {
                        toast.error(t('pos_page.toast.exceedsAvailable'));
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
            toast.error(t('pos_page.toast.cartEmpty'));
            return;
        }

        setIsProcessing(true);
        createOrder(
            {
                customerId: effectiveCustomerId || undefined,
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
                onSuccess: (order: any) => {
                    toast.success(t('pos_page.toast.success'));
                    setCart([]);
                    setSelectedCustomerId('');
                    setIsProcessing(false);
                    if (order?.id) {
                        setLastOrderId(order.id);
                        setShowInvoice(true);
                    }
                },
                onError: () => {
                    toast.error(t('pos_page.toast.error'));
                    setIsProcessing(false);
                },
            }
        );
    };

    const stopScanner = () => {
        isScanRunningRef.current = false;
        if (scanFrameRef.current) {
            cancelAnimationFrame(scanFrameRef.current);
            scanFrameRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const openScanError = (type: ScanErrorType) => {
        stopScanner();
        setScanState('idle');
        setIsCameraLoading(false);
        setScanErrorType(type);
        setScanErrorMessage(t(`pos_page.scan.errors.${type}`));
        setScanErrorOpen(true);
    };

    const resolveAndAddByBarcode = async (rawCode: string) => {
        const code = rawCode.trim();
        if (!code) return;
        if (isProcessingCodeRef.current) return;

        isProcessingCodeRef.current = true;
        try {
            const product = await productsApi.getByReference(code);
            const addResult = addToCart(product, { showToast: false });
            if (!addResult.ok) {
                openScanError('out_of_stock');
                return;
            }

            setScanState('success');
            setManualBarcode('');
            setScanModalOpen(false);
            stopScanner();
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 404) {
                openScanError('not_found');
            } else {
                openScanError('backend');
            }
        } finally {
            isProcessingCodeRef.current = false;
        }
    };

    const runScanLoop = async () => {
        if (!isScanRunningRef.current || !videoRef.current || !detectorRef.current) return;

        try {
            const hasFrame = videoRef.current.readyState >= 2;
            if (hasFrame) {
                const results = await detectorRef.current.detect(videoRef.current);
                const detected = results.find((item) => Boolean(item.rawValue?.trim()));

                if (detected?.rawValue) {
                    const code = detected.rawValue.trim();
                    if (code && code !== lastScannedCodeRef.current) {
                        lastScannedCodeRef.current = code;
                        await resolveAndAddByBarcode(code);
                        return;
                    }
                }
            }
        } catch {
            openScanError('camera_init');
            return;
        }

        scanFrameRef.current = requestAnimationFrame(() => {
            runScanLoop();
        });
    };

    const startCameraScanner = async () => {
        stopScanner();
        setScanState('idle');
        setIsCameraLoading(true);
        setIsCameraSupported(true);
        lastScannedCodeRef.current = '';

        const BarcodeDetectorClass = (window as any).BarcodeDetector as BarcodeDetectorCtor | undefined;

        if (!navigator.mediaDevices?.getUserMedia || !BarcodeDetectorClass) {
            setIsCameraSupported(false);
            setIsCameraLoading(false);
            openScanError('camera_unsupported');
            return;
        }

        try {
            detectorRef.current = new BarcodeDetectorClass({
                formats: [
                    'ean_13',
                    'ean_8',
                    'upc_a',
                    'upc_e',
                    'code_128',
                    'code_39',
                    'codabar',
                    'itf',
                ],
            });

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                },
                audio: false,
            });

            streamRef.current = stream;
            if (!videoRef.current) {
                setIsCameraLoading(false);
                openScanError('camera_init');
                return;
            }

            videoRef.current.srcObject = stream;
            await videoRef.current.play();

            isScanRunningRef.current = true;
            setScanState('scanning');
            setIsCameraLoading(false);
            runScanLoop();
        } catch (error: any) {
            setIsCameraLoading(false);
            const denied = error?.name === 'NotAllowedError' || error?.name === 'SecurityError';
            setIsCameraSupported(false);
            openScanError(denied ? 'camera_permission' : 'camera_init');
        }
    };

    const handleManualScanSubmit = async () => {
        if (!manualBarcode.trim()) return;
        await resolveAndAddByBarcode(manualBarcode);
    };

    const handleRetryScan = () => {
        setScanErrorOpen(false);
        if (!scanModalOpen) setScanModalOpen(true);
        const shouldRestartCamera = isCameraSupported || (
            scanErrorType === 'camera_permission' ||
            scanErrorType === 'camera_unsupported' ||
            scanErrorType === 'camera_init'
        );
        if (shouldRestartCamera) {
            void startCameraScanner();
        }
    };

    useEffect(() => {
        if (scanModalOpen) {
            startCameraScanner();
            return;
        }
        stopScanner();
    }, [scanModalOpen]);

    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    return (
        <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-120px)] gap-4 lg:gap-6 overflow-x-hidden lg:overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Product Selection Side */}
            <div className="flex-1 flex flex-col space-y-4 min-w-0">
                <Card className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <CardTitle className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                {t('pos_page.partsSelection')}
                            </CardTitle>
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                                <div className="relative w-full sm:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder={t('pos_page.searchPlaceholder')}
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
                                <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setProductsView('cards')}
                                        className={cn(
                                            'h-8 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all inline-flex items-center gap-1.5',
                                            productsView === 'cards'
                                                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                                : 'text-slate-500 dark:text-slate-300 hover:text-primary'
                                        )}
                                    >
                                        <LayoutGrid className="h-3.5 w-3.5" />
                                        {t('pos_page.viewCards')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setProductsView('list')}
                                        className={cn(
                                            'h-8 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all inline-flex items-center gap-1.5',
                                            productsView === 'list'
                                                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                                : 'text-slate-500 dark:text-slate-300 hover:text-primary'
                                        )}
                                    >
                                        <List className="h-3.5 w-3.5" />
                                        {t('pos_page.viewList')}
                                    </button>
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => setScanModalOpen(true)}
                                    className="h-10 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2"
                                >
                                    <ScanLine className="h-4 w-4" />
                                    {t('pos_page.scan.openScanner')}
                                </Button>
                            </div>
                        </div>
                        <p className="text-xs font-bold text-slate-500">
                            {filteredProducts.length} {t('pos_page.productsFound')}
                        </p>
                    </CardHeader>
                    <CardContent className="h-full">
                        <ScrollArea className="h-[48vh] sm:h-[52vh] lg:h-[calc(100vh-280px)] pr-2 sm:pr-4">
                            {isLoadingProducts ? (
                                productsView === 'cards' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                        ))}
                                    </div>
                                )
                            ) : filteredProducts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                    <Package className="h-16 w-16 mb-4 opacity-20" />
                                    <p className="text-lg font-bold">{t('pos_page.noProducts')}</p>
                                </div>
                            ) : productsView === 'cards' ? (
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
                                                    {Number(product.sellingPrice).toFixed(2)} TND
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
                                                        {product.totalQuantity} {t('pos_page.inStock')}
                                                    </span>
                                                </div>
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                                    <Plus className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredProducts.map((product) => {
                                        const isOutOfStock = Number(product.totalQuantity) <= 0;
                                        return (
                                            <button
                                                key={product.id}
                                                disabled={isOutOfStock}
                                                onClick={() => addToCart(product)}
                                                className={cn(
                                                    'w-full rounded-2xl p-3 border transition-all text-left',
                                                    isOutOfStock
                                                        ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800 opacity-60 cursor-not-allowed'
                                                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10'
                                                )}
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline" className="rounded-lg font-mono text-[10px] py-0">
                                                                {product.reference || '-'}
                                                            </Badge>
                                                            <span className="text-xs font-bold text-slate-500">
                                                                {product.totalQuantity} {t('pos_page.inStock')}
                                                            </span>
                                                        </div>
                                                        <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                                                            {product.name}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <div className="text-right">
                                                            <p className="text-lg font-black text-primary">
                                                                {Number(product.sellingPrice).toFixed(2)} TND
                                                            </p>
                                                            <p className={cn(
                                                                'text-[10px] font-bold uppercase tracking-wider',
                                                                isOutOfStock ? 'text-rose-500' : 'text-emerald-500'
                                                            )}>
                                                                {isOutOfStock ? t('pos_page.outOfStockTag') : t('pos_page.add')}
                                                            </p>
                                                        </div>
                                                        <div className={cn(
                                                            'h-9 w-9 rounded-xl flex items-center justify-center',
                                                            isOutOfStock ? 'bg-slate-200 dark:bg-slate-700 text-slate-400' : 'bg-primary/10 text-primary'
                                                        )}>
                                                            <Plus className="h-4 w-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Cart Side */}
            <div className="w-full lg:w-[420px] xl:w-[450px] flex flex-col space-y-4">
                <Card className="flex flex-col lg:flex-1 max-h-[72vh] lg:max-h-none border-none shadow-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-white dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-xl font-black">
                                <ShoppingCart className="h-6 w-6 text-primary" />
                                {t('pos_page.shoppingCart')}
                            </CardTitle>
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1 rounded-full font-black uppercase text-[10px]">
                                {cart.length} {t('pos_page.itemsCount')}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                        {/* Customer Selection */}
                        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pos_page.walkInCustomer')}</label>
                                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                                    <SelectTrigger className="h-11 rounded-xl border-none bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-primary/20">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-slate-400" />
                                            <SelectValue placeholder={t('pos_page.selectCustomer')} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl bg-white dark:bg-slate-900">
                                        <SelectItem value="walk-in" className="rounded-lg">{t('pos_page.walkInCustomer')}</SelectItem>
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
                                    <p className="font-bold">{t('pos_page.cartEmpty')}</p>
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
                                                        {Number(item.product.sellingPrice).toFixed(2)} TND
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
                                <span>{t('pos_page.subtotal')}</span>
                                <span>{cartTotal.toFixed(2)} TND</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-xl font-black">{t('pos_page.totalAmount')}</span>
                                <span className="text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    {cartTotal.toFixed(2)} TND
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
                                {t('pos_page.saveDraft')}
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
                                        {t('pos_page.payComplete')}
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
                            {t('pos_page.infoText')}
                        </p>
                    </CardContent>
                </Card>

                {/* Last invoice button */}
                {lastOrderId && (
                    <button
                        onClick={() => setShowInvoice(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/5 transition-colors"
                    >
                        <Receipt className="h-4 w-4" />
                        Voir la facture
                    </button>
                )}
            </div>

            {/* Scan Modal */}
            <Dialog
                open={scanModalOpen}
                onOpenChange={(open) => {
                    setScanModalOpen(open);
                    if (!open) setManualBarcode('');
                }}
            >
                <DialogContent className="max-w-lg rounded-3xl border-none p-0 overflow-hidden shadow-2xl">
                    <DialogTitle className="sr-only">{t('pos_page.scan.title')}</DialogTitle>
                    <DialogDescription className="sr-only">{t('pos_page.scan.description')}</DialogDescription>
                    <div className="p-5 border-b bg-slate-50 dark:bg-slate-900/70">
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <ScanLine className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-black text-base">{t('pos_page.scan.title')}</p>
                                <p className="text-xs text-slate-500">{t('pos_page.scan.helper')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-5 space-y-4">
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 h-64">
                            {isCameraSupported ? (
                                <>
                                    <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
                                    {isCameraLoading && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white gap-2">
                                            <Camera className="h-6 w-6 animate-pulse" />
                                            <p className="text-sm font-bold">{t('pos_page.scan.startingCamera')}</p>
                                        </div>
                                    )}
                                    {scanState === 'scanning' && !isCameraLoading && (
                                        <div className="absolute inset-x-0 bottom-3 flex justify-center">
                                            <p className="text-[11px] font-black uppercase tracking-widest bg-black/60 text-white px-3 py-1 rounded-full">
                                                {t('pos_page.scan.scanning')}
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center text-slate-500 gap-2 p-6 text-center">
                                    <Camera className="h-8 w-8 opacity-40" />
                                    <p className="font-bold">{t('pos_page.scan.cameraUnavailable')}</p>
                                    <p className="text-xs">{t('pos_page.scan.useManual')}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className="text-[11px] font-bold text-slate-500">
                                {scanState === 'scanning'
                                    ? t('pos_page.scan.stateScanning')
                                    : scanState === 'success'
                                        ? t('pos_page.scan.stateSuccess')
                                        : t('pos_page.scan.stateIdle')}
                            </p>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 inline-flex items-center gap-1.5">
                                <Keyboard className="h-3.5 w-3.5" />
                                {t('pos_page.scan.manualLabel')}
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    value={manualBarcode}
                                    onChange={(e) => setManualBarcode(e.target.value)}
                                    placeholder={t('pos_page.scan.manualPlaceholder')}
                                    className="h-11 rounded-xl"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleManualScanSubmit();
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    onClick={handleManualScanSubmit}
                                    disabled={!manualBarcode.trim()}
                                    className="h-11 rounded-xl"
                                >
                                    {t('pos_page.scan.addByCode')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Scan Error Modal */}
            <Dialog open={scanErrorOpen} onOpenChange={setScanErrorOpen}>
                <DialogContent className="max-w-md rounded-3xl border-none p-0 overflow-hidden shadow-2xl">
                    <DialogTitle className="sr-only">{t('pos_page.scan.errorTitle')}</DialogTitle>
                    <DialogDescription className="sr-only">{t('pos_page.scan.errorDescription')}</DialogDescription>
                    <div className="p-5 border-b bg-rose-50 dark:bg-rose-900/20">
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-300">
                            <AlertCircle className="h-5 w-5" />
                            <p className="font-black">{t('pos_page.scan.errorTitle')}</p>
                        </div>
                    </div>
                    <div className="p-5 space-y-4">
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            {scanErrorMessage}
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => setScanErrorOpen(false)}
                            >
                                {t('pos_page.scan.close')}
                            </Button>
                            <Button
                                className="rounded-xl"
                                onClick={handleRetryScan}
                            >
                                {t('pos_page.scan.retry')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Invoice Modal */}
            <InvoiceModal
                orderId={lastOrderId}
                open={showInvoice}
                onClose={() => setShowInvoice(false)}
            />
        </div>
    );
}
