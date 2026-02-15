import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import categoriesApi from '@/lib/api/endpoints/categories';
import type { CreateCategoryDto } from '@/lib/api/endpoints/categories';
import { toast } from 'react-hot-toast';

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: categoriesApi.getAll,
    });
};

export const useCategory = (id: string) => {
    return useQuery({
        queryKey: ['categories', id],
        queryFn: () => categoriesApi.getOne(id),
        enabled: !!id,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: categoriesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category created successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to create category';
            toast.error(message);
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateCategoryDto> }) =>
            categoriesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category updated successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update category';
            toast.error(message);
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: categoriesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category deleted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to delete category';
            toast.error(message);
        },
    });
};
