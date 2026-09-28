import React from 'react';
import {
  BedDouble,
  Users,
  CheckCircle,
  Clock,
  CircleDollarSign,
  TrendingUp,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Room, Booking } from '../types/hotel';
import { getTodayDateString } from '../services/hotelEngine';

interface StatsBannerProps {
  rooms: Room[];
  bookings: Booking[];
  onOpenNewBooking: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ rooms, bookings, onOpenNewBooking }) => {
  const today = getTodayDateString();

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const vacantRooms = rooms.filter((r) => r.status === 'VACANT').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'MAINTENANCE').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const inHouseCount = bookings.filter((b) => b.status === 'IN_HOUSE').length;
  const reservedCount = bookings.filter((b) => b.status === 'RESERVED').length;

  const todaysArrivals = bookings.filter((b) => b.checkInDate === today && b.status === 'RESERVED').length;
  const todaysDepartures = bookings.filter((b) => b.checkOutDate === today && b.status === 'IN_HOUSE').length;

  const totalRevenue = bookings
    .filter((b) => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + b.billing.totalAmount, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Occupancy Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">Occupancy</span>
          <TrendingUp className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-white">{occupancyRate}%</span>
          <span className="text-xs text-slate-400">{occupiedRooms}/{totalRooms} rooms</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
      </div>

      {/* Vacant Rooms */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">Available Vacant</span>
          <BedDouble className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold text-emerald-400">{vacantRooms}</span>
          <span className="text-xs text-slate-400 ml-2">ready to book</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          {maintenanceRooms > 0 ? `${maintenanceRooms} in maintenance` : 'All systems normal'}
        </p>
      </div>

      {/* In-House Guests */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">In-House Guests</span>
          <Users className="w-4 h-4 text-sky-400" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold text-sky-400">{inHouseCount}</span>
          <span className="text-xs text-slate-400 ml-2">active stays</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Checked-in occupants</p>
      </div>

      {/* Reserved Upcoming */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">Reserved</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-bold text-amber-400">{reservedCount}</span>
          <span className="text-xs text-slate-400 ml-2">upcoming</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Confirmed bookings</p>
      </div>

      {/* Today's In/Out Schedule */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">Today's Schedule</span>
          <CheckCircle className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
            <LogIn className="w-3.5 h-3.5" />
            <span>{todaysArrivals} In</span>
          </div>
          <div className="flex items-center space-x-1.5 text-rose-400 font-semibold">
            <LogOut className="w-3.5 h-3.5" />
            <span>{todaysDepartures} Out</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Front-desk queue</p>
      </div>

      {/* Total Recorded Revenue */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">Gross Booking Val</span>
          <CircleDollarSign className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2">
          <span className="text-xl font-bold text-slate-100">Rs.{totalRevenue.toLocaleString()}</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Exact BigDecimal math</p>
      </div>
    </div>
  );
};
