import { useState } from 'react';
import { useNotifications, useMarkNotificationAsSeen, useMarkAllNotificationsAsSeen, useRemoveNotification } from '@/hooks/useNotifications';
import { useOutlets } from '@/hooks/useOutlets';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, CheckCircle2, Trash2, Filter, AlertCircle, RefreshCcw } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function NotificationList() {
    const [selectedOutlet, setSelectedOutlet] = useState<string>('all');

    const { data: outlets } = useOutlets();
    const { data: notifications, isLoading, isError, refetch } = useNotifications(
        selectedOutlet === 'all' ? undefined : selectedOutlet
    );

    const markAsSeen = useMarkNotificationAsSeen();
    const markAllAsSeen = useMarkAllNotificationsAsSeen();
    const remove = useRemoveNotification();

    const unreadCount = notifications?.filter(n => !n.seen).length || 0;
    const hasUnread = unreadCount > 0;

    const handleMarkAllAsSeen = () => {
        if (selectedOutlet === 'all') {
            // It might be tricky to mark all across all outlets sequentially,
            // but the API endpoint requires an outletId.
            // If they are on "all", we probably need an outlet selected to do batch mark all as seen
            // unless the backend supports without. Let's check. 
            // Wait, the backend API requires `outletId: string` strictly for markAllAsSeen.
            // So if `selectedOutlet` is 'all', they can't use this button directly for all outlets,
            // or we disable it and ask them to select an outlet first.
            // For now, let's just do nothing if 'all' is selected since backend requires an outletId.
            return;
        }
        markAllAsSeen.mutate(selectedOutlet);
    };

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <h2 className="text-xl font-bold">Error loading notifications</h2>
                <Button onClick={() => refetch()}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 p-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-3">
                        <Bell className="h-8 w-8 text-primary" />
                        Notifications
                        {unreadCount > 0 && (
                            <Badge className="ml-2 bg-primary text-white hover:bg-primary/90 rounded-full px-3 py-1">
                                {unreadCount} new
                            </Badge>
                        )}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                        Stay on top of stock alerts and system updates.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-1 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="pl-3 pr-2">
                            <Filter className="h-4 w-4 text-slate-400" />
                        </div>
                        <Select value={selectedOutlet} onValueChange={setSelectedOutlet}>
                            <SelectTrigger className="h-10 w-[180px] border-none bg-transparent focus:ring-0 shadow-none font-medium">
                                <SelectValue placeholder="All Outlets" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-none shadow-xl font-medium">
                                <SelectItem value="all">All Outlets</SelectItem>
                                {outlets?.map(outlet => (
                                    <SelectItem key={outlet.id} value={outlet.id}>
                                        {outlet.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {hasUnread && selectedOutlet !== 'all' && (
                        <Button
                            variant="secondary"
                            onClick={handleMarkAllAsSeen}
                            disabled={markAllAsSeen.isPending}
                            className="rounded-xl shadow-sm hover:shadow-md transition-all font-bold"
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark all as read
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="h-12 w-12 rounded-xl bg-white/50 dark:bg-slate-900/50 hover:bg-primary/10 hover:text-primary transition-colors shadow-sm"
                    >
                        <RefreshCcw className={cn("h-5 w-5", isLoading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="border-none shadow-sm opacity-50">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4 animate-pulse">
                                    <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
                                        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : !notifications || notifications.length === 0 ? (
                    <Card className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl">
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-24 space-y-6">
                                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center shadow-inner">
                                    <Bell className="h-10 w-10 text-primary/40" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-2xl font-black text-slate-700 dark:text-slate-300">All Caught Up!</p>
                                    <p className="text-base text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
                                        There are no notifications for you right now.
                                        {selectedOutlet !== 'all' && " Adjust your filters to see more."}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {notifications.map((notification) => (
                            <Card
                                key={notification.id}
                                className={cn(
                                    "border-none shadow-md transition-all duration-300 hover:shadow-lg rounded-2xl group overflow-hidden",
                                    !notification.seen
                                        ? "bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary"
                                        : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md opacity-80"
                                )}
                            >
                                <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className={cn(
                                        "h-12 w-12 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                        notification.type === 'STOCK_ALERT'
                                            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                            : "bg-primary/20 text-primary"
                                    )}>
                                        {notification.type === 'STOCK_ALERT' ? <AlertCircle className="h-6 w-6" /> : <Bell className="h-6 w-6" />}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline" className={cn(
                                                "uppercase text-[10px] tracking-widest font-bold border-none",
                                                notification.type === 'STOCK_ALERT'
                                                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                                                    : "bg-primary/10 text-primary"
                                            )}>
                                                {notification.type.replace('_', ' ')}
                                            </Badge>
                                            {!notification.seen && (
                                                <Badge className="bg-primary text-white text-[10px] uppercase font-black tracking-widest px-2 py-0 border-none shadow-sm">
                                                    New
                                                </Badge>
                                            )}
                                        </div>
                                        <p className={cn(
                                            "text-base mt-2",
                                            !notification.seen ? "font-bold text-slate-900 dark:text-slate-100" : "font-medium text-slate-600 dark:text-slate-400"
                                        )}>
                                            {notification.message}
                                        </p>
                                        <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 pt-1">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                                        {!notification.seen && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => markAsSeen.mutate(notification.id)}
                                                disabled={markAsSeen.isPending}
                                                className="flex-1 sm:flex-none rounded-xl font-bold border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                            >
                                                <Check className="h-4 w-4 mr-1.5" />
                                                Seen
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove.mutate(notification.id)}
                                            disabled={remove.isPending}
                                            className="h-9 w-9 shrink-0 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ml-auto sm:ml-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
