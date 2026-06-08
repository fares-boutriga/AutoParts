import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role?: string;
    roles?: {
        role: {
            id: string;
            name: string;
            permissions?: {
                permission: {
                    id: string;
                    name: string;
                };
            }[];
        };
    }[];
    outlets?: {
        outlet: {
            id: string;
            name: string;
        };
    }[];
}

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: AuthUser, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (user, token) => {
                // Tokens are now stored in HttpOnly cookies natively
                set({ user, token: null, isAuthenticated: true });
            },
            logout: () => {
                // Backend clears cookies upon logout
                set({ user: null, token: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // Don't persist token
        }
    )
);
