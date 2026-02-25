import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { customersApi } from '@/lib/api/endpoints/customers';
import type {
    CustomerFilters,
    CreateCustomerPayload,
    UpdateCustomerPayload,
} from '@/lib/api/endpoints/customers';

export const useCustomers = (filters?: CustomerFilters) => {
    return useQuery({
        queryKey: ['customers', filters],
        queryFn: () => customersApi.getAll(filters),
    });
};

export const useCustomer = (id: string | null) => {
    return useQuery({
        queryKey: ['customer', id],
        queryFn: () => customersApi.getOne(id!),
        enabled: !!id,
    });
};

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateCustomerPayload) => customersApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success('Customer created successfully');
        },
        onError: () => {
            toast.error('Failed to create customer');
        },
    });
};

export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomerPayload }) =>
            customersApi.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['customer'] });
            toast.success('Customer updated successfully');
        },
        onError: () => {
            toast.error('Failed to update customer');
        },
    });
};

export const useDeleteCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => customersApi.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success('Customer deleted');
        },
        onError: () => {
            toast.error('Failed to delete customer');
        },
    });
};
