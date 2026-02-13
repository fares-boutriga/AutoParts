import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productsApi from '@/lib/api/endpoints/products';
import type { ProductQuery, CreateProductDto } from '@/lib/api/endpoints/products';
import { toast } from 'react-hot-toast';

export const useProducts = (params?: ProductQuery) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: () => productsApi.getAll(params),
    });
};

export const useProduct = (id: string) => {
    return useQuery({
        queryKey: ['products', id],
        queryFn: () => productsApi.getOne(id),
        enabled: !!id,
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product created successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to create product';
            toast.error(message);
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductDto> }) =>
            productsApi.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['products', data.id] });
            toast.success('Product updated successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update product';
            toast.error(message);
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product deleted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to delete product';
            toast.error(message);
        },
    });
};
