import client from '../client';

export interface Permission {
    id: string;
    key: string;
    description: string | null;
}

export interface RolePermission {
    permissionId: string;
    permission: {
        id: string;
        name: string;
        description: string | null;
    };
}

export interface Role {
    id: string;
    name: string;
    description: string | null;
    isCustom: boolean;
    createdAt: string;
    updatedAt: string;
    permissions: RolePermission[];
}

export interface CreateRolePayload {
    name: string;
    description?: string;
}

export const rolesApi = {
    getAll: async (): Promise<Role[]> => {
        const response = await client.get('/roles');
        return response.data;
    },

    getOne: async (id: string): Promise<Role> => {
        const response = await client.get(`/roles/${id}`);
        return response.data;
    },

    create: async (payload: CreateRolePayload): Promise<Role> => {
        const response = await client.post('/roles', payload);
        return response.data;
    },

    assignPermissions: async (id: string, permissionIds: string[]): Promise<Role> => {
        const response = await client.post(`/roles/${id}/permissions`, { permissionIds });
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await client.delete(`/roles/${id}`);
    },

    getPermissions: async (): Promise<Permission[]> => {
        const response = await client.get('/permissions');
        return response.data;
    },
};

export default rolesApi;
