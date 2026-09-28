import React from 'react';
import {
  Bed,
  Users,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Sparkles,
  Calendar,
  ChevronRight,
  LogIn,
  LogOut,
  Plus,
} from 'lucide-react';
import { Room, RoomStatus, Booking, ROOM_TYPE_CONFIGS } from '../../types/hotel';

interface RoomCardProps {
  room: Room;
  currentBooking?: Booking;
  upcomingBooking?: Booking;
  onBookRoom: (roomNumber: number) => void;
  onCheckIn: (bookingId: string) => void;
  onCheckOut: (bookingId: string) => void;
  onViewBooking: (bookingId: string) => void;
  onUpdateStatus: (roomNumber: number, status: RoomStatus) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  currentBooking,
  upcomingBooking,
  onBookRoom,
  onCheckIn,
  onCheckOut,
  onViewBooking,
  onUpdateStatus,
}) => {
  const config = ROOM_TYPE_CONFIGS[room.type];

  // Status visual styles
  const getStatusBadge = () => {
    switch (room.status) {
      case 'VACANT':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>VACANT</span>
          </span>
        );
      case 'OCCUPIED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
            <span>IN-HOUSE</span>
          </span>
        );
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Wrench className="w-3 h-3" />
            <span>MAINTENANCE</span>
          </span>
        );
      case 'CLEANING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-3 h-3" />
            <span>CLEANING</span>
          </span>
        );
    }
  };

  return (
    <div
      id={`room-card-${room.roomNumber}`}
      className={`relative bg-slate-900 border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg flex flex-col justify-between ${
        room.status === 'OCCUPIED'
          ? 'border-sky-500/30 bg-slate-900/95'
          : room.status === 'VACANT'
          ? 'border-slate-800 hover:border-slate-700'
          : 'border-amber-500/30'
      }`}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-white tracking-tight">#{room.roomNumber}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Floor {room.floor}
              </span>
            </div>
            <p className="text-xs font-medium text-amber-400 mt-0.5">{config.name}</p>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Rate & Capacity Bar */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Bed className="w-3.5 h-3.5 text-slate-400" />
            <span>{config.bedType}</span>
          </div>
          <div className="font-semibold text-slate-200">
            Rs.{room.rate.toLocaleString()} <span className="text-[11px] text-slate-500 font-normal">/ night</span>
          </div>
        </div>
      </div>

      {/* Middle Body: Occupant / Reservation info */}
      <div className="p-4 flex-1 flex flex-col justify-center space-y-2.5 text-xs">
        {room.status === 'OCCUPIED' && currentBooking ? (
          <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-800/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-sky-400 font-medium uppercase tracking-wider">Current Guest</span>
              <span className="text-[11px] font-mono text-slate-400">{currentBooking.bookingId}</span>
            </div>
            <p className="font-semibold text-white mt-1 text-sm">{currentBooking.guest.name}</p>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-300">
              <span>Checkout: <strong className="text-amber-300">{currentBooking.checkOutDate}</strong></span>
              <span>{currentBooking.nights} nights</span>
            </div>
          </div>
        ) : upcomingBooking ? (
          <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-amber-400 font-medium uppercase tracking-wider">Next Arrival</span>
              <span className="text-[11px] font-mono text-slate-400">{upcomingBooking.bookingId}</span>
            </div>
            <p className="font-medium text-slate-200 mt-1">{upcomingBooking.guest.name}</p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>Check-in: {upcomingBooking.checkInDate}</span>
              <span className="text-amber-400 font-medium">RESERVED</span>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 text-slate-400 text-center">
            <p className="text-xs">No active occupants</p>
            <div className="flex flex-wrap gap-1 justify-center mt-1.5">
              {room.features.slice(0, 2).map((f, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {room.status === 'OCCUPIED' && currentBooking ? (
          <>
            <button
              id={`btn-view-booking-${currentBooking.bookingId}`}
              onClick={() => onViewBooking(currentBooking.bookingId)}
              className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer text-center"
            >
              Details
            </button>
            <button
              id={`btn-checkout-${currentBooking.bookingId}`}
              onClick={() => onCheckOut(currentBooking.bookingId)}
              className="flex-1 py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition flex items-center justify-center space-x-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Check-Out</span>
            </button>
          </>
        ) : upcomingBooking && upcomingBooking.status === 'RESERVED' ? (
          <>
            <button
              id={`btn-checkin-${upcomingBooking.bookingId}`}
              onClick={() => onCheckIn(upcomingBooking.bookingId)}
              className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition flex items-center justify-center space-x-1 cursor-pointer"
            >
              <LogIn className="w-3 h-3" />
              <span>Check-In</span>
            </button>
            <button
              id={`btn-view-res-${upcomingBooking.bookingId}`}
              onClick={() => onViewBooking(upcomingBooking.bookingId)}
              className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
            >
              View
            </button>
          </>
        ) : room.status === 'VACANT' ? (
          <>
            <button
              id={`btn-book-room-${room.roomNumber}`}
              onClick={() => onBookRoom(room.roomNumber)}
              className="flex-1 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Room</span>
            </button>
            <button
              id={`btn-maintenance-${room.roomNumber}`}
              onClick={() => onUpdateStatus(room.roomNumber, 'MAINTENANCE')}
              title="Set to Maintenance"
              className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 text-xs transition cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <button
            id={`btn-make-vacant-${room.roomNumber}`}
            onClick={() => onUpdateStatus(room.roomNumber, 'VACANT')}
            className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-medium transition cursor-pointer"
          >
            Mark as Ready / VACANT
          </button>
        )}
      </div>
    </div>
  );
};
