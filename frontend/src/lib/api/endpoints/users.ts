import apiClient from '../client';

export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    isActive: boolean;
    roles?: { role: { id: string; name: string } }[];
    outlets?: { outlet: { id: string; name: string } }[];
}

export interface CreateUserDto {
    email: string;
    password: string;
    name: string;
    phone?: string;
}

export interface UpdateUserDto {
    email?: string;
    password?: string;
    name?: string;
    phone?: string;
    isActive?: boolean;
}

const usersApi = {
    getAll: async (): Promise<User[]> => {
        const { data } = await apiClient.get('/users');
        return data;
    },

    getOne: async (id: string): Promise<User> => {
        const { data } = await apiClient.get(`/users/${id}`);
        return data;
    },

    create: async (userData: CreateUserDto): Promise<User> => {
        const { data } = await apiClient.post('/users', userData);
        return data;
    },

    update: async (id: string, userData: UpdateUserDto): Promise<User> => {
        const { data } = await apiClient.patch(`/users/${id}`, userData);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    },

    assignRoles: async (id: string, roleIds: string[]): Promise<User> => {
        const { data } = await apiClient.post(`/users/${id}/roles`, { roleIds });
        return data;
    },

    assignOutlets: async (id: string, outletIds: string[]): Promise<User> => {
        const { data } = await apiClient.post(`/users/${id}/outlets`, { outletIds });
        return data;
    },
};

export default usersApi;
