import { PrismaService } from '../../prisma/prisma.service';
import { StockAlertsService } from '../stock-alerts/stock-alerts.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
export declare class StockService {
    private prisma;
    private stockAlertsService;
    constructor(prisma: PrismaService, stockAlertsService: StockAlertsService);
    create(createStockDto: CreateStockDto): Promise<{
        outlet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            phone: string | null;
            address: string | null;
            alertsEnabled: boolean;
        };
        product: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            reference: string | null;
            categoryId: string | null;
            supplier: string | null;
            purchasePrice: import("@prisma/client/runtime/library").Decimal;
            sellingPrice: import("@prisma/client/runtime/library").Decimal;
            minStockLevel: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        outletId: string;
        minStockLevel: number | null;
        productId: string;
        quantity: number;
        lastAlertAt: Date | null;
    }>;
    findAll(filters?: {
        outletId?: string;
        productId?: string;
    }): Promise<({
        outlet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            phone: string | null;
            address: string | null;
            alertsEnabled: boolean;
        };
        product: {
            category: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            reference: string | null;
            categoryId: string | null;
            supplier: string | null;
            purchasePrice: import("@prisma/client/runtime/library").Decimal;
            sellingPrice: import("@prisma/client/runtime/library").Decimal;
            minStockLevel: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        outletId: string;
        minStockLevel: number | null;
        productId: string;
        quantity: number;
        lastAlertAt: Date | null;
    })[]>;
    findOne(outletId: string, productId: string): Promise<{
        outlet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            phone: string | null;
            address: string | null;
            alertsEnabled: boolean;
        };
        product: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            reference: string | null;
            categoryId: string | null;
            supplier: string | null;
            purchasePrice: import("@prisma/client/runtime/library").Decimal;
            sellingPrice: import("@prisma/client/runtime/library").Decimal;
            minStockLevel: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        outletId: string;
        minStockLevel: number | null;
        productId: string;
        quantity: number;
        lastAlertAt: Date | null;
    }>;
    update(id: string, updateStockDto: UpdateStockDto): Promise<{
        outlet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            phone: string | null;
            address: string | null;
            alertsEnabled: boolean;
        };
        product: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            reference: string | null;
            categoryId: string | null;
            supplier: string | null;
            purchasePrice: import("@prisma/client/runtime/library").Decimal;
            sellingPrice: import("@prisma/client/runtime/library").Decimal;
            minStockLevel: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        outletId: string;
        minStockLevel: number | null;
        productId: string;
        quantity: number;
        lastAlertAt: Date | null;
    }>;
    adjust(id: string, adjustStockDto: AdjustStockDto): Promise<{
        outlet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            phone: string | null;
            address: string | null;
            alertsEnabled: boolean;
        };
        product: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            reference: string | null;
            categoryId: string | null;
            supplier: string | null;
            purchasePrice: import("@prisma/client/runtime/library").Decimal;
            sellingPrice: import("@prisma/client/runtime/library").Decimal;
            minStockLevel: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        outletId: string;
        minStockLevel: number | null;
        productId: string;
        quantity: number;
        lastAlertAt: Date | null;
    }>;
}
