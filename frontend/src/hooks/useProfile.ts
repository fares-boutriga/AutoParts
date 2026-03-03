import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import profileApi from '@/lib/api/endpoints/profile';
import type { UpdateMyProfileDto } from '@/lib/api/endpoints/profile';
import { toast } from 'react-hot-toast';

export const useProfile = () => {
    return useQuery({
        queryKey: ['profile'],
        queryFn: profileApi.getMe,
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateMyProfileDto) => profileApi.updateMe(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            toast.success('Profil mis à jour avec succès');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Erreur lors de la mise à jour du profil';
            toast.error(message);
        },
    });
};
