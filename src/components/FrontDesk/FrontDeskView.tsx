import React, { useState } from 'react';
import {
  Search,
  Filter,
  Layers,
  LayoutGrid,
  CheckCircle2,
  Bed,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Room, RoomStatus, RoomType, Booking, ROOM_TYPE_CONFIGS } from '../../types/hotel';
import { RoomCard } from './RoomCard';

interface FrontDeskViewProps {
  rooms: Room[];
  bookings: Booking[];
  onBookRoom: (roomNumber?: number) => void;
  onCheckIn: (bookingId: string) => void;
  onCheckOut: (bookingId: string) => void;
  onViewBooking: (bookingId: string) => void;
  onUpdateRoomStatus: (roomNumber: number, status: RoomStatus) => void;
  onRefreshStatuses: () => void;
}

export const FrontDeskView: React.FC<FrontDeskViewProps> = ({
  rooms,
  bookings,
  onBookRoom,
  onCheckIn,
  onCheckOut,
  onViewBooking,
  onUpdateRoomStatus,
  onRefreshStatuses,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RoomStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | RoomType>('ALL');
  const [viewGrouping, setViewGrouping] = useState<'grid' | 'floor'>('floor');

  // Active mapping: roomNumber -> current in-house booking
  const inHouseByRoom = new Map<number, Booking>();
  const nextReservedByRoom = new Map<number, Booking>();

  bookings.forEach((b) => {
    if (b.status === 'IN_HOUSE') {
      inHouseByRoom.set(b.roomNumber, b);
    } else if (b.status === 'RESERVED') {
      if (!nextReservedByRoom.has(b.roomNumber)) {
        nextReservedByRoom.set(b.roomNumber, b);
      }
    }
  });

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchRoom = r.roomNumber.toString().includes(q);
      const matchType = r.type.toLowerCase().includes(q);
      const inHouseGuest = inHouseByRoom.get(r.roomNumber)?.guest.name.toLowerCase().includes(q);
      const reservedGuest = nextReservedByRoom.get(r.roomNumber)?.guest.name.toLowerCase().includes(q);
      return matchRoom || matchType || inHouseGuest || reservedGuest;
    }
    return true;
  });

  // Group by floor
  const floors = Array.from(new Set<number>(rooms.map((r) => r.floor))).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="frontdesk-search-input"
            type="text"
            placeholder="Search room #, type, or guest name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/60 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status & Type filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({rooms.length})
            </button>
            <button
              onClick={() => setStatusFilter('VACANT')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'VACANT' ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vacant
            </button>
            <button
              onClick={() => setStatusFilter('OCCUPIED')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'OCCUPIED' ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Occupied
            </button>
            <button
              onClick={() => setStatusFilter('MAINTENANCE')}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === 'MAINTENANCE' ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Maint.
            </button>
          </div>

          {/* Type Select */}
          <select
            id="frontdesk-type-select"
            aria-label="Filter rooms by type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">All Room Types</option>
            <option value="SINGLE">Single Rooms</option>
            <option value="DOUBLE">Double Rooms</option>
            <option value="DELUXE">Deluxe Rooms</option>
            <option value="SUITE">Suites</option>
          </select>

          {/* View toggle (Grid vs Floor) */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewGrouping('floor')}
              title="Group by Floor"
              className={`p-1.5 rounded cursor-pointer ${
                viewGrouping === 'floor' ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewGrouping('grid')}
              title="Full Grid View"
              className={`p-1.5 rounded cursor-pointer ${
                viewGrouping === 'grid' ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onRefreshStatuses}
            title="Refresh room statuses"
            className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-400 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Room Listing Content */}
      {filteredRooms.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
          <Bed className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No rooms match your filter</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing search keywords, or selecting 'All' filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
              setTypeFilter('ALL');
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewGrouping === 'floor' ? (
        /* Floor-by-floor view */
        <div className="space-y-8">
          {floors.map((floorNum) => {
            const floorRooms = filteredRooms.filter((r) => r.floor === floorNum);
            if (floorRooms.length === 0) return null;

            return (
              <div key={floorNum} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <h3 className="font-semibold text-sm text-slate-200">Floor {floorNum}</h3>
                    <span className="text-xs text-slate-500">({floorRooms.length} rooms)</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {floorRooms.filter((r) => r.status === 'VACANT').length} Available
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {floorRooms.map((room) => (
                    <RoomCard
                      key={room.roomNumber}
                      room={room}
                      currentBooking={inHouseByRoom.get(room.roomNumber)}
                      upcomingBooking={nextReservedByRoom.get(room.roomNumber)}
                      onBookRoom={() => onBookRoom(room.roomNumber)}
                      onCheckIn={onCheckIn}
                      onCheckOut={onCheckOut}
                      onViewBooking={onViewBooking}
                      onUpdateStatus={onUpdateRoomStatus}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.roomNumber}
              room={room}
              currentBooking={inHouseByRoom.get(room.roomNumber)}
              upcomingBooking={nextReservedByRoom.get(room.roomNumber)}
              onBookRoom={() => onBookRoom(room.roomNumber)}
              onCheckIn={onCheckIn}
              onCheckOut={onCheckOut}
              onViewBooking={onViewBooking}
              onUpdateStatus={onUpdateRoomStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};
