import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Store,
    Box,
    TicketPercent,
    LogOut,
    Bell,
    UserCog,
    Shield,
    ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth/store';

const sidebarGroups = [
    {
        title: "Commerce",
        items: [
            { name: 'Dashboard', href: '/', icon: LayoutDashboard },
            { name: 'POS Terminal', href: '/pos', icon: ShoppingCart },
            { name: 'Orders & Sales', href: '/orders', icon: TicketPercent },
        ]
    },
    {
        title: "Inventory",
        items: [
            { name: 'Product Catalog', href: '/products', icon: Package },
            { name: 'Categories', href: '/categories', icon: Store },
            { name: 'Stock Levels', href: '/stock', icon: Box },
        ]
    },
    {
        title: "People & Places",
        items: [
            { name: 'CRM Customers', href: '/customers', icon: Users },
            { name: 'Store Outlets', href: '/outlets', icon: Store },
        ]
    },
    {
        title: "System",
        items: [
            { name: 'Staff Users', href: '/users', icon: UserCog },
            { name: 'Permissions', href: '/roles', icon: Shield },
            { name: 'Alerts center', href: '/notifications', icon: Bell },
        ]
    }
];

export function Sidebar() {
    const location = useLocation();
    const logout = useAuthStore((state) => state.logout);

    return (
        <div className="flex flex-col h-full bg-slate-900 border-r border-white/5 shadow-2xl z-20 overflow-hidden">
            {/* Logo Header */}
            <div className="h-20 flex items-center px-8 bg-black/20 backdrop-blur-xl border-b border-white/5">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 transform group-hover:scale-110 transition-transform duration-500">
                        <Store className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tighter text-white leading-none">
                            AUTO PARTS
                        </span>
                        <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase opacity-80">
                            Enterprise POS
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
                {sidebarGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="space-y-3 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${groupIdx * 0.1}s` }}>
                        <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500">
                            {group.title}
                        </h3>
                        <nav className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        className={cn(
                                            "flex items-center justify-between rounded-xl px-4 py-3.5 transition-all duration-300 group relative overflow-hidden",
                                            isActive
                                                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-xl shadow-primary/20 translate-x-1"
                                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-3.5 z-10">
                                            <div className={cn(
                                                "p-2 rounded-lg transition-colors",
                                                isActive ? "bg-white/20" : "bg-slate-800 group-hover:bg-slate-700"
                                            )}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <span className="font-bold text-sm tracking-tight">{item.name}</span>
                                        </div>
                                        {isActive && <ChevronRight className="h-4 w-4 text-white/50" />}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                ))}
            </div>

            {/* Logout Button */}
            <div className="p-4 bg-black/20 backdrop-blur-xl border-t border-white/5">
                <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-3.5 rounded-2xl px-5 py-4 text-sm font-black text-rose-400 transition-all duration-300 hover:bg-rose-500/10 hover:text-rose-300 group shadow-sm hover:shadow-rose-500/5"
                >
                    <div className="p-2 rounded-xl bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
                        <LogOut className="h-4 w-4" />
                    </div>
                    <span className="uppercase tracking-widest text-[11px]">End Session</span>
                </button>
            </div>
        </div>
    );
}

