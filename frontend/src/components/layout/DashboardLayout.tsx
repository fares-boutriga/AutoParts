import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';


export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr] bg-slate-50 dark:bg-slate-950">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex flex-col">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex flex-1 flex-col gap-6 p-6 md:gap-8 md:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 lg:hidden animate-fade-in" onClick={() => setSidebarOpen(false)}>
                    <div className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-900 shadow-2xl animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
                        <Sidebar />
                    </div>
                </div>
            )}
        </div>
    );
}
