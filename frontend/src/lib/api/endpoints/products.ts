import api from '../client';

export interface Product {
    id: string;
    name: string;
    reference?: string;
    barcode?: string;
    description?: string;
    purchasePrice: number;
    sellingPrice: number;
    minStockLevel: number;
    categoryId?: string;
    category?: {
        id: string;
        name: string;
    };
    supplier?: string;
    isActive: boolean;
    isDeleted: boolean;
    totalQuantity: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductDto {
    name: string;
    reference?: string;
    barcode?: string;
    categoryId?: string;
    supplier?: string;
    purchasePrice: number;
    sellingPrice: number;
    minStockLevel?: number;
    isActive?: boolean;
    initialQuantity?: number;
}

export interface ProductQuery {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    activeOnly?: boolean;
}

const productsApi = {
    getAll: async (params?: ProductQuery) => {
        const response = await api.get<{ data: Product[], meta: any }>('/products', { params });
        return response.data;
    },

    getOne: async (id: string) => {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },

    getByReference: async (reference: string) => {
        const response = await api.get<Product>(`/products/by-reference/${encodeURIComponent(reference)}`);
        return response.data;
    },

    getByBarcode: async (barcode: string) => {
        const response = await api.get<Product>(`/products/by-barcode/${encodeURIComponent(barcode)}`);
        return response.data;
    },

    create: async (data: CreateProductDto) => {
        const response = await api.post<Product>('/products', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateProductDto>) => {
        const response = await api.patch<Product>(`/products/${id}`, data);
        return response.data;
    },

    toggleVisibility: async (id: string) => {
        const response = await api.patch<Product>(`/products/${id}/toggle-visibility`);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/products/${id}`);
    },
};

export default productsApi;
