import { useState, useEffect } from 'react';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    User, Mail, Phone, Lock, Shield, Save, Loader2, AlertTriangle, Eye, EyeOff
} from 'lucide-react';

export default function UserProfile() {
    const { data: profile, isLoading } = useProfile();
    const update = useUpdateProfile();

    const [infoForm, setInfoForm] = useState({ name: '', phone: '' });
    const [securityForm, setSecurityForm] = useState({ email: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [originalEmail, setOriginalEmail] = useState('');

    useEffect(() => {
        if (profile) {
            setInfoForm({ name: profile.name || '', phone: profile.phone || '' });
            setSecurityForm((prev) => ({ ...prev, email: profile.email || '' }));
            setOriginalEmail(profile.email || '');
        }
    }, [profile]);

    const isEmailChanged = securityForm.email !== originalEmail && securityForm.email !== '';
    const isAdmin = profile?.roles?.some((ur) => ur.role.name.toLowerCase() === 'admin');

    const handleInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        update.mutate({ name: infoForm.name, phone: infoForm.phone });
    };

    const handleSecuritySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (securityForm.password && securityForm.password !== securityForm.confirmPassword) {
            alert('Les mots de passe ne correspondent pas.');
            return;
        }
        const payload: any = {};
        if (securityForm.email && securityForm.email !== originalEmail) payload.email = securityForm.email;
        if (securityForm.password) payload.password = securityForm.password;
        if (Object.keys(payload).length > 0) update.mutate(payload);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Profile Hero */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 p-6 md:p-8 shadow-2xl">
                <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
                <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-5">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/30">
                            <User className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
                                Profil
                            </p>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                                {profile?.name || 'Utilisateur'}
                            </h1>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                                <Mail className="h-4 w-4 text-slate-400" />
                                <span>{profile?.email}</span>
                                {profile?.phone && (
                                    <>
                                        <span className="text-slate-600">•</span>
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        <span>{profile.phone}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {isAdmin && (
                            <Badge className="rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                                Administrateur
                            </Badge>
                        )}
                        {profile?.roles?.slice(0, 2).map((ur) => (
                            <Badge
                                key={ur.role.id}
                                variant="outline"
                                className="rounded-full border-white/10 text-slate-200 px-3 py-1 text-[10px] font-black uppercase tracking-widest gap-1"
                            >
                                <Shield className="h-3 w-3" /> {ur.role.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Personal Info */}
                <Card className="border border-white/5 shadow-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-3 text-xl font-black">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <User className="h-5 w-5" />
                            </div>
                            Informations personnelles
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">
                            Modifiez votre nom et votre numéro de téléphone.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleInfoSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom complet</Label>
                                <Input
                                    id="name"
                                    value={infoForm.name}
                                    onChange={(e) => setInfoForm((p) => ({ ...p, name: e.target.value }))}
                                    placeholder="Ahmed Ben Ali"
                                    className="h-11 rounded-xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-primary/30"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone"><Phone className="inline h-3 w-3 mr-1" />Téléphone</Label>
                                <Input
                                    id="phone"
                                    value={infoForm.phone}
                                    onChange={(e) => setInfoForm((p) => ({ ...p, phone: e.target.value }))}
                                    placeholder="+216 98 000 000"
                                    className="h-11 rounded-xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-primary/30"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={update.isPending}
                                className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20"
                            >
                                {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Enregistrer
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card className="border border-white/5 shadow-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-3 text-xl font-black">
                            <div className="h-10 w-10 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center">
                                <Lock className="h-5 w-5" />
                            </div>
                            Sécurité du compte
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">
                            Modifiez votre adresse email ou votre mot de passe.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSecuritySubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email"><Mail className="inline h-3 w-3 mr-1" />Adresse email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={securityForm.email}
                                    onChange={(e) => setSecurityForm((p) => ({ ...p, email: e.target.value }))}
                                    placeholder="votre@email.com"
                                    className="h-11 rounded-xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-primary/30"
                                />
                            </div>

                            {isEmailChanged && !isAdmin && (
                                <div className="flex items-start gap-3 p-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 text-amber-200">
                                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <p className="text-sm">
                                        L'administrateur sera notifié de ce changement d'adresse email.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Nouveau mot de passe <span className="text-slate-400 text-xs">(laisser vide pour ne pas changer)</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={securityForm.password}
                                        onChange={(e) => setSecurityForm((p) => ({ ...p, password: e.target.value }))}
                                        placeholder="••••••••"
                                        className="h-11 rounded-xl pr-10 bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-primary/30"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((s) => !s)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {securityForm.password && (
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={securityForm.confirmPassword}
                                        onChange={(e) => setSecurityForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                                        placeholder="••••••••"
                                        className="h-11 rounded-xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 focus-visible:ring-primary/30"
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={update.isPending || (!isEmailChanged && !securityForm.password)}
                                className="w-full h-12 rounded-2xl font-black uppercase tracking-widest gap-2"
                                variant={isEmailChanged ? 'default' : 'outline'}
                            >
                                {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Mettre à jour la sécurité
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
