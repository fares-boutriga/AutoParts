import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-gray-100/40 dark:bg-gray-800/40 lg:block">
                <Sidebar />
            </div>
            <div className="flex flex-col">
                <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                    <Outlet />
                </main>
            </div>
            {/* Mobile Sidebar Overlay - simplified implementation */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)}>
                    <div className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
                        <Sidebar />
                    </div>
                </div>
            )}
        </div>
    );
}
