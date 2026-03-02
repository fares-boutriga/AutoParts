import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateProduct, useUpdateProduct, useProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Loader2,
    Plus,
    Package,
    Tag,
    DollarSign,
    Boxes,
    Truck,
    ArrowLeft,
    CheckCircle2,
    Info
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type CreateProductDto } from '@/lib/api/endpoints/products';
import { CategoryForm } from '../categories/CategoryForm';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const productSchema = z.object({
    name: z.string().min(2, 'product_form.validation.nameShort'),
    reference: z.string().optional(),
    sellingPrice: z.coerce.number().min(0, 'product_form.validation.positivePrice'),
    purchasePrice: z.coerce.number().min(0, 'product_form.validation.positivePrice'),
    minStockLevel: z.coerce.number().min(0, 'product_form.validation.positiveStock'),
    initialQuantity: z.coerce.number().min(0).optional(),
    categoryId: z.string().optional(),
    supplier: z.string().optional(),
    isActive: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductForm() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);

    const { data: product, isLoading: isLoadingProduct } = useProduct(id || '');
    const { data: categories } = useCategories();
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            sellingPrice: 0,
            purchasePrice: 0,
            minStockLevel: 5,
            initialQuantity: 0,
            isActive: true,
            reference: '',
            categoryId: 'none',
            supplier: '',
        } as any,
    });

    useEffect(() => {
        if (product) {
            setValue('name', product.name);
            setValue('reference', product.reference || '');
            setValue('sellingPrice', product.sellingPrice);
            setValue('purchasePrice', product.purchasePrice);
            setValue('minStockLevel', product.minStockLevel);
            setValue('categoryId', product.categoryId || 'none');
            setValue('supplier', product.supplier || '');
            setValue('isActive', product.isActive);
        }
    }, [product, setValue, id]);

    const onSubmit = async (data: ProductFormValues) => {
        const payload: CreateProductDto = {
            ...data,
            categoryId: (data.categoryId === 'none' || !data.categoryId) ? undefined : data.categoryId,
        };

        if (isEditMode && id) {
            await updateProduct.mutateAsync({ id, data: payload });
        } else {
            await createProduct.mutateAsync(payload);
        }
        navigate('/products');
    };

    const isLoading = createProduct.isPending || updateProduct.isPending || (isEditMode && isLoadingProduct);

    if (isEditMode && isLoadingProduct) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="text-lg font-bold text-slate-500 animate-pulse">{t('product_form.loadingData')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/products')}
                    className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {isEditMode ? t('product_form.titleUpdate') : t('product_form.titleAdd')}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {isEditMode ? t('product_form.descUpdate') : t('product_form.descAdd')}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Information Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl overflow-hidden">
                            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-primary" /> {t('product_form.generalIdentity.title')}
                                </CardTitle>
                                <CardDescription>{t('product_form.generalIdentity.desc')}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-500">{t('product_form.generalIdentity.nameLabel')}</Label>
                                    <Input
                                        id="name"
                                        {...register('name')}
                                        placeholder={t('product_form.generalIdentity.namePlaceholder')}
                                        className="h-12 rounded-xl border-slate-200 focus:ring-primary font-medium"
                                    />
                                    {errors.name && <p className="text-xs font-bold text-rose-500 flex items-center gap-1"><Info className="h-3 w-3" /> {t(String(errors.name.message))}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="reference" className="text-xs font-black uppercase tracking-widest text-slate-500">{t('product_form.generalIdentity.refLabel')}</Label>
                                        <div className="relative">
                                            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="reference"
                                                {...register('reference')}
                                                placeholder={t('product_form.generalIdentity.refPlaceholder')}
                                                className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-primary font-mono uppercase"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="supplier" className="text-xs font-black uppercase tracking-widest text-slate-500">{t('product_form.generalIdentity.supplierLabel')}</Label>
                                        <div className="relative">
                                            <Truck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="supplier"
                                                {...register('supplier')}
                                                placeholder={t('product_form.generalIdentity.supplierPlaceholder')}
                                                className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-primary font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <Label htmlFor="categoryId" className="text-xs font-black uppercase tracking-widest text-slate-500">{t('product_form.generalIdentity.categoryLabel')}</Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 px-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10 gap-1 rounded-lg transition-all"
                                            onClick={() => setIsCategoryFormOpen(true)}
                                        >
                                            <Plus className="h-3 w-3" /> {t('product_form.generalIdentity.createNew')}
                                        </Button>
                                    </div>
                                    <Controller
                                        name="categoryId"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:ring-primary font-medium">
                                                    <SelectValue placeholder={t('product_form.generalIdentity.selectCategory')} />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl p-1">
                                                    <SelectItem value="none" className="rounded-xl py-3 cursor-pointer">{t('product_form.generalIdentity.uncategorized')}</SelectItem>
                                                    {categories?.map((category) => (
                                                        <SelectItem key={category.id} value={category.id} className="rounded-xl py-3 cursor-pointer">
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl overflow-hidden">
                            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-primary" /> {t('product_form.pricingStrategy.title')}
                                </CardTitle>
                                <CardDescription>{t('product_form.pricingStrategy.desc')}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="purchasePrice" className="text-xs font-black uppercase tracking-widest text-slate-500">{t('product_form.pricingStrategy.purchasePrice')}</Label>
                                            <div className="relative group">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-primary transition-colors">$</span>
                                                <Input
                                                    id="purchasePrice"
                                                    type="number"
                                                    step="0.01"
                                                    {...register('purchasePrice')}
                                                    className="pl-8 h-12 rounded-xl border-slate-200 focus:ring-primary font-black text-lg"
                                                />
                                            </div>
                                            {errors.purchasePrice && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{t(String(errors.purchasePrice.message))}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sellingPrice" className="text-xs font-black uppercase tracking-widest text-slate-500">{t('product_form.pricingStrategy.sellingPrice')}</Label>
                                            <div className="relative group">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 group-focus-within:text-primary transition-colors">$</span>
                                                <Input
                                                    id="sellingPrice"
                                                    type="number"
                                                    step="0.01"
                                                    {...register('sellingPrice')}
                                                    className="pl-8 h-12 rounded-xl border-primary bg-primary/5 focus:ring-primary font-black text-2xl text-primary"
                                                />
                                            </div>
                                            {errors.sellingPrice && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{t(String(errors.sellingPrice.message))}</p>}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Information Column */}
                    <div className="space-y-8 text-white">
                        <Card className="border-none shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl overflow-hidden">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Boxes className="h-5 w-5 text-secondary" /> {t('product_form.stockControl.title')}
                                </CardTitle>
                                <CardDescription className="text-slate-400">{t('product_form.stockControl.desc')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="minStockLevel" className="text-xs font-black uppercase tracking-widest text-slate-300">{t('product_form.stockControl.minStockLabel')}</Label>
                                    <Input
                                        id="minStockLevel"
                                        type="number"
                                        {...register('minStockLevel')}
                                        className="h-12 rounded-xl bg-white/10 border-white/10 text-white focus:ring-secondary font-black text-xl"
                                    />
                                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                        {t('product_form.stockControl.minStockDesc')}
                                    </p>
                                    {errors.minStockLevel && <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">{t(String(errors.minStockLevel.message))}</p>}
                                </div>

                                {!isEditMode && (
                                    <div className="space-y-2 pt-2">
                                        <Label htmlFor="initialQuantity" className="text-xs font-black uppercase tracking-widest text-slate-300">{t('product_form.stockControl.initialQtyLabel')}</Label>
                                        <Input
                                            id="initialQuantity"
                                            type="number"
                                            {...register('initialQuantity')}
                                            className="h-12 rounded-xl bg-emerald-500/10 border-emerald-500/20 text-emerald-400 focus:ring-emerald-500 font-black text-2xl"
                                        />
                                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                            {t('product_form.stockControl.initialQtyDesc')}
                                        </p>
                                    </div>
                                )}

                                <Separator className="bg-white/5" />

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold">{t('product_form.stockControl.visibilityStatus')}</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{t('product_form.stockControl.activeCatalog')}</p>
                                    </div>
                                    <Controller
                                        name="isActive"
                                        control={control}
                                        render={({ field }) => (
                                            <Button
                                                type="button"
                                                variant={field.value ? "default" : "secondary"}
                                                size="sm"
                                                className={cn(
                                                    "rounded-xl font-black text-[10px] uppercase tracking-widest h-8",
                                                    field.value ? "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20" : ""
                                                )}
                                                onClick={() => field.onChange(!field.value)}
                                            >
                                                {field.value ? t('product_form.stockControl.active') : t('product_form.stockControl.hidden')}
                                            </Button>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submission Buttons */}
                        <div className="space-y-3">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-16 rounded-3xl bg-gradient-to-r from-primary to-secondary text-white shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all font-black text-lg uppercase tracking-widest"
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-6 w-6" />
                                        {isEditMode ? t('product_form.buttons.update') : t('product_form.buttons.save')}
                                    </div>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate('/products')}
                                className="w-full h-12 rounded-2xl text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                {t('product_form.buttons.discard')}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>

            <CategoryForm
                isOpen={isCategoryFormOpen}
                onClose={() => setIsCategoryFormOpen(false)}
            />
        </div>
    );
}


