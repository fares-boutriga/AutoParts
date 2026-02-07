import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
export declare class RolesController {
    private rolesService;
    constructor(rolesService: RolesService);
    create(createRoleDto: CreateRoleDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        isCustom: boolean;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        permissions: ({
            permission: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        isCustom: boolean;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        permissions: ({
            permission: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        isCustom: boolean;
        updatedAt: Date;
    }>;
    assignPermissions(id: string, permissionIds: string[]): Promise<{
        permissions: ({
            permission: {
                id: string;
                name: string;
                description: string | null;
                createdAt: Date;
            };
        } & {
            roleId: string;
            permissionId: string;
        })[];
    } & {
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        isCustom: boolean;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        isCustom: boolean;
        updatedAt: Date;
    }>;
}
