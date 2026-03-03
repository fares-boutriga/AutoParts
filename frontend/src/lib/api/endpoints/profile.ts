import apiClient from '../client';

export interface MyProfile {
    id: string;
    email: string;
    name: string;
    phone?: string;
    isActive: boolean;
    roles?: { role: { id: string; name: string } }[];
    outlets?: { outlet: { id: string; name: string } }[];
}

export interface UpdateMyProfileDto {
    name?: string;
    phone?: string;
    email?: string;
    password?: string;
}

const profileApi = {
    getMe: async (): Promise<MyProfile> => {
        const { data } = await apiClient.get('/auth/me');
        return data;
    },

    updateMe: async (payload: UpdateMyProfileDto): Promise<MyProfile> => {
        const { data } = await apiClient.patch('/auth/me', payload);
        return data;
    },
};

export default profileApi;
