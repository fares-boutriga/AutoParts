import api from '../client';

export interface Category {
    id: string;
    name: string;
    _count?: {
        products: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryDto {
    name: string;
}

const categoriesApi = {
    getAll: async () => {
        const response = await api.get<Category[]>('/categories');
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await api.get<Category>(`/categories/${id}`);
        return response.data;
    },
    create: async (data: CreateCategoryDto) => {
        const response = await api.post<Category>('/categories', data);
        return response.data;
    },
    update: async (id: string, data: Partial<CreateCategoryDto>) => {
        const response = await api.patch<Category>(`/categories/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    },
};

export default categoriesApi;
