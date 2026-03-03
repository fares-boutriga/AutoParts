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
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl shadow-primary/20">
                    <User className="h-8 w-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">{profile?.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-slate-500 text-sm">{profile?.email}</p>
                        {profile?.roles?.slice(0, 2).map((ur) => (
                            <Badge key={ur.role.id} variant="outline" className="text-xs gap-1">
                                <Shield className="h-3 w-3" /> {ur.role.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            {/* Personal Info */}
            <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <User className="h-4 w-4" />
                        </div>
                        Informations Personnelles
                    </CardTitle>
                    <CardDescription>Modifiez votre nom et numéro de téléphone.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleInfoSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom complet</Label>
                            <Input id="name" value={infoForm.name}
                                onChange={(e) => setInfoForm((p) => ({ ...p, name: e.target.value }))}
                                placeholder="Ahmed Ben Ali" className="h-11 rounded-xl" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone"><Phone className="inline h-3 w-3 mr-1" />Téléphone</Label>
                            <Input id="phone" value={infoForm.phone}
                                onChange={(e) => setInfoForm((p) => ({ ...p, phone: e.target.value }))}
                                placeholder="+216 98 000 000" className="h-11 rounded-xl" />
                        </div>
                        <Button type="submit" disabled={update.isPending}
                            className="w-full h-11 rounded-xl bg-primary text-white font-bold gap-2">
                            {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Enregistrer
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                            <Lock className="h-4 w-4" />
                        </div>
                        Sécurité du Compte
                    </CardTitle>
                    <CardDescription>Modifiez votre adresse email ou votre mot de passe.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSecuritySubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email"><Mail className="inline h-3 w-3 mr-1" />Adresse Email</Label>
                            <Input id="email" type="email" value={securityForm.email}
                                onChange={(e) => setSecurityForm((p) => ({ ...p, email: e.target.value }))}
                                placeholder="votre@email.com" className="h-11 rounded-xl" />
                        </div>

                        {/* Admin notification warning */}
                        {isEmailChanged && !isAdmin && (
                            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                <p>L'administrateur sera notifié de ce changement d'adresse email.</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password">Nouveau mot de passe <span className="text-slate-400 text-xs">(laisser vide pour ne pas changer)</span></Label>
                            <div className="relative">
                                <Input id="password" type={showPassword ? 'text' : 'password'}
                                    value={securityForm.password}
                                    onChange={(e) => setSecurityForm((p) => ({ ...p, password: e.target.value }))}
                                    placeholder="••••••••" className="h-11 rounded-xl pr-10" />
                                <button type="button" onClick={() => setShowPassword((s) => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        {securityForm.password && (
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                <Input id="confirmPassword" type="password"
                                    value={securityForm.confirmPassword}
                                    onChange={(e) => setSecurityForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                                    placeholder="••••••••" className="h-11 rounded-xl" />
                            </div>
                        )}
                        <Button type="submit" disabled={update.isPending || (!isEmailChanged && !securityForm.password)}
                            className="w-full h-11 rounded-xl font-bold gap-2"
                            variant={isEmailChanged ? 'default' : 'outline'}>
                            {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Mettre à jour la sécurité
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
