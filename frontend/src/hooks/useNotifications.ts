import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/endpoints/notifications';
import { toast } from 'react-hot-toast';

export const useNotifications = (outletId?: string) => {
    return useQuery({
        queryKey: ['notifications', outletId],
        queryFn: () => notificationsApi.getAll(outletId),
    });
};

export const useMarkNotificationAsSeen = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationsApi.markAsSeen,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to mark as seen';
            toast.error(message);
        },
    });
};

export const useMarkAllNotificationsAsSeen = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationsApi.markAllAsSeen,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success(`Marked ${data.count} notifications as seen`);
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to mark all as seen';
            toast.error(message);
        },
    });
};

export const useRemoveNotification = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: notificationsApi.remove,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Notification removed');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to remove notification';
            toast.error(message);
        },
    });
};
