import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string | null;
        isActive: boolean;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        roles: ({
            role: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                isCustom: boolean;
                updatedAt: Date;
            };
        } & {
            roleId: string;
            userId: string;
            assignedAt: Date;
        })[];
        email: string;
        phone: string | null;
        isActive: boolean;
        outlets: ({
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
        } & {
            userId: string;
            outletId: string;
        })[];
    }[]>;
    findOne(id: string): Promise<{
        roles: ({
            role: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                isCustom: boolean;
                updatedAt: Date;
            };
        } & {
            roleId: string;
            userId: string;
            assignedAt: Date;
        })[];
        outlets: ({
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
        } & {
            userId: string;
            outletId: string;
        })[];
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        isActive: boolean;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        isActive: boolean;
    }>;
    assignOutlets(id: string, outletIds: string[]): Promise<{
        roles: ({
            role: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                isCustom: boolean;
                updatedAt: Date;
            };
        } & {
            roleId: string;
            userId: string;
            assignedAt: Date;
        })[];
        outlets: ({
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
        } & {
            userId: string;
            outletId: string;
        })[];
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        isActive: boolean;
    }>;
    assignRoles(id: string, roleIds: string[]): Promise<{
        roles: ({
            role: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
                isCustom: boolean;
                updatedAt: Date;
            };
        } & {
            roleId: string;
            userId: string;
            assignedAt: Date;
        })[];
        outlets: ({
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
        } & {
            userId: string;
            outletId: string;
        })[];
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        phone: string | null;
        isActive: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        phone: string | null;
        isActive: boolean;
    }>;
}
