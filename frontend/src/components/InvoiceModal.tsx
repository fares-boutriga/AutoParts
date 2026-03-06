import { useState, useEffect } from 'react';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import ordersApi from '@/lib/api/endpoints/orders';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

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

    const escapeHtml = (value: unknown) =>
        String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

    const buildPrintHtml = () => {
        const storeName = storeSettings?.storeName || 'Mon Magasin';
        const customerName = order?.customer?.name || 'Client de passage';
        const itemsRows = (order?.items || []).map((item: any, idx: number) => {
            const unitHT = Number(item.unitPrice) / (1 + tvaRate);
            const subtotalHT = unitHT * Number(item.quantity || 0);
            return `
                <tr>
                    <td>${escapeHtml(item.product?.reference || '-')}</td>
                    <td>${escapeHtml(item.product?.name || `Article ${idx + 1}`)}</td>
                    <td class="right">${escapeHtml(item.quantity || 0)}</td>
                    <td class="right">${escapeHtml(unitHT.toFixed(3))} ${escapeHtml(currency)}</td>
                    <td class="right strong">${escapeHtml(subtotalHT.toFixed(3))} ${escapeHtml(currency)}</td>
                </tr>
            `;
        }).join('');

        return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Facture ${escapeHtml(invoiceNumber)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; color: #0f172a; margin: 0; padding: 24px; background: #ffffff; }
    .invoice { max-width: 920px; margin: 0 auto; }
    .head { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
    h1 { margin: 0 0 8px 0; font-size: 30px; letter-spacing: 0.5px; }
    h2 { margin: 0 0 8px 0; font-size: 36px; font-weight: 800; }
    p { margin: 4px 0; color: #334155; }
    .sep { height: 1px; background: #cbd5e1; margin: 20px 0; }
    .client { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 20px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 6px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
    th, td { padding: 10px 8px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; }
    th { border-bottom: 2px solid #0f172a; font-weight: 800; text-transform: uppercase; font-size: 11px; color: #334155; }
    .right { text-align: right; }
    .strong { font-weight: 700; }
    .totals { width: 320px; margin-left: auto; }
    .totals .row { display: flex; justify-content: space-between; margin: 6px 0; color: #334155; font-size: 14px; }
    .totals .grand { border-top: 2px solid #0f172a; padding-top: 10px; font-weight: 800; color: #0f172a; font-size: 20px; }
    .footer { margin-top: 26px; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; color: #64748b; font-size: 12px; }
    @page { size: A4; margin: 12mm; }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="head">
      <div>
        <h1>${escapeHtml(storeName)}</h1>
        ${storeSettings?.address ? `<p>${escapeHtml(storeSettings.address)}</p>` : ''}
        ${storeSettings?.phone ? `<p>Tél : ${escapeHtml(storeSettings.phone)}</p>` : ''}
        ${storeSettings?.email ? `<p>Email : ${escapeHtml(storeSettings.email)}</p>` : ''}
        ${storeSettings?.patente ? `<p>Patente N° : ${escapeHtml(storeSettings.patente)}</p>` : ''}
      </div>
      <div style="text-align:right">
        <h2>FACTURE</h2>
        <p>N° ${escapeHtml(invoiceNumber)}</p>
        <p>Date : ${escapeHtml(today)}</p>
      </div>
    </div>
    <div class="sep"></div>
    <div class="client">
      <div class="label">Facturé à</div>
      <div style="font-weight:700; color:#0f172a;">${escapeHtml(customerName)}</div>
      ${order?.customer?.phone ? `<p>${escapeHtml(order.customer.phone)}</p>` : ''}
      ${order?.customer?.email ? `<p>${escapeHtml(order.customer.email)}</p>` : ''}
    </div>
    <table>
      <thead>
        <tr>
          <th style="text-align:left">Réf.</th>
          <th style="text-align:left">Désignation</th>
          <th class="right">Qté</th>
          <th class="right">Prix Unit. HT</th>
          <th class="right">Total HT</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>
    <div class="totals">
      <div class="row"><span>Total HT</span><span>${escapeHtml(totalHT.toFixed(3))} ${escapeHtml(currency)}</span></div>
      <div class="row"><span>TVA (${escapeHtml(storeSettings?.tva ?? 19)}%)</span><span>${escapeHtml(tvaAmount.toFixed(3))} ${escapeHtml(currency)}</span></div>
      <div class="row grand"><span>Total TTC</span><span>${escapeHtml(totalTTC.toFixed(3))} ${escapeHtml(currency)}</span></div>
    </div>
    <div class="footer">
      <div>Merci de votre confiance — ${escapeHtml(storeName)}</div>
      <div>Mode de paiement : ${escapeHtml(order?.paymentMethod === 'cash' ? 'Espèces' : (order?.paymentMethod || '-'))}</div>
      ${order?.cashier?.name ? `<div>Caissier : ${escapeHtml(order.cashier.name)}</div>` : ''}
    </div>
  </div>
</body>
</html>`;
    };

    const handlePrint = () => {
        if (!order) {
            toast.error('La facture est introuvable.');
            return;
        }

        try {
            // Keep same-origin access so we can write invoice HTML in all browsers.
            const printWindow = window.open('about:blank', '_blank', 'width=1024,height=900');
            if (!printWindow) {
                toast.error("Impossible d'ouvrir la fenêtre d'impression.");
                return;
            }

            const html = buildPrintHtml();
            printWindow.document.open();
            printWindow.document.write(html);
            printWindow.document.close();

            printWindow.onload = () => {
                printWindow.focus();
                // Keep the print page open; some browsers ignore print if closed immediately.
                printWindow.setTimeout(() => {
                    printWindow.print();
                }, 150);
            };
        } catch {
            toast.error("Erreur d'impression. Vérifiez le bloqueur de popups.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-3xl p-0 rounded-3xl border-none shadow-2xl overflow-hidden">
                <DialogTitle className="sr-only">Facture</DialogTitle>
                <DialogDescription className="sr-only">
                    Aperçu de la facture avec option d'impression.
                </DialogDescription>
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
                                                <td className="py-3 text-sm text-right text-slate-800">{item.quantity}</td>
                                                <td className="py-3 text-sm text-right text-slate-800">
                                                    {unitHT.toFixed(3)} {currency}
                                                </td>
                                                <td className="py-3 text-sm text-right font-bold text-slate-900">
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

            </DialogContent>
        </Dialog>
    );
}
