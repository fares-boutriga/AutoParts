import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateProduct, useUpdateProduct, useProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { type CreateProductDto } from '@/lib/api/endpoints/products';

const productSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    reference: z.string().optional(),
    sku: z.string().min(3, 'SKU must be at least 3 characters'),
    price: z.coerce.number().min(0, 'Price must be positive'),
    costPrice: z.coerce.number().min(0, 'Cost price must be positive').optional().transform(v => v === 0 ? undefined : v),
    minStockLevel: z.coerce.number().min(0, 'Minimum stock level must be positive'),
    categoryId: z.string().optional(),
    brand: z.string().optional(),
    tags: z.string().optional(),
    isActive: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const { data: product, isLoading: isLoadingProduct } = useProduct(id || '');
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            sku: '',
            price: 0,
            minStockLevel: 5,
            isActive: true,
            reference: '',
            costPrice: undefined,
            categoryId: '',
            brand: '',
            tags: '',
        } as any,
    });

    useEffect(() => {
        if (product) {
            setValue('name', product.name);
            setValue('reference', product.reference);
            setValue('sku', product.sku);
            setValue('price', product.price);
            setValue('costPrice', product.costPrice);
            setValue('minStockLevel', product.minStockLevel);
            setValue('categoryId', product.categoryId);
            setValue('brand', product.brand);
            if (product.tags) {
                setValue('tags', product.tags.join(', '));
            }
        }
    }, [product, setValue]);

    const onSubmit = async (data: any) => {
        const payload: CreateProductDto = {
            ...(data as ProductFormValues),
            tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : [],
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
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input id="name" {...register('name')} />
                                {errors.name && <p className="text-sm text-red-500">{String(errors.name.message)}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input id="sku" {...register('sku')} />
                                {errors.sku && <p className="text-sm text-red-500">{String(errors.sku.message)}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reference">Reference (Optional)</Label>
                                <Input id="reference" {...register('reference')} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand</Label>
                                <Input id="brand" {...register('brand')} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Selling Price</Label>
                                <Input id="price" type="number" step="0.01" {...register('price')} />
                                {errors.price && <p className="text-sm text-red-500">{String(errors.price.message)}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="costPrice">Cost Price (Optional)</Label>
                                <Input id="costPrice" type="number" step="0.01" {...register('costPrice')} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="minStockLevel">Min Stock Level</Label>
                                <Input id="minStockLevel" type="number" {...register('minStockLevel')} />
                                {errors.minStockLevel && <p className="text-sm text-red-500">{String(errors.minStockLevel.message)}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags (comma separated)</Label>
                                <Input id="tags" {...register('tags')} placeholder="e.g. Engine, Oil, Filter" />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/products')}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditMode ? 'Update Product' : 'Create Product'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
