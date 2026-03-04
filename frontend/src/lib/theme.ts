export type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'autoparts-theme';

const getStoredTheme = (): AppTheme | null => {
    if (typeof window === 'undefined') return null;
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
};

const getSystemTheme = (): AppTheme => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getActiveTheme = (): AppTheme => {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

export const applyTheme = (theme: AppTheme) => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
};

export const saveTheme = (theme: AppTheme) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
};

export const initializeTheme = (): AppTheme => {
    const theme = getStoredTheme() ?? getSystemTheme();
    applyTheme(theme);
    return theme;
};

export const setThemePreference = (theme: AppTheme) => {
    applyTheme(theme);
    saveTheme(theme);
};
