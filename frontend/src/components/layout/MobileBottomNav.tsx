import { LayoutDashboard, ShoppingCart, TicketPercent } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/', labelKey: 'sidebar.dashboard', icon: LayoutDashboard },
    { href: '/pos', labelKey: 'sidebar.pos', icon: ShoppingCart },
    { href: '/orders', labelKey: 'sidebar.orders', icon: TicketPercent },
];

const getActiveIndex = (pathname: string) => {
    if (pathname.startsWith('/pos')) return 1;
    if (pathname.startsWith('/orders')) return 2;
    return 0;
};

export function MobileBottomNav() {
    const location = useLocation();
    const { t } = useTranslation();
    const activeIndex = getActiveIndex(location.pathname);

    return (
        <div className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[min(420px,calc(100%-1rem))] px-1">
            <nav className="relative grid grid-cols-3 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-1 shadow-2xl shadow-slate-900/10">
                <span
                    className="absolute left-1 top-1 bottom-1 rounded-xl bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/30 transition-transform duration-300 ease-out"
                    style={{
                        width: 'calc((100% - 0.5rem) / 3)',
                        transform: `translateX(calc(${activeIndex} * 100%))`,
                    }}
                />
                {navItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = idx === activeIndex;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                'relative z-10 flex flex-col items-center justify-center rounded-xl py-2.5 transition-all duration-300',
                                isActive
                                    ? 'text-white'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            )}
                        >
                            <Icon className={cn('h-4 w-4 transition-transform duration-300', isActive && 'scale-110')} />
                            <span className={cn('mt-1 max-w-[90px] truncate text-[10px] font-black uppercase tracking-widest transition-all duration-300', isActive ? 'opacity-100' : 'opacity-85')}>
                                {t(item.labelKey as any)}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
