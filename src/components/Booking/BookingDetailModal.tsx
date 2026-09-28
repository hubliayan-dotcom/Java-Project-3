import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  LogIn,
  LogOut,
  Ban,
  Building,
  User,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  FileCode,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Booking, ROOM_TYPE_CONFIGS } from '../../types/hotel';
import {
  printInvoiceDocument,
  downloadInvoicePDF,
  downloadInvoiceHTML,
  generateInvoicePlainText,
} from '../../utils/invoiceGenerator';

interface BookingDetailModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (bookingId: string) => void;
  onCheckOut: (bookingId: string, additionalCharges?: number) => void;
  onCancelBooking: (bookingId: string, reason?: string) => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  isOpen,
  onClose,
  onCheckIn,
  onCheckOut,
  onCancelBooking,
}) => {
  const [extraServiceCharge, setExtraServiceCharge] = useState<number>(0);
  const [cancelReason, setCancelReason] = useState<string>('Guest request');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [showCheckoutPrompt, setShowCheckoutPrompt] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  if (!isOpen || !booking) return null;

  const roomConfig = ROOM_TYPE_CONFIGS[booking.roomType];

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handlePrint = () => {
    try {
      const res = printInvoiceDocument(booking);
      if (res.method === 'iframe' || res.method === 'window') {
        triggerNotification('Print dialog triggered for Tax Invoice.');
      } else {
        triggerNotification('Printable invoice downloaded successfully.');
      }
    } catch (err) {
      console.error('Print failed:', err);
      downloadInvoicePDF(booking);
      triggerNotification('Downloaded invoice PDF (print fallback).');
    }
  };

  const handleDownloadPDF = () => {
    try {
      downloadInvoicePDF(booking);
      triggerNotification(`Invoice PDF downloaded (INV-${booking.bookingId}.pdf)`);
    } catch (err) {
      console.error('PDF download error:', err);
      downloadInvoiceHTML(booking);
      triggerNotification('Downloaded HTML invoice fallback.');
    }
  };

  const handleDownloadHTML = () => {
    downloadInvoiceHTML(booking);
    triggerNotification(`HTML Invoice downloaded (INV-${booking.bookingId}.html)`);
  };

  const handleCopyReceipt = () => {
    const textReceipt = generateInvoicePlainText(booking);
    navigator.clipboard.writeText(textReceipt).then(() => {
      setCopiedReceipt(true);
      triggerNotification('Formatted ASCII receipt copied to clipboard.');
      setTimeout(() => setCopiedReceipt(false), 3000);
    });
  };

  const handleExecuteCheckout = () => {
    onCheckOut(booking.bookingId, extraServiceCharge);
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch (_) {}
    setShowCheckoutPrompt(false);
  };

  const handleExecuteCancel = () => {
    onCancelBooking(booking.bookingId, cancelReason);
    setShowCancelPrompt(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8 print:border-none print:shadow-none print:text-black print:bg-white">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Invoice Header */}
        <div className="border-b border-slate-800 pb-5 mb-5 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-white print:text-black">GRAND HORIZON HOTEL</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  booking.status === 'IN_HOUSE'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : booking.status === 'RESERVED'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : booking.status === 'COMPLETED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {booking.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 print:text-slate-600">
              Folio &amp; Invoice No: <strong className="font-mono text-slate-200 print:text-black">INV-{booking.bookingId}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              id="btn-print-invoice-modal"
              onClick={handlePrint}
              title="Print Tax Invoice Document"
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>

            <button
              id="btn-download-pdf-invoice"
              onClick={handleDownloadPDF}
              title="Download Official PDF Invoice"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer border border-slate-700/60"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>PDF</span>
            </button>

            <button
              id="btn-download-html-invoice"
              onClick={handleDownloadHTML}
              title="Download Standalone HTML Invoice"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1 transition cursor-pointer border border-slate-700/60"
            >
              <FileCode className="w-3.5 h-3.5 text-sky-400" />
              <span>HTML</span>
            </button>

            <button
              id="btn-copy-receipt-invoice"
              onClick={handleCopyReceipt}
              title="Copy Formatted Text Receipt"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1 transition cursor-pointer border border-slate-700/60"
            >
              {copiedReceipt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedReceipt ? 'Copied' : 'Receipt'}</span>
            </button>
          </div>
        </div>

        {notification && (
          <div className="mb-4 p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs flex items-center space-x-2 animate-fade-in print:hidden">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Guest & Room Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-5">
          {/* Guest Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1.5 print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center space-x-1.5 text-amber-400 font-semibold uppercase tracking-wider text-[11px]">
              <User className="w-3.5 h-3.5" />
              <span>Guest Profile</span>
            </div>
            <p className="text-sm font-bold text-white print:text-black">{booking.guest.name}</p>
            <p className="text-slate-400">Phone: {booking.guest.phone || 'N/A'}</p>
            <p className="text-slate-400">Email: {booking.guest.email || 'N/A'}</p>
            {booking.guest.idNumber && (
              <p className="text-slate-400">ID: {booking.guest.idType} ({booking.guest.idNumber})</p>
            )}
            {booking.guest.specialRequests && (
              <p className="text-amber-300/90 italic pt-1">Note: {booking.guest.specialRequests}</p>
            )}
          </div>

          {/* Room & Stay Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-1.5 print:bg-slate-50 print:border-slate-300">
            <div className="flex items-center space-x-1.5 text-amber-400 font-semibold uppercase tracking-wider text-[11px]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Reservation Specifics</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-sm font-bold text-white print:text-black">Room #{booking.roomNumber}</span>
              <span className="text-slate-400">({roomConfig.name})</span>
            </div>
            <p className="text-slate-300 font-medium">
              Check-In: <strong>{booking.checkInDate}</strong>
            </p>
            <p className="text-slate-300 font-medium">
              Check-Out: <strong>{booking.checkOutDate}</strong>
            </p>
            <p className="text-slate-400">{booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'} stay duration</p>
          </div>
        </div>

        {/* Financial Line Items Table */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden mb-5">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="p-3">Description</th>
                <th className="p-3 text-center">Rate / Unit</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Amount (Rs.)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="p-3 font-medium text-white print:text-black">
                  {roomConfig.name} - Nightly Accommodation
                </td>
                <td className="p-3 text-center">Rs.{booking.billing.nightlyRate.toFixed(2)}</td>
                <td className="p-3 text-center">{booking.nights} nights</td>
                <td className="p-3 text-right font-medium">Rs.{booking.billing.roomCharges.toFixed(2)}</td>
              </tr>
              {booking.billing.extraCharges > 0 && (
                <tr>
                  <td className="p-3 font-medium text-slate-200">Room Service / Incidentals</td>
                  <td className="p-3 text-center">—</td>
                  <td className="p-3 text-center">1</td>
                  <td className="p-3 text-right font-medium">Rs.{booking.billing.extraCharges.toFixed(2)}</td>
                </tr>
              )}
              {booking.billing.discountAmount > 0 && (
                <tr className="text-emerald-400">
                  <td className="p-3 font-medium">Promotional Discount</td>
                  <td className="p-3 text-center">—</td>
                  <td className="p-3 text-center">—</td>
                  <td className="p-3 text-right">-Rs.{booking.billing.discountAmount.toFixed(2)}</td>
                </tr>
              )}
              <tr>
                <td className="p-3 font-medium text-slate-300">Goods &amp; Services Tax (GST 10%)</td>
                <td className="p-3 text-center">10%</td>
                <td className="p-3 text-center">—</td>
                <td className="p-3 text-right font-medium">Rs.{booking.billing.taxAmount.toFixed(2)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-slate-900/90 border-t border-slate-800 text-xs font-semibold">
                <td colSpan={3} className="p-3 text-right text-slate-300">Total Invoice Amount:</td>
                <td className="p-3 text-right text-amber-400 font-bold text-sm">
                  Rs.{booking.billing.totalAmount.toFixed(2)}
                </td>
              </tr>
              <tr className="border-t border-slate-800/60 text-xs">
                <td colSpan={3} className="p-2.5 text-right text-slate-400">Advance / Deposit Paid:</td>
                <td className="p-2.5 text-right text-emerald-400 font-semibold">
                  Rs.{booking.billing.depositPaid.toFixed(2)}
                </td>
              </tr>
              <tr className="border-t border-slate-800/80 text-xs font-bold bg-slate-950">
                <td colSpan={3} className="p-3 text-right text-slate-200">Net Balance Due:</td>
                <td className="p-3 text-right text-white text-sm">
                  Rs.{booking.billing.balanceDue.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Cancellation Reason if cancelled */}
        {booking.status === 'CANCELLED' && booking.cancellationReason && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 flex items-center space-x-2">
            <Ban className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Cancelled: {booking.cancellationReason}</span>
          </div>
        )}

        {/* Prompt for Checkout Extra charges */}
        {showCheckoutPrompt && (
          <div className="mb-5 p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase">Settle Bill &amp; Add Incidentals</h4>
            <div className="flex items-center space-x-3 text-xs">
              <label className="text-slate-300">Additional Charges (Minibar, Room Service):</label>
              <input
                type="number"
                min="0"
                step="50"
                value={extraServiceCharge || ''}
                placeholder="0"
                onChange={(e) => setExtraServiceCharge(parseFloat(e.target.value) || 0)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white w-28 focus:outline-none"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-1">
              <button
                onClick={() => setShowCheckoutPrompt(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-checkout-modal"
                onClick={handleExecuteCheckout}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirm Check-Out &amp; Mark Room Vacant
              </button>
            </div>
          </div>
        )}

        {/* Prompt for Cancellation */}
        {showCancelPrompt && (
          <div className="mb-5 p-4 rounded-xl bg-slate-950 border border-rose-500/40 space-y-3">
            <h4 className="text-xs font-bold text-rose-400 uppercase">Confirm Reservation Cancellation</h4>
            <div className="text-xs space-y-1.5">
              <label className="text-slate-300 block">Cancellation Reason:</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-1">
              <button
                onClick={() => setShowCancelPrompt(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
              >
                Back
              </button>
              <button
                id="btn-confirm-cancel-modal"
                onClick={handleExecuteCancel}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 print:hidden">
          <span className="text-[11px] text-slate-500">Created: {new Date(booking.createdAt).toLocaleString()}</span>

          <div className="flex items-center space-x-2">
            {booking.status === 'RESERVED' && !showCancelPrompt && (
              <>
                <button
                  onClick={() => setShowCancelPrompt(true)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 text-xs font-medium transition cursor-pointer"
                >
                  Cancel Booking
                </button>
                <button
                  id="btn-modal-checkin"
                  onClick={() => {
                    onCheckIn(booking.bookingId);
                    try {
                      confetti({ particleCount: 40, spread: 50 });
                    } catch (_) {}
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Check-In Guest</span>
                </button>
              </>
            )}

            {booking.status === 'IN_HOUSE' && !showCheckoutPrompt && (
              <button
                id="btn-modal-checkout-open"
                onClick={() => setShowCheckoutPrompt(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Check-Out &amp; Print Bill</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
