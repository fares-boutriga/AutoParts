import { useAuthStore } from '@/lib/auth/store';
import { Bell, Menu, User, ChevronDown, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 px-6 lg:h-20 transition-all">
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-xl hover:bg-primary/10 hover:text-primary"
                onClick={onMenuClick}
            >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
            </Button>

            <div className="w-full flex-1">
                <div className="flex flex-col">
                    <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                        {t('header.systemContext')}
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                            {t('header.dashboard')}
                        </span>
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse hidden md:block" />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-xl h-10 w-10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900" />
                    <span className="sr-only">{t('header.notifications')}</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative rounded-xl h-10 w-10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400"
                        >
                            <Globe className="h-5 w-5" />
                            <span className="sr-only">Toggle Language</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 rounded-2xl border-none shadow-2xl p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                        <DropdownMenuItem
                            className={`rounded-xl px-4 py-2 cursor-pointer font-bold ${i18n.language.startsWith('en') ? 'bg-primary/10 text-primary' : ''}`}
                            onClick={() => changeLanguage('en')}
                        >
                            English
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className={`rounded-xl px-4 py-2 cursor-pointer font-bold ${i18n.language.startsWith('fr') ? 'bg-primary/10 text-primary' : ''}`}
                            onClick={() => changeLanguage('fr')}
                        >
                            Français
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-3 pl-2 pr-3 h-12 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group border border-transparent hover:border-slate-200/50 dark:hover:border-white/5"
                        >
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 transform group-hover:scale-105 transition-transform">
                                <User className="h-5 w-5 text-white" />
                            </div>
                            <div className="hidden md:flex flex-col items-start">
                                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-none">
                                    {user?.name || t('header.authorizedUser')}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                                    {t('header.administrator')}
                                </span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors hidden md:block" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl border-none shadow-2xl p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                        <DropdownMenuLabel className="px-4 py-2 font-black uppercase text-[10px] tracking-widest text-slate-400">{t('header.accountAccess')}</DropdownMenuLabel>
                        <DropdownMenuItem className="rounded-xl px-4 py-3 focus:bg-primary/5 cursor-pointer font-bold">
                            {t('header.profileSettings')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl px-4 py-3 focus:bg-primary/5 cursor-pointer font-bold text-rose-500 focus:text-rose-600" onClick={() => logout()}>
                            {t('header.terminateSession')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
