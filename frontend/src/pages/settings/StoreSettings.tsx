import { useState, useEffect } from 'react';
import { useStoreSettings, useUpdateStoreSettings } from '@/hooks/useStoreSettings';
import {
    useOutlets,
    useUpdateOutletAlerts,
    useInitTelegramConnection,
    useTelegramConnectionStatus,
    useDisconnectTelegramConnection,
} from '@/hooks/useOutlets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Store, Phone, Mail, MapPin, FileText, Hash,
    BadgePercent, Save, Loader2, Eye, Building2, BellRing, Link2, Unlink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

function InvoicePreview({ settings }: { settings: any }) {
    const today = new Date().toLocaleDateString('fr-TN');
    const tvaRate = Number(settings.tva || 19) / 100;
    const exampleHT = 850.00;
    const tvaAmount = exampleHT * tvaRate;
    const ttc = exampleHT + tvaAmount;

    return (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-sm print:shadow-none font-mono">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-black tracking-tight">{settings.storeName || 'Nom du Magasin'}</h2>
                        <p className="text-slate-300 text-xs mt-1">{settings.address || 'Adresse du Magasin'}</p>
                        <p className="text-slate-300 text-xs">{settings.phone || 'Téléphone'}</p>
                        <p className="text-slate-300 text-xs">{settings.email || 'Email'}</p>
                        {settings.patente && (
                            <p className="text-slate-400 text-xs mt-1">Num. Patente: {settings.patente}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-primary">FACTURE</div>
                        <div className="text-slate-300 text-xs mt-1">
                            N° {settings.invoicePrefix || 'FA-'}<span className="font-bold text-white">001</span>
                        </div>
                        <div className="text-slate-300 text-xs mt-1">Date: {today}</div>
                    </div>
                </div>
            </div>

            {/* Client info */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Facturé à</p>
                <p className="font-bold text-slate-800">Client Exemple</p>
                <p className="text-slate-500 text-xs">client@example.com</p>
            </div>

            {/* Items */}
            <div className="px-6 py-4">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-slate-200">
                            <th className="text-left text-xs font-black uppercase tracking-wider text-slate-500 pb-2">Réf.</th>
                            <th className="text-left text-xs font-black uppercase tracking-wider text-slate-500 pb-2">Désignation</th>
                            <th className="text-right text-xs font-black uppercase tracking-wider text-slate-500 pb-2">Qté</th>
                            <th className="text-right text-xs font-black uppercase tracking-wider text-slate-500 pb-2">P.U. HT</th>
                            <th className="text-right text-xs font-black uppercase tracking-wider text-slate-500 pb-2">Total HT</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-slate-100">
                            <td className="py-2 text-xs text-slate-500">FT-001</td>
                            <td className="py-2 text-xs font-medium">Filtre à huile moteur Premium</td>
                            <td className="py-2 text-xs text-right">5</td>
                            <td className="py-2 text-xs text-right">170,000</td>
                            <td className="py-2 text-xs text-right font-bold">850,000</td>
                        </tr>
                    </tbody>
                </table>

                {/* Totals */}
                <div className="mt-4 flex justify-end">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-xs text-slate-600">
                            <span>Total HT</span>
                            <span>{exampleHT.toFixed(3)} {settings.currency || 'TND'}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600">
                            <span>TVA ({settings.tva || 19}%)</span>
                            <span>{tvaAmount.toFixed(3)} {settings.currency || 'TND'}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-slate-900 border-t-2 border-slate-900 pt-2">
                            <span>TOTAL TTC</span>
                            <span>{ttc.toFixed(3)} {settings.currency || 'TND'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400">Merci pour votre confiance &mdash; {settings.storeName || 'Auto Parts POS'}</p>
            </div>
        </div>
    );
}

export default function StoreSettingsPage() {
    const { data: settings, isLoading } = useStoreSettings();
    const { data: outlets } = useOutlets();
    const update = useUpdateStoreSettings();
    const updateOutletAlerts = useUpdateOutletAlerts();
    const initTelegramConnection = useInitTelegramConnection();
    const disconnectTelegramConnection = useDisconnectTelegramConnection();

    const [form, setForm] = useState({
        storeName: '',
        address: '',
        phone: '',
        email: '',
        tva: '19',
        patente: '',
        invoicePrefix: 'FA-',
        currency: 'TND',
    });
    const [notificationSettings, setNotificationSettings] = useState({
        alertsEnabled: true,
        alertEmail: '',
        telegramAlertsEnabled: false,
    });
    const [telegramTargetType, setTelegramTargetType] = useState<'group' | 'private'>('group');

    const primaryOutlet = outlets?.[0];
    const {
        data: telegramConnectStatus,
        refetch: refetchTelegramConnectStatus,
        isFetching: isTelegramStatusFetching,
    } = useTelegramConnectionStatus(primaryOutlet?.id || null);

    useEffect(() => {
        if (settings) {
            setForm({
                storeName: settings.storeName || '',
                address: settings.address || '',
                phone: settings.phone || '',
                email: settings.email || '',
                tva: String(settings.tva ?? 19),
                patente: settings.patente || '',
                invoicePrefix: settings.invoicePrefix || 'FA-',
                currency: settings.currency || 'TND',
            });
        }
    }, [settings]);

    useEffect(() => {
        if (primaryOutlet) {
            setNotificationSettings({
                alertsEnabled: Boolean(primaryOutlet.alertsEnabled),
                alertEmail: primaryOutlet.email || '',
                telegramAlertsEnabled: Boolean(primaryOutlet.telegramAlertsEnabled),
            });
        }
    }, [primaryOutlet]);

    const effectiveTelegramStatus = telegramConnectStatus || {
        connected: Boolean(primaryOutlet?.telegramChatId),
        chatId: primaryOutlet?.telegramChatId || null,
        chatType: primaryOutlet?.telegramChatType || null,
        chatTitle: primaryOutlet?.telegramChatTitle || null,
        connectedAt: primaryOutlet?.telegramConnectedAt || null,
    };

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        update.mutate({
            storeName: form.storeName,
            address: form.address,
            phone: form.phone,
            email: form.email,
            tva: parseFloat(form.tva) || 19,
            patente: form.patente,
            invoicePrefix: form.invoicePrefix,
            currency: form.currency,
        });
    };

    const handleNotificationSettingsSubmit = () => {
        if (!primaryOutlet) {
            toast.error('Aucun point de vente configure');
            return;
        }

        if (notificationSettings.alertsEnabled && !notificationSettings.alertEmail.trim()) {
            toast.error("L'email de notification est requis");
            return;
        }
        updateOutletAlerts.mutate({
            id: primaryOutlet.id,
            payload: {
                alertsEnabled: notificationSettings.alertsEnabled,
                alertEmail: notificationSettings.alertEmail.trim() || undefined,
                telegramAlertsEnabled: notificationSettings.telegramAlertsEnabled,
            },
        }, {
            onSuccess: () => {
                if (
                    notificationSettings.alertsEnabled &&
                    notificationSettings.telegramAlertsEnabled &&
                    !effectiveTelegramStatus.connected
                ) {
                    toast('Telegram est active, mais non connecte. Cliquez sur "Connecter Telegram".');
                }
            },
        });
    };

    const handleStartTelegramConnect = () => {
        if (!primaryOutlet) {
            toast.error('Aucun point de vente configure');
            return;
        }

        initTelegramConnection.mutate({
            id: primaryOutlet.id,
            payload: { targetType: telegramTargetType },
        }, {
            onSuccess: (data) => {
                window.open(data.connectUrl, '_blank', 'noopener,noreferrer');
                toast.success('Telegram ouvert. Terminez la connexion puis revenez ici.');
                setTimeout(() => {
                    refetchTelegramConnectStatus();
                }, 2500);
            },
        });
    };

    const handleDisconnectTelegram = () => {
        if (!primaryOutlet) {
            toast.error('Aucun point de vente configure');
            return;
        }

        disconnectTelegramConnection.mutate(
            { id: primaryOutlet.id },
            {
                onSuccess: () => {
                    refetchTelegramConnectStatus();
                },
            },
        );
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
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Paramètres du Magasin
                </h1>
                <p className="text-slate-500 mt-1">Configurez les informations de votre boutique et le format des factures.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Left – Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Store Info */}
                    <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <Store className="h-4 w-4" />
                                </div>
                                Informations du Magasin
                            </CardTitle>
                            <CardDescription>Nom, adresse et coordonnées affichés sur les factures.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="storeName">Nom du Magasin *</Label>
                                <Input id="storeName" value={form.storeName} onChange={(e) => handleChange('storeName', e.target.value)}
                                    placeholder="Auto Pièces Tunis" className="h-11 rounded-xl" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address"><MapPin className="inline h-3 w-3 mr-1" />Adresse</Label>
                                <Input id="address" value={form.address} onChange={(e) => handleChange('address', e.target.value)}
                                    placeholder="Rue de la Liberté, Tunis 1001" className="h-11 rounded-xl" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone"><Phone className="inline h-3 w-3 mr-1" />Téléphone</Label>
                                    <Input id="phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="+216 71 000 000" className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email"><Mail className="inline h-3 w-3 mr-1" />Email</Label>
                                    <Input id="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder="contact@boutique.tn" className="h-11 rounded-xl" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Legal / Invoice */}
                    <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                    <Building2 className="h-4 w-4" />
                                </div>
                                Informations Fiscales & Facturation
                            </CardTitle>
                            <CardDescription>Numéro de patente, TVA, préfixe des factures.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="patente"><Hash className="inline h-3 w-3 mr-1" />Numéro de Patente</Label>
                                    <Input id="patente" value={form.patente} onChange={(e) => handleChange('patente', e.target.value)}
                                        placeholder="A123456789" className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tva"><BadgePercent className="inline h-3 w-3 mr-1" />TVA (%)</Label>
                                    <Input id="tva" type="number" min="0" max="100" step="0.01"
                                        value={form.tva} onChange={(e) => handleChange('tva', e.target.value)}
                                        placeholder="19" className="h-11 rounded-xl" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="invoicePrefix"><FileText className="inline h-3 w-3 mr-1" />Préfixe Facture</Label>
                                    <Input id="invoicePrefix" value={form.invoicePrefix} onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                                        placeholder="FA-" className="h-11 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Devise</Label>
                                    <Input id="currency" value={form.currency} onChange={(e) => handleChange('currency', e.target.value)}
                                        placeholder="TND" className="h-11 rounded-xl" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <BellRing className="h-4 w-4" />
                                </div>
                                Parametres de Notification
                            </CardTitle>
                            <CardDescription>Activer/desactiver les notifications stock et choisir l'email de reception.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-4">
                                    <div className="space-y-1">
                                        <p className="font-bold">Notifications de stock</p>
                                        <p className="text-xs text-slate-500">Envoyer un email quand le stock passe sous le minimum.</p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.alertsEnabled}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings((prev) => ({ ...prev, alertsEnabled: checked }))
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notificationEmail"><Mail className="inline h-3 w-3 mr-1" />Email de notification</Label>
                                    <Input
                                        id="notificationEmail"
                                        type="email"
                                        placeholder="admin@boutique.tn"
                                        value={notificationSettings.alertEmail}
                                        disabled={!notificationSettings.alertsEnabled}
                                        onChange={(e) =>
                                            setNotificationSettings((prev) => ({ ...prev, alertEmail: e.target.value }))
                                        }
                                        className="h-11 rounded-xl"
                                    />
                                    {!primaryOutlet && (
                                        <p className="text-xs text-amber-600">Aucun point de vente configure. Creez un point de vente d'abord.</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-4">
                                    <div className="space-y-1">
                                        <p className="font-bold">Notifications Telegram</p>
                                        <p className="text-xs text-slate-500">Envoyer aussi les alertes de stock via Telegram.</p>
                                    </div>
                                    <Switch
                                        checked={notificationSettings.telegramAlertsEnabled}
                                        disabled={!notificationSettings.alertsEnabled}
                                        onCheckedChange={(checked) =>
                                            setNotificationSettings((prev) => ({ ...prev, telegramAlertsEnabled: checked }))
                                        }
                                    />
                                </div>

                                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="font-bold text-sm">Connexion Telegram</p>
                                            <p className="text-xs text-slate-500">
                                                Aucune saisie technique. Connectez votre bot en 1 clic.
                                            </p>
                                        </div>
                                        {effectiveTelegramStatus.connected ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-none">
                                                Connecte
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-none">
                                                Non connecte
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Cible Telegram</Label>
                                            <Select
                                                value={telegramTargetType}
                                                onValueChange={(value) => setTelegramTargetType(value as 'group' | 'private')}
                                                disabled={!primaryOutlet}
                                            >
                                                <SelectTrigger className="h-11 rounded-xl">
                                                    <SelectValue placeholder="Choisir une cible" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="group">Groupe du magasin</SelectItem>
                                                    <SelectItem value="private">Chat prive admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Etat actuel</Label>
                                            <div className="h-11 rounded-xl border border-slate-200 dark:border-slate-700 px-3 flex items-center text-sm">
                                                {effectiveTelegramStatus.connected
                                                    ? `${effectiveTelegramStatus.chatTitle || effectiveTelegramStatus.chatId || 'Connecte'}`
                                                    : 'Aucune connexion Telegram'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="rounded-xl"
                                            onClick={handleStartTelegramConnect}
                                            disabled={!primaryOutlet || initTelegramConnection.isPending}
                                        >
                                            <Link2 className="h-4 w-4 mr-2" />
                                            {effectiveTelegramStatus.connected ? 'Reconnecter Telegram' : 'Connecter Telegram'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="rounded-xl"
                                            onClick={() => refetchTelegramConnectStatus()}
                                            disabled={!primaryOutlet || isTelegramStatusFetching}
                                        >
                                            Actualiser le statut
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="rounded-xl text-rose-500 border-rose-200 hover:bg-rose-50"
                                            onClick={handleDisconnectTelegram}
                                            disabled={!effectiveTelegramStatus.connected || disconnectTelegramConnection.isPending}
                                        >
                                            <Unlink className="h-4 w-4 mr-2" />
                                            Deconnecter
                                        </Button>
                                    </div>

                                    {notificationSettings.alertsEnabled &&
                                        notificationSettings.telegramAlertsEnabled &&
                                        !effectiveTelegramStatus.connected && (
                                            <p className="text-xs text-amber-600">
                                                Telegram est active mais non connecte. Les alertes Telegram seront ignorees
                                                jusqu'a la connexion.
                                            </p>
                                        )}
                                </div>

                                <Button
                                    type="button"
                                    onClick={handleNotificationSettingsSubmit}
                                    disabled={updateOutletAlerts.isPending || !primaryOutlet}
                                    className="w-full h-11 rounded-xl font-bold"
                                >
                                    {updateOutletAlerts.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        'Enregistrer les notifications'
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" disabled={update.isPending}
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-black text-sm uppercase tracking-widest gap-2 shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all">
                        {update.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        {update.isPending ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                    </Button>
                </form>

                {/* Right – Live Preview */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-bold uppercase tracking-widest">Aperçu de la Facture</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Temps réel</span>
                    </div>
                    <div className="sticky top-24">
                        <InvoicePreview settings={form} />
                    </div>
                </div>
            </div>
        </div>
    );
}
