import { useAuthStore } from '@/lib/auth/store';
import { Bell, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // Note: DropdownMenu needs to be implemented or imported if available
// For now, simple button or placeholder if dropdown not implemented

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const user = useAuthStore((state) => state.user);

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 lg:h-[60px]">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
            </Button>
            <div className="w-full flex-1">
                {/* Breadcrumbs or Title could go here */}
                <h1 className="text-lg font-semibold md:text-xl">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                </Button>
                <div className="flex items-center gap-2">
                    {/* Simple user display for now */}
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-2">
                        <User className="h-5 w-5" />
                    </div>
                    <span className="hidden md:inline-block text-sm font-medium">
                        {user?.name || 'User'}
                    </span>
                </div>
            </div>
        </header>
    );
}
