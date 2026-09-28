import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  LogIn,
  LogOut,
  Ban,
  Calendar,
  User,
  Phone,
  CircleDollarSign,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Check,
  Printer,
} from 'lucide-react';
import { Booking, BookingStatus, RoomType } from '../../types/hotel';
import { printInvoiceDocument, downloadInvoicePDF } from '../../utils/invoiceGenerator';

interface BookingListViewProps {
  bookings: Booking[];
  onViewBooking: (bookingId: string) => void;
  onCheckIn: (bookingId: string) => void;
  onCheckOut: (bookingId: string) => void;
  onCancelBooking: (bookingId: string) => void;
  onOpenNewBooking: () => void;
  onExportCSV: () => void;
}

export const BookingListView: React.FC<BookingListViewProps> = ({
  bookings,
  onViewBooking,
  onCheckIn,
  onCheckOut,
  onCancelBooking,
  onOpenNewBooking,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | BookingStatus>('ALL');

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchId = b.bookingId.toLowerCase().includes(q);
      const matchName = b.guest.name.toLowerCase().includes(q);
      const matchPhone = b.guest.phone.toLowerCase().includes(q);
      const matchRoom = b.roomNumber.toString().includes(q);
      return matchId || matchName || matchPhone || matchRoom;
    }
    return true;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'RESERVED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            <span>RESERVED</span>
          </span>
        );
      case 'IN_HOUSE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
            <span>IN-HOUSE</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Check className="w-3 h-3" />
            <span>COMPLETED</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Ban className="w-3 h-3" />
            <span>CANCELLED</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="bookings-search-input"
            type="text"
            placeholder="Search booking ID (e.g. BK-1001), guest name, or room #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Status Filter buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setStatusFilter('IN_HOUSE')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'IN_HOUSE' ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              In-House
            </button>
            <button
              onClick={() => setStatusFilter('RESERVED')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'RESERVED' ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Reserved
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter('CANCELLED')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'CANCELLED' ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cancelled
            </button>
          </div>

          <button
            id="btn-export-csv-table"
            onClick={onExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">No booking records found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting search filters or create a new booking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="p-3.5">Booking ID</th>
                  <th className="p-3.5">Room</th>
                  <th className="p-3.5">Guest Info</th>
                  <th className="p-3.5">Stay Dates</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Financials</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBookings.map((b) => (
                  <tr key={b.bookingId} className="hover:bg-slate-800/30 transition">
                    {/* Booking ID */}
                    <td className="p-3.5 font-mono font-bold text-amber-400">
                      {b.bookingId}
                    </td>

                    {/* Room */}
                    <td className="p-3.5">
                      <div className="font-semibold text-white">Room #{b.roomNumber}</div>
                      <div className="text-[11px] text-slate-400">{b.roomType}</div>
                    </td>

                    {/* Guest */}
                    <td className="p-3.5">
                      <div className="font-medium text-slate-200">{b.guest.name}</div>
                      <div className="text-[11px] text-slate-400">{b.guest.phone || b.guest.email || '—'}</div>
                    </td>

                    {/* Stay Dates */}
                    <td className="p-3.5">
                      <div className="text-slate-300 font-medium">
                        {b.checkInDate} <span className="text-slate-500">→</span> {b.checkOutDate}
                      </div>
                      <div className="text-[11px] text-slate-400">{b.nights} {b.nights === 1 ? 'night' : 'nights'}</div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">{getStatusBadge(b.status)}</td>

                    {/* Financials */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-200">Rs.{b.billing.totalAmount.toLocaleString()}</div>
                      <div className="text-[11px] text-slate-400">
                        {b.billing.balanceDue > 0 ? (
                          <span className="text-amber-400">Due: Rs.{b.billing.balanceDue.toLocaleString()}</span>
                        ) : (
                          <span className="text-emerald-400">Paid in full</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          id={`btn-view-${b.bookingId}`}
                          onClick={() => onViewBooking(b.bookingId)}
                          title="View Invoice & Details"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          id={`btn-quick-print-${b.bookingId}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            printInvoiceDocument(b);
                          }}
                          title="Print / Save Tax Invoice"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-950/60 hover:text-sky-400 text-slate-400 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {b.status === 'RESERVED' && (
                          <>
                            <button
                              id={`btn-checkin-tbl-${b.bookingId}`}
                              onClick={() => onCheckIn(b.bookingId)}
                              title="Check-In Guest"
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition cursor-pointer flex items-center space-x-1"
                            >
                              <LogIn className="w-3 h-3" />
                              <span>Check-In</span>
                            </button>
                            <button
                              id={`btn-cancel-tbl-${b.bookingId}`}
                              onClick={() => onCancelBooking(b.bookingId)}
                              title="Cancel Reservation"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 transition cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {b.status === 'IN_HOUSE' && (
                          <button
                            id={`btn-checkout-tbl-${b.bookingId}`}
                            onClick={() => onCheckOut(b.bookingId)}
                            title="Check-Out & Settle Bill"
                            className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium transition cursor-pointer flex items-center space-x-1"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Check-Out</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
