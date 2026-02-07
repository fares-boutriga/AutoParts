import { PrismaService } from '../../prisma/prisma.service';
import { CreateOutletDto } from './dto/create-outlet.dto';
import { UpdateOutletDto } from './dto/update-outlet.dto';
export declare class OutletsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createOutletDto: CreateOutletDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        phone: string | null;
        address: string | null;
        alertsEnabled: boolean;
    }>;
    findAll(): Promise<({
        _count: {
            users: number;
            orders: number;
            stocks: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        phone: string | null;
        address: string | null;
        alertsEnabled: boolean;
    })[]>;
    findOne(id: string): Promise<{
        users: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            userId: string;
            outletId: string;
        })[];
        _count: {
            orders: number;
            stocks: number;
            notifications: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        phone: string | null;
        address: string | null;
        alertsEnabled: boolean;
    }>;
    update(id: string, updateOutletDto: UpdateOutletDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        phone: string | null;
        address: string | null;
        alertsEnabled: boolean;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
