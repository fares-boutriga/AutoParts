import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';


export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr] bg-slate-50 dark:bg-slate-950">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex flex-col">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex flex-1 flex-col gap-4 p-4 pb-24 md:gap-8 md:p-8 md:pb-8">
                    <div key={location.pathname} className="h-full animate-in fade-in slide-in-from-right-2 duration-300">
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
