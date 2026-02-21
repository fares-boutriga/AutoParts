import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredPermissions) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.roles) {
            console.log('[PermissionsGuard] Access denied: No user or roles found in request object.');
            return false;
        }

        // Get all permissions from user's roles
        const userPermissions = new Set<string>();
        user.roles.forEach((userRole: any) => {
            if (userRole.role && userRole.role.permissions) {
                userRole.role.permissions.forEach((rolePermission: any) => {
                    if (rolePermission.permission && rolePermission.permission.name) {
                        userPermissions.add(rolePermission.permission.name);
                    }
                });
            }
        });

        const userPermsArray = Array.from(userPermissions);
        console.log(`[PermissionsGuard] User: ${user.email} | Roles: ${user.roles.map((r: any) => r.role?.name).join(', ')}`);
        console.log(`[PermissionsGuard] Required: ${requiredPermissions.join(', ')}`);
        console.log(`[PermissionsGuard] User has: ${userPermsArray.join(', ')}`);

        const hasPermission = requiredPermissions.every((permission) =>
            userPermissions.has(permission),
        );

        console.log(`[PermissionsGuard] Final Result for ${user.email}: ${hasPermission ? 'ALLOWED' : 'DENIED'}`);
        return hasPermission;
    }
}
