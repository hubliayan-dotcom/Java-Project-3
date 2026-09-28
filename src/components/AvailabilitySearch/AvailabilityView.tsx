import React, { useState } from 'react';
import {
  Calendar,
  CalendarDays,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react';
import { Room, RoomType, Booking, ROOM_TYPE_CONFIGS } from '../../types/hotel';
import {
  getTodayDateString,
  addDaysToDateString,
  calculateNights,
  rangesOverlap,
  hotelService,
} from '../../services/hotelEngine';

interface AvailabilityViewProps {
  rooms: Room[];
  bookings: Booking[];
  onBookRoomWithDates: (roomNumber: number, checkIn: string, checkOut: string) => void;
}

export const AvailabilityView: React.FC<AvailabilityViewProps> = ({
  rooms,
  bookings,
  onBookRoomWithDates,
}) => {
  const today = getTodayDateString();
  const defaultCheckIn = today;
  const defaultCheckOut = addDaysToDateString(today, 2);

  const [checkInDate, setCheckInDate] = useState(defaultCheckIn);
  const [checkOutDate, setCheckOutDate] = useState(defaultCheckOut);
  const [selectedType, setSelectedType] = useState<RoomType | 'ALL'>('ALL');

  // Perform availability search using the hotelService
  const nights = Math.max(1, calculateNights(checkInDate, checkOutDate));
  const searchResult = hotelService.searchAvailableRooms(
    checkInDate,
    checkOutDate,
    selectedType === 'ALL' ? undefined : selectedType
  );

  // Generate 14-day timeline dates for the availability calendar matrix
  const timelineDays = Array.from({ length: 14 }, (_, i) => addDaysToDateString(today, i));

  // Determine status of room on specific day
  const getRoomDayStatus = (roomNumber: number, dayStr: string) => {
    const nextDay = addDaysToDateString(dayStr, 1);
    const activeBooking = bookings.find(
      (b) =>
        b.roomNumber === roomNumber &&
        (b.status === 'RESERVED' || b.status === 'IN_HOUSE') &&
        rangesOverlap(dayStr, nextDay, b.checkInDate, b.checkOutDate)
    );

    if (activeBooking) {
      return {
        status: activeBooking.status,
        bookingId: activeBooking.bookingId,
        guestName: activeBooking.guest.name,
      };
    }
    return { status: 'VACANT' };
  };

  return (
    <div className="space-y-6">
      {/* Availability Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold text-white">Date-Range Room Availability Checker</h2>
          </div>
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Calculates overlap via</span>
            <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono text-[11px]">
              startA &lt; endB &amp;&amp; startB &lt; endA
            </code>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Check-In Date */}
          <div>
            <label htmlFor="avail-checkin" className="block text-xs font-medium text-slate-300 mb-1.5">
              Check-In Date
            </label>
            <div className="relative">
              <input
                id="avail-checkin"
                type="date"
                value={checkInDate}
                min={today}
                onChange={(e) => {
                  const newIn = e.target.value;
                  setCheckInDate(newIn);
                  if (newIn >= checkOutDate) {
                    setCheckOutDate(addDaysToDateString(newIn, 1));
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Check-Out Date */}
          <div>
            <label htmlFor="avail-checkout" className="block text-xs font-medium text-slate-300 mb-1.5">
              Check-Out Date
            </label>
            <div className="relative">
              <input
                id="avail-checkout"
                type="date"
                value={checkOutDate}
                min={addDaysToDateString(checkInDate, 1)}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Room Type */}
          <div>
            <label htmlFor="avail-type" className="block text-xs font-medium text-slate-300 mb-1.5">
              Room Category
            </label>
            <select
              id="avail-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition cursor-pointer"
            >
              <option value="ALL">All Room Types (Single, Double, Deluxe, Suite)</option>
              <option value="SINGLE">Single Room (Rs. 2,000/night)</option>
              <option value="DOUBLE">Double Room (Rs. 3,200/night)</option>
              <option value="DELUXE">Deluxe Room (Rs. 4,800/night)</option>
              <option value="SUITE">Executive Suite (Rs. 7,500/night)</option>
            </select>
          </div>

          {/* Duration info pill */}
          <div className="flex flex-col justify-end">
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Stay Duration</span>
                <span className="text-sm font-bold text-amber-400">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {searchResult.availableRooms.length} Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Search Results Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200">
            Available Rooms for {checkInDate} → {checkOutDate} ({nights} {nights === 1 ? 'night' : 'nights'})
          </h3>
          <span className="text-xs text-slate-400">
            Found {searchResult.availableRooms.length} of {searchResult.totalCount} rooms
          </span>
        </div>

        {searchResult.availableRooms.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
            <XCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-200">No rooms available for the selected dates</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              All rooms in this category are either occupied, reserved, or under maintenance for the dates requested.
              Try adjusting your check-in/out dates or selecting another room category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResult.availableRooms.map((room) => {
              const config = ROOM_TYPE_CONFIGS[room.type];
              const roomCharges = room.rate * nights;
              const tax = roomCharges * 0.1;
              const total = roomCharges + tax;

              return (
                <div
                  key={room.roomNumber}
                  id={`avail-room-${room.roomNumber}`}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-white">Room #{room.roomNumber}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            Floor {room.floor}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-amber-400 mt-0.5">{config.name}</p>
                      </div>
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{config.description}</p>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 block">Nightly Rate</span>
                        <span className="font-semibold text-slate-200">Rs.{room.rate.toLocaleString()}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 block">Total ({nights} nights + 10% tax)</span>
                        <span className="font-bold text-amber-400">Rs.{total.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {room.features.map((feat, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Capacity: {config.capacity} Guest(s)</span>
                    <button
                      id={`btn-select-book-${room.roomNumber}`}
                      onClick={() => onBookRoomWithDates(room.roomNumber, checkInDate, checkOutDate)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-sm"
                    >
                      <span>Book Room</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 14-Day Timeline Availability Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">14-Day Room Occupancy Matrix (Timeline)</h3>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="inline-flex items-center space-x-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
              <span>Vacant</span>
            </span>
            <span className="inline-flex items-center space-x-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-sky-500"></span>
              <span>In-House</span>
            </span>
            <span className="inline-flex items-center space-x-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
              <span>Reserved</span>
            </span>
          </div>
        </div>

        {/* Matrix table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400">
                <th className="p-2.5 sticky left-0 bg-slate-950 z-10 font-semibold w-24">Room</th>
                {timelineDays.map((dayStr) => {
                  const d = new Date(dayStr + 'T00:00:00');
                  const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
                  const dateNum = d.getDate();
                  const isCurrentToday = dayStr === today;

                  return (
                    <th
                      key={dayStr}
                      className={`p-2 text-center font-medium min-w-[42px] ${
                        isCurrentToday ? 'bg-amber-500/10 text-amber-300 font-bold' : ''
                      }`}
                    >
                      <div className="text-[10px] text-slate-500">{dayName}</div>
                      <div>{dateNum}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.roomNumber} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                  <td className="p-2.5 sticky left-0 bg-slate-900 z-10 font-medium text-slate-200 border-r border-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-white">#{room.roomNumber}</span>
                      <span className="text-[10px] text-slate-400">({room.type.slice(0, 1)})</span>
                    </div>
                  </td>
                  {timelineDays.map((dayStr) => {
                    const cell = getRoomDayStatus(room.roomNumber, dayStr);
                    let colorClass = 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20';
                    let label = '•';

                    if (cell.status === 'IN_HOUSE') {
                      colorClass = 'bg-sky-500/30 text-sky-200 font-bold';
                      label = 'IN';
                    } else if (cell.status === 'RESERVED') {
                      colorClass = 'bg-amber-500/30 text-amber-200 font-bold';
                      label = 'RES';
                    }

                    return (
                      <td
                        key={dayStr}
                        title={`Room ${room.roomNumber} on ${dayStr}: ${cell.status}${
                          cell.guestName ? ` (${cell.guestName})` : ''
                        }`}
                        className={`p-1.5 text-center transition ${colorClass}`}
                      >
                        <span className="text-[10px] select-none">{label}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
