import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import rolesApi from '@/lib/api/endpoints/roles';
import type { CreateRolePayload } from '@/lib/api/endpoints/roles';
import { toast } from 'react-hot-toast';

export const useRoles = () => {
    return useQuery({
        queryKey: ['roles'],
        queryFn: rolesApi.getAll,
    });
};

export const useRole = (id: string) => {
    return useQuery({
        queryKey: ['roles', id],
        queryFn: () => rolesApi.getOne(id),
        enabled: !!id,
    });
};

export const usePermissions = () => {
    return useQuery({
        queryKey: ['permissions'],
        queryFn: rolesApi.getPermissions,
    });
};

export const useCreateRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: rolesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success('Role created successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to create role';
            toast.error(message);
        },
    });
};

export const useAssignPermissions = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, permissionIds }: { id: string; permissionIds: string[] }) =>
            rolesApi.assignPermissions(id, permissionIds),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['roles', data.id] });
            toast.success('Permissions updated successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to assign permissions';
            toast.error(message);
        },
    });
};

export const useDeleteRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: rolesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success('Role deleted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to delete role';
            toast.error(message);
        },
    });
};
