import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function AccessDenied() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
            <div className="w-full max-w-xl rounded-3xl border border-rose-200/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-2xl p-8 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                    <ShieldAlert className="h-8 w-8" />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                    Access Denied
                </h1>
                <p className="mt-3 text-slate-600 dark:text-slate-400 font-medium">
                    You do not have permission to access this page.
                </p>
                <div className="mt-6">
                    <Button asChild className="rounded-xl px-6">
                        <Link to="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
