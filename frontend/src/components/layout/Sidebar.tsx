import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    Store,
    Box,
    TicketPercent,
    LogOut,
    Bell
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth/store';

const sidebarItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'POS', href: '/pos', icon: ShoppingCart },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Stock', href: '/stock', icon: Box },
    { name: 'Orders', href: '/orders', icon: TicketPercent },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Outlets', href: '/outlets', icon: Store },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Roles', href: '/roles', icon: Settings },
    { name: 'Notifications', href: '/notifications', icon: Bell },
];

export function Sidebar() {
    const location = useLocation();
    const logout = useAuthStore((state) => state.logout);

    return (
        <div className="flex flex-col h-full border-r bg-gray-100/40 dark:bg-gray-800/40">
            <div className="h-14 flex items-center border-b px-6">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                    <Store className="h-6 w-6" />
                    <span>Auto Parts POS</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    isActive ? "bg-gray-100 text-primary dark:bg-gray-800" : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t">
                <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-primary"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    );
}
