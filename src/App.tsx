/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Navbar,
  TabType,
} from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { FrontDeskView } from './components/FrontDesk/FrontDeskView';
import { AvailabilityView } from './components/AvailabilitySearch/AvailabilityView';
import { BookingListView } from './components/Booking/BookingListView';
import { NewBookingModal } from './components/Booking/NewBookingModal';
import { BookingDetailModal } from './components/Booking/BookingDetailModal';
import { JavaConsoleEmulator } from './components/Terminal/JavaConsoleEmulator';
import { TestSuiteRunner } from './components/Tests/TestSuiteRunner';
import { InterviewPrepHub } from './components/Interview/InterviewPrepHub';
import { hotelService } from './services/hotelEngine';
import { Room, Booking, RoomStatus } from './types/hotel';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('frontdesk');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Modals state
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [newBookingParams, setNewBookingParams] = useState<{
    roomNumber?: number;
    checkIn?: string;
    checkOut?: string;
  }>({});

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Notification toast
  const [toast, setToast] = useState<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4000);
  };

  const refreshData = () => {
    setRooms([...hotelService.getRooms()]);
    setBookings([...hotelService.getBookings()]);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Actions
  const handleOpenNewBooking = (roomNumber?: number, checkIn?: string, checkOut?: string) => {
    setNewBookingParams({ roomNumber, checkIn, checkOut });
    setIsNewBookingOpen(true);
  };

  const handleBookingCreated = (bookingId: string) => {
    refreshData();
    showToast(`Booking ${bookingId} successfully confirmed & saved to records!`, 'success');
  };

  const handleViewBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsDetailModalOpen(true);
  };

  const handleCheckIn = (bookingId: string) => {
    const res = hotelService.checkIn(bookingId);
    refreshData();
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleCheckOut = (bookingId: string, additionalCharges: number = 0) => {
    const res = hotelService.checkOut(bookingId, additionalCharges);
    refreshData();
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleCancelBooking = (bookingId: string, reason?: string) => {
    const res = hotelService.cancelBooking(bookingId, reason);
    refreshData();
    if (res.success) {
      showToast(res.message, 'info');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleUpdateRoomStatus = (roomNumber: number, status: RoomStatus) => {
    const res = hotelService.updateRoomStatus(roomNumber, status);
    refreshData();
    if (res.success) {
      showToast(res.message, 'info');
    }
  };

  const handleExportCSV = () => {
    const csvContent = hotelService.exportBookingsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookings.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported data/bookings.csv successfully!', 'success');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all rooms and bookings to default sample dataset?')) {
      hotelService.resetToSampleData();
      refreshData();
      showToast('Hotel inventory & booking records reset to clean sample state.', 'info');
    }
  };

  const activeBooking = selectedBookingId ? hotelService.getBooking(selectedBookingId) || null : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center space-x-3 text-xs sm:text-sm max-w-md transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-950 border-emerald-600/50 text-emerald-200'
              : toast.type === 'error'
              ? 'bg-rose-950 border-rose-600/50 text-rose-200'
              : 'bg-sky-950 border-sky-600/50 text-sky-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-sky-400 shrink-0" />
          )}
          <span className="flex-1 font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenNewBooking={() => handleOpenNewBooking()}
        onExportCSV={handleExportCSV}
        onResetData={handleResetData}
        rooms={rooms}
        bookings={bookings}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Stats Banner */}
        <StatsBanner
          rooms={rooms}
          bookings={bookings}
          onOpenNewBooking={() => handleOpenNewBooking()}
        />

        {/* Tab Content Switches */}
        {currentTab === 'frontdesk' && (
          <FrontDeskView
            rooms={rooms}
            bookings={bookings}
            onBookRoom={(num) => handleOpenNewBooking(num)}
            onCheckIn={handleCheckIn}
            onCheckOut={(id) => {
              setSelectedBookingId(id);
              setIsDetailModalOpen(true);
            }}
            onViewBooking={handleViewBooking}
            onUpdateRoomStatus={handleUpdateRoomStatus}
            onRefreshStatuses={() => {
              hotelService.refreshRoomStatuses();
              refreshData();
              showToast('Room statuses re-synchronized.', 'info');
            }}
          />
        )}

        {currentTab === 'search' && (
          <AvailabilityView
            rooms={rooms}
            bookings={bookings}
            onBookRoomWithDates={(roomNum, checkIn, checkOut) =>
              handleOpenNewBooking(roomNum, checkIn, checkOut)
            }
          />
        )}

        {currentTab === 'bookings' && (
          <BookingListView
            bookings={bookings}
            onViewBooking={handleViewBooking}
            onCheckIn={handleCheckIn}
            onCheckOut={(id) => {
              setSelectedBookingId(id);
              setIsDetailModalOpen(true);
            }}
            onCancelBooking={handleCancelBooking}
            onOpenNewBooking={() => handleOpenNewBooking()}
            onExportCSV={handleExportCSV}
          />
        )}

        {currentTab === 'terminal' && <JavaConsoleEmulator />}

        {currentTab === 'tests' && <TestSuiteRunner />}

        {currentTab === 'interview' && <InterviewPrepHub />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-400">Grand Horizon Hotel Room Booking System</span> — Java OOP &amp; Front Desk PMS Model
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>BigDecimal Currency</span>
            <span>•</span>
            <span>Date-Range Overlap Guard</span>
            <span>•</span>
            <span>CSV Persistence</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewBookingModal
        isOpen={isNewBookingOpen}
        onClose={() => setIsNewBookingOpen(false)}
        initialRoomNumber={newBookingParams.roomNumber}
        initialCheckIn={newBookingParams.checkIn}
        initialCheckOut={newBookingParams.checkOut}
        onBookingCreated={handleBookingCreated}
      />

      <BookingDetailModal
        booking={activeBooking}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onCheckIn={(id) => {
          handleCheckIn(id);
          setIsDetailModalOpen(false);
        }}
        onCheckOut={(id, addCharge) => {
          handleCheckOut(id, addCharge);
          setIsDetailModalOpen(false);
        }}
        onCancelBooking={(id, reason) => {
          handleCancelBooking(id, reason);
          setIsDetailModalOpen(false);
        }}
      />
    </div>
  );
}
