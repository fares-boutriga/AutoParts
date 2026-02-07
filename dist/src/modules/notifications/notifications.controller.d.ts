import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(outletId?: string): Promise<({
        outlet: {
            id: string;
            name: string;
        };
        product: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        outletId: string;
        type: string;
        productId: string | null;
        message: string;
        seen: boolean;
    })[]>;
    markAsSeen(id: string): Promise<{
        id: string;
        createdAt: Date;
        outletId: string;
        type: string;
        productId: string | null;
        message: string;
        seen: boolean;
    }>;
    markAllAsSeen(outletId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        outletId: string;
        type: string;
        productId: string | null;
        message: string;
        seen: boolean;
    }>;
}
