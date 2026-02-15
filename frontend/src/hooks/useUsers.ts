import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import usersApi from '@/lib/api/endpoints/users';
import type { UpdateUserDto } from '@/lib/api/endpoints/users';
import { toast } from 'react-hot-toast';

export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: usersApi.getAll,
    });
};

export const useUser = (id: string) => {
    return useQuery({
        queryKey: ['users', id],
        queryFn: () => usersApi.getOne(id),
        enabled: !!id,
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: usersApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User created successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to create user';
            toast.error(message);
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
            usersApi.update(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['users', data.id] });
            toast.success('User updated successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update user';
            toast.error(message);
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: usersApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User deleted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to delete user';
            toast.error(message);
        },
    });
};

export const useAssignRoles = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
            usersApi.assignRoles(id, roleIds),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['users', data.id] });
            toast.success('Roles assigned successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to assign roles';
            toast.error(message);
        },
    });
};

export const useAssignOutlets = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, outletIds }: { id: string; outletIds: string[] }) =>
            usersApi.assignOutlets(id, outletIds),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['users', data.id] });
            toast.success('Outlets assigned successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to assign outlets';
            toast.error(message);
        },
    });
};
