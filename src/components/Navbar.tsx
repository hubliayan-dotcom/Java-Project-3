import React from 'react';
import {
  Building2,
  CalendarDays,
  ListFilter,
  Terminal,
  CheckCircle2,
  BookOpen,
  Plus,
  Download,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Room, Booking } from '../types/hotel';

export type TabType = 'frontdesk' | 'search' | 'bookings' | 'terminal' | 'tests' | 'interview';

interface NavbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenNewBooking: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  rooms: Room[];
  bookings: Booking[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenNewBooking,
  onExportCSV,
  onResetData,
  rooms,
  bookings,
}) => {
  const occupiedCount = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const vacantCount = rooms.filter((r) => r.status === 'VACANT').length;
  const occupancyPercent = rooms.length > 0 ? Math.round((occupiedCount / rooms.length) * 100) : 0;

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'frontdesk', label: 'Front Desk PMS', icon: <Building2 className="w-4 h-4" />, badge: `${vacantCount} Vacant` },
    { id: 'search', label: 'Room Availability', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'bookings', label: 'Bookings & Records', icon: <ListFilter className="w-4 h-4" />, badge: bookings.length },
    { id: 'terminal', label: 'Java CLI Simulator', icon: <Terminal className="w-4 h-4" /> },
    { id: 'tests', label: 'Test Matrix (10/10)', icon: <CheckCircle2 className="w-4 h-4" />, badge: 'QA' },
    { id: 'interview', label: 'Java Guide & Q&A', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hotel Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Building2 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-lg tracking-tight text-white">Grand Horizon Hotel</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  PMS v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Room Booking & Front Desk Property Management Engine</p>
            </div>
          </div>

          {/* Hotel quick metrics & action buttons */}
          <div className="flex items-center space-x-3">
            {/* Occupancy Pill */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className="text-slate-400">Occupancy:</span>
              <span className="font-semibold text-amber-400">{occupancyPercent}%</span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400 font-medium">{vacantCount} Free</span>
            </div>

            {/* Quick Actions */}
            <button
              id="btn-export-csv-top"
              onClick={onExportCSV}
              title="Download data/bookings.csv"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              id="btn-reset-data-top"
              onClick={onResetData}
              title="Reset to initial seed data"
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              id="btn-new-booking-top"
              onClick={onOpenNewBooking}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Booking</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none" aria-label="Main Navigation">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full font-semibold ${
                      isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
