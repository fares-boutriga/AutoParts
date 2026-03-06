import type { AuthUser } from '@/lib/auth/store';

export type PermissionKey =
    | 'manage_users'
    | 'manage_roles'
    | 'view_notifications'
    | 'manage_products'
    | 'manage_stock'
    | 'manage_customers'
    | 'sell_products'
    | 'manage_outlets';

const ADMIN_ROLE_NAMES = new Set(['admin', 'administrator', 'system administrator']);

const normalize = (value: string) => value.trim().toLowerCase();

export const isAdminUser = (user: AuthUser | null | undefined): boolean => {
    if (!user) return false;

    if (user.role && ADMIN_ROLE_NAMES.has(normalize(user.role))) {
        return true;
    }

    return (
        user.roles?.some((ur) => ADMIN_ROLE_NAMES.has(normalize(ur.role?.name || ''))) ?? false
    );
};

export const getUserPermissions = (user: AuthUser | null | undefined): Set<string> => {
    const permissions = new Set<string>();
    if (!user) return permissions;

    user.roles?.forEach((userRole) => {
        userRole.role?.permissions?.forEach((rp) => {
            if (rp.permission?.name) permissions.add(rp.permission.name);
        });
    });

    return permissions;
};

export const hasPermission = (
    user: AuthUser | null | undefined,
    permission?: PermissionKey,
): boolean => {
    if (!permission) return true;
    if (!user) return false;
    if (isAdminUser(user)) return true;
    return getUserPermissions(user).has(permission);
};
