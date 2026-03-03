import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import storeSettingsApi from '@/lib/api/endpoints/store-settings';
import type { UpdateStoreSettingsDto } from '@/lib/api/endpoints/store-settings';
import { toast } from 'react-hot-toast';

export const useStoreSettings = () => {
    return useQuery({
        queryKey: ['store-settings'],
        queryFn: storeSettingsApi.get,
    });
};

export const useUpdateStoreSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateStoreSettingsDto) => storeSettingsApi.update(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['store-settings'] });
            toast.success('Paramètres du magasin mis à jour');
        },
        onError: () => {
            toast.error('Erreur lors de la mise à jour des paramètres');
        },
    });
};
