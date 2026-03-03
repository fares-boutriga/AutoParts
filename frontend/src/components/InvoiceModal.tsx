import { useState, useEffect } from 'react';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import ordersApi from '@/lib/api/endpoints/orders';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X, Loader2 } from 'lucide-react';

interface InvoiceModalProps {
    orderId: string | null;
    open: boolean;
    onClose: () => void;
}

export default function InvoiceModal({ orderId, open, onClose }: InvoiceModalProps) {
    const { data: storeSettings } = useStoreSettings();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (orderId && open) {
            setLoading(true);
            ordersApi.getOne(orderId)
                .then((o) => setOrder(o))
                .catch(() => setOrder(null))
                .finally(() => setLoading(false));
        } else {
            setOrder(null);
        }
    }, [orderId, open]);

    const handlePrint = () => window.print();

    const tvaRate = Number(storeSettings?.tva ?? 19) / 100;
    const totalHT = order ? Number(order.totalAmount) / (1 + tvaRate) : 0;
    const tvaAmount = totalHT * tvaRate;
    const totalTTC = Number(order?.totalAmount ?? 0);
    const currency = storeSettings?.currency || 'TND';
    const prefix = storeSettings?.invoicePrefix || 'FA-';
    const invoiceNumber = `${prefix}${String(order?.id ?? '').substring(0, 6).toUpperCase()}`;

    const today = order?.createdAt
        ? new Date(order.createdAt).toLocaleDateString('fr-TN')
        : new Date().toLocaleDateString('fr-TN');

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-3xl p-0 rounded-3xl border-none shadow-2xl overflow-hidden">
                {/* Action bar */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b print:hidden">
                    <h2 className="font-black text-lg">Facture</h2>
                    <div className="flex gap-2">
                        <Button onClick={handlePrint} className="gap-2 rounded-xl bg-primary text-white">
                            <Printer className="h-4 w-4" /> Imprimer
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-xl" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Invoice body */}
                <div className="p-8 bg-white overflow-y-auto max-h-[80vh]" id="invoice-print-area">
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : !order ? (
                        <p className="text-center text-slate-500">Facture introuvable.</p>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900">
                                        {storeSettings?.storeName || 'Mon Magasin'}
                                    </h1>
                                    {storeSettings?.address && <p className="text-slate-500 text-sm">{storeSettings.address}</p>}
                                    {storeSettings?.phone && <p className="text-slate-500 text-sm">Tél : {storeSettings.phone}</p>}
                                    {storeSettings?.email && <p className="text-slate-500 text-sm">Email : {storeSettings.email}</p>}
                                    {storeSettings?.patente && (
                                        <p className="text-slate-500 text-sm">Patente N° : {storeSettings.patente}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-black text-slate-900">FACTURE</p>
                                    <p className="text-slate-500 text-sm mt-1">N° {invoiceNumber}</p>
                                    <p className="text-slate-500 text-sm">Date : {today}</p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-slate-200 mb-6" />

                            {/* Client info */}
                            <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Facturé à</p>
                                <p className="font-bold text-slate-800">
                                    {order.customer?.name || 'Client de passage'}
                                </p>
                                {order.customer?.phone && <p className="text-sm text-slate-500">{order.customer.phone}</p>}
                                {order.customer?.email && <p className="text-sm text-slate-500">{order.customer.email}</p>}
                            </div>

                            {/* Items table */}
                            <table className="w-full mb-8">
                                <thead>
                                    <tr className="border-b-2 border-slate-900">
                                        <th className="text-left text-xs font-black uppercase tracking-wider py-3 text-slate-600">Réf.</th>
                                        <th className="text-left text-xs font-black uppercase tracking-wider py-3 text-slate-600">Désignation</th>
                                        <th className="text-right text-xs font-black uppercase tracking-wider py-3 text-slate-600">Qté</th>
                                        <th className="text-right text-xs font-black uppercase tracking-wider py-3 text-slate-600">Prix Unit. HT</th>
                                        <th className="text-right text-xs font-black uppercase tracking-wider py-3 text-slate-600">Total HT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(order.items || []).map((item: any, idx: number) => {
                                        const unitHT = Number(item.unitPrice) / (1 + tvaRate);
                                        const subtotalHT = unitHT * item.quantity;
                                        return (
                                            <tr key={item.id || idx} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="py-3 text-xs text-slate-500 font-mono">
                                                    {item.product?.reference || '—'}
                                                </td>
                                                <td className="py-3 text-sm font-medium text-slate-800">
                                                    {item.product?.name || `Article ${idx + 1}`}
                                                </td>
                                                <td className="py-3 text-sm text-right">{item.quantity}</td>
                                                <td className="py-3 text-sm text-right">
                                                    {unitHT.toFixed(3)} {currency}
                                                </td>
                                                <td className="py-3 text-sm text-right font-bold">
                                                    {subtotalHT.toFixed(3)} {currency}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Totals */}
                            <div className="flex justify-end">
                                <div className="w-72 space-y-2">
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Total HT</span>
                                        <span>{totalHT.toFixed(3)} {currency}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>TVA ({storeSettings?.tva ?? 19}%)</span>
                                        <span>{tvaAmount.toFixed(3)} {currency}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-black text-slate-900 border-t-2 border-slate-900 pt-3">
                                        <span>TOTAL TTC</span>
                                        <span>{totalTTC.toFixed(3)} {currency}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-10 pt-6 border-t border-slate-100 text-center">
                                <p className="text-slate-400 text-xs">
                                    Merci de votre confiance — {storeSettings?.storeName || 'Auto Parts POS'}
                                </p>
                                <p className="text-slate-300 text-xs mt-1">
                                    Mode de paiement : {order.paymentMethod === 'cash' ? 'Espèces' : order.paymentMethod}
                                </p>
                                {order.cashier?.name && (
                                    <p className="text-slate-300 text-xs">Caissier : {order.cashier.name}</p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        #invoice-print-area, #invoice-print-area * { visibility: visible; }
                        #invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    );
}
