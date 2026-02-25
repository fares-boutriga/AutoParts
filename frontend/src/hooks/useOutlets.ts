import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { outletsApi } from '@/lib/api/endpoints/outlets';
import type {
    CreateOutletPayload,
    UpdateOutletPayload,
    UpdateOutletAlertsPayload,
} from '@/lib/api/endpoints/outlets';

export const useOutlets = () => {
    return useQuery({
        queryKey: ['outlets'],
        queryFn: () => outletsApi.getAll(),
    });
};

export const useOutlet = (id: string | null) => {
    return useQuery({
        queryKey: ['outlet', id],
        queryFn: () => outletsApi.getOne(id!),
        enabled: !!id,
    });
};

export const useCreateOutlet = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateOutletPayload) => outletsApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['outlets'] });
            toast.success('Outlet created successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to create outlet';
            toast.error(message);
        },
    });
};

export const useUpdateOutlet = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateOutletPayload }) =>
            outletsApi.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['outlets'] });
            queryClient.invalidateQueries({ queryKey: ['outlet'] });
            toast.success('Outlet updated successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update outlet';
            toast.error(message);
        },
    });
};

export const useUpdateOutletAlerts = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateOutletAlertsPayload }) =>
            outletsApi.updateAlerts(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['outlets'] });
            queryClient.invalidateQueries({ queryKey: ['outlet'] });
            toast.success('Alert settings updated');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update alert settings';
            toast.error(message);
        },
    });
};

export const useDeleteOutlet = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => outletsApi.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['outlets'] });
            toast.success('Outlet deleted');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to delete outlet';
            toast.error(message);
        },
    });
};
