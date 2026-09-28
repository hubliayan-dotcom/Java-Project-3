import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Room, RoomType, Guest, ROOM_TYPE_CONFIGS } from '../../types/hotel';
import {
  getTodayDateString,
  addDaysToDateString,
  calculateNights,
  calculateBill,
  hotelService,
} from '../../services/hotelEngine';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoomNumber?: number;
  initialCheckIn?: string;
  initialCheckOut?: string;
  onBookingCreated: (bookingId: string) => void;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  onClose,
  initialRoomNumber,
  initialCheckIn,
  initialCheckOut,
  onBookingCreated,
}) => {
  const today = getTodayDateString();

  const [roomNumber, setRoomNumber] = useState<number>(initialRoomNumber || 101);
  const [checkInDate, setCheckInDate] = useState<string>(initialCheckIn || today);
  const [checkOutDate, setCheckOutDate] = useState<string>(initialCheckOut || addDaysToDateString(today, 2));

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState<number>(1);
  const [idType, setIdType] = useState('Passport');
  const [idNumber, setIdNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const [depositPaid, setDepositPaid] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [extraCharges, setExtraCharges] = useState<number>(0);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when props change
  useEffect(() => {
    if (initialRoomNumber) setRoomNumber(initialRoomNumber);
    if (initialCheckIn) setCheckInDate(initialCheckIn);
    if (initialCheckOut) setCheckOutDate(initialCheckOut);
  }, [initialRoomNumber, initialCheckIn, initialCheckOut, isOpen]);

  if (!isOpen) return null;

  const allRooms = hotelService.getRooms();
  const selectedRoom = allRooms.find((r) => r.roomNumber === roomNumber) || allRooms[0];
  const roomConfig = ROOM_TYPE_CONFIGS[selectedRoom?.type || 'SINGLE'];

  const nights = Math.max(1, calculateNights(checkInDate, checkOutDate));
  const bill = calculateBill(selectedRoom?.rate || 2000, nights, {
    depositPaid,
    discountAmount,
    extraCharges,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const guest: Guest = {
      name: guestName.trim(),
      email: guestEmail.trim(),
      phone: guestPhone.trim(),
      numberOfGuests,
      idType,
      idNumber: idNumber.trim(),
      specialRequests: specialRequests.trim(),
    };

    const res = hotelService.createBooking({
      roomNumber,
      guest,
      checkInDate,
      checkOutDate,
      depositPaid,
      discountAmount,
      extraCharges,
    });

    if (!res.success || !res.booking) {
      setErrorMessage(res.error || 'Failed to create booking.');
      return;
    }

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (_) {}

    onBookingCreated(res.booking.bookingId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Create New Hotel Reservation</h2>
            <p className="text-xs text-slate-400">Front Desk Booking & Rate Calculation Workflow</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-rose-200">Validation Error</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Room & Date Selection Grid */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">1. Room & Stay Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Room select */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Room</label>
                <select
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {allRooms.map((r) => (
                    <option key={r.roomNumber} value={r.roomNumber}>
                      Room #{r.roomNumber} — {r.type} (Rs.{r.rate}/nt)
                    </option>
                  ))}
                </select>
              </div>

              {/* Check-In Date */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Check-In Date</label>
                <input
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
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Check-Out Date */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Check-Out Date</label>
                <input
                  type="date"
                  value={checkOutDate}
                  min={addDaysToDateString(checkInDate, 1)}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Room info snippet */}
            <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-2.5">
              <span>{roomConfig.name} • {roomConfig.bedType} • Max {roomConfig.capacity} Guests</span>
              <span className="font-semibold text-slate-200">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
            </div>
          </div>

          {/* Guest Information */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">2. Guest Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +1 555-0199"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. guest@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">ID Proof (Type & #)</label>
                <div className="flex space-x-2">
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="Passport">Passport</option>
                    <option value="Driver License">DL</option>
                    <option value="National ID">ID Card</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Document #"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Number of Guests <span className="text-amber-400 font-normal">(Max: {roomConfig.capacity})</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={roomConfig.capacity}
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Special Requests</label>
              <input
                type="text"
                placeholder="e.g. Early check-in, extra towels, quiet room"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Pricing & Billing Summary */}
          <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center justify-between">
              <span>3. Financial Breakdown (BigDecimal Precision)</span>
              <span className="text-[11px] font-normal text-slate-400">10% Tax Applied</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Room Charge</span>
                <span className="font-semibold text-slate-200">
                  {nights} × Rs.{selectedRoom.rate} = Rs.{bill.roomCharges.toFixed(2)}
                </span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">GST / Tax (10%)</span>
                <span className="font-semibold text-slate-200">Rs.{bill.taxAmount.toFixed(2)}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total Amount</span>
                <span className="font-bold text-amber-400 text-sm">Rs.{bill.totalAmount.toFixed(2)}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <label className="text-[10px] text-slate-400 block">Deposit Advance</label>
                <input
                  type="number"
                  min="0"
                  max={bill.totalAmount}
                  step="100"
                  value={depositPaid || ''}
                  placeholder="0"
                  onChange={(e) => setDepositPaid(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-emerald-400 font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-300">
              <span>Balance Payable at Check-out:</span>
              <strong className="text-amber-300 font-bold text-sm">Rs.{bill.balanceDue.toFixed(2)}</strong>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-confirm-create-booking"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm &amp; Create Booking</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
