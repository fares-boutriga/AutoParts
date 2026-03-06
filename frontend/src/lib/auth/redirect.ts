const DEFAULT_REDIRECT_PATH = '/';
const AUTH_PATHS = new Set(['/login', '/register']);

export const buildPathFromLocation = (
    pathname?: string,
    search?: string,
    hash?: string,
): string => {
    const safePathname = pathname || DEFAULT_REDIRECT_PATH;
    return `${safePathname}${search || ''}${hash || ''}`;
};

export const sanitizeRedirectPath = (value?: string | null): string => {
    if (!value) return DEFAULT_REDIRECT_PATH;

    const candidate = value.trim();
    if (!candidate.startsWith('/') || candidate.startsWith('//')) {
        return DEFAULT_REDIRECT_PATH;
    }

    const pathOnly = candidate.split('?')[0].split('#')[0];
    if (AUTH_PATHS.has(pathOnly)) {
        return DEFAULT_REDIRECT_PATH;
    }

    return candidate;
};

export const buildLoginRedirectUrl = (redirectPath?: string | null): string => {
    const safePath = sanitizeRedirectPath(redirectPath);
    if (safePath === DEFAULT_REDIRECT_PATH) return '/login';
    return `/login?redirect=${encodeURIComponent(safePath)}`;
};
