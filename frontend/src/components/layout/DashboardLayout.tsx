import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';


export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="grid min-h-screen min-w-0 w-full lg:grid-cols-[280px_minmax(0,1fr)] bg-slate-50 dark:bg-slate-950">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex min-w-0 flex-col">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-x-hidden p-3 pb-24 sm:p-4 md:gap-8 md:p-8 md:pb-8">
                    <div key={location.pathname} className="h-full min-w-0 animate-in fade-in slide-in-from-right-2 duration-300">
                        <Outlet />
                    </div>
                </main>
            </div>

            <MobileBottomNav />

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 lg:hidden animate-fade-in" onClick={() => setSidebarOpen(false)}>
                    <div className="fixed inset-y-0 left-0 w-[290px] bg-white dark:bg-slate-900 shadow-2xl animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
                        <Sidebar hidePrimaryNav onNavigate={() => setSidebarOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
