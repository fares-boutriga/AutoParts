export declare class CreateProductDto {
    name: string;
    reference?: string;
    categoryId?: string;
    supplier?: string;
    purchasePrice: number;
    sellingPrice: number;
    minStockLevel?: number;
    isActive?: boolean;
}
