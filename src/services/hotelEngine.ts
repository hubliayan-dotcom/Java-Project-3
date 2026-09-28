import {
  Booking,
  BookingStatus,
  Guest,
  Room,
  RoomStatus,
  RoomType,
  ROOM_TYPE_CONFIGS,
  BillBreakdown,
} from '../types/hotel';

const LOCAL_STORAGE_ROOMS_KEY = 'hotel_app_rooms_v1';
const LOCAL_STORAGE_BOOKINGS_KEY = 'hotel_app_bookings_v1';

export const TAX_RATE_PERCENT = 10; // 10% standard hotel tax/GST

export const INITIAL_ROOMS: Room[] = [
  { roomNumber: 101, type: 'SINGLE', status: 'VACANT', floor: 1, rate: 2000, features: ['Window View', 'Near Elevator'] },
  { roomNumber: 102, type: 'SINGLE', status: 'VACANT', floor: 1, rate: 2000, features: ['Quiet Wing', 'Garden Side'] },
  { roomNumber: 103, type: 'DOUBLE', status: 'VACANT', floor: 1, rate: 3000, features: ['High Floor Reach', 'Work Desk'] },
  { roomNumber: 104, type: 'DOUBLE', status: 'VACANT', floor: 1, rate: 3000, features: ['Cozy Corner', 'Soundproofed'] },
  { roomNumber: 201, type: 'DOUBLE', status: 'VACANT', floor: 2, rate: 3000, features: ['City Skyline', 'Balcony'] },
  { roomNumber: 202, type: 'DOUBLE', status: 'VACANT', floor: 2, rate: 3000, features: ['Courtyard View', 'Queen Bed'] },
  { roomNumber: 203, type: 'DELUXE', status: 'VACANT', floor: 2, rate: 4500, features: ['Corner Unit', 'Bathtub'] },
  { roomNumber: 204, type: 'DELUXE', status: 'VACANT', floor: 2, rate: 4500, features: ['Double Vanity', 'Smart Lights'] },
  { roomNumber: 301, type: 'DELUXE', status: 'VACANT', floor: 3, rate: 4500, features: ['Ocean Breeze View', 'Private Terrace', 'Spa Shower'] },
  { roomNumber: 302, type: 'DELUXE', status: 'VACANT', floor: 3, rate: 4500, features: ['King Bed', 'Executive Lounge Access'] },
  { roomNumber: 303, type: 'SUITE', status: 'VACANT', floor: 3, rate: 6000, features: ['Sunset Facing', 'Jacuzzi Tub'] },
  { roomNumber: 304, type: 'SUITE', status: 'VACANT', floor: 3, rate: 6000, features: ['Panoramic Balcony', 'Butler Service'] },
  { roomNumber: 401, type: 'SUITE', status: 'VACANT', floor: 4, rate: 6000, features: ['Penthouse Floor', 'Dedicated Butler', '360 Panoramic View', 'Private Kitchenette'] },
  { roomNumber: 402, type: 'SUITE', status: 'VACANT', floor: 4, rate: 6000, features: ['Penthouse Master Suite', 'Private Lounge'] },
  { roomNumber: 403, type: 'SUITE', status: 'VACANT', floor: 4, rate: 6000, features: ['Skyline Jacuzzi', 'VIP Amenities'] },
  { roomNumber: 404, type: 'SUITE', status: 'VACANT', floor: 4, rate: 6000, features: ['Presidential View', 'Wine Cellar'] },
];

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function calculateNights(checkInStr: string, checkOutStr: string): number {
  const d1 = new Date(checkInStr + 'T00:00:00');
  const d2 = new Date(checkOutStr + 'T00:00:00');
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Checks if two date ranges overlap.
 * Business Rule: Two date ranges [startA, endA) and [startB, endB) overlap if and only if
 * startA < endB AND startB < endA
 * (Adjacent stays where endA == startB do NOT overlap)
 */
export function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA < endB && startB < endA;
}

/**
 * Precise currency/billing calculation with rounding (emulating Java BigDecimal with HALF_UP)
 */
export function calculateBill(
  nightlyRate: number,
  nights: number,
  options?: {
    taxRatePercent?: number;
    extraCharges?: number;
    discountAmount?: number;
    depositPaid?: number;
  }
): BillBreakdown {
  const taxRate = options?.taxRatePercent ?? TAX_RATE_PERCENT;
  const extra = Math.max(0, options?.extraCharges ?? 0);
  const discount = Math.max(0, options?.discountAmount ?? 0);
  const deposit = Math.max(0, options?.depositPaid ?? 0);

  const roomCharges = Number((nightlyRate * nights).toFixed(2));
  const subtotalBeforeTax = Math.max(0, roomCharges + extra - discount);
  const taxAmount = Number(((subtotalBeforeTax * taxRate) / 100).toFixed(2));
  const totalAmount = Number((subtotalBeforeTax + taxAmount).toFixed(2));
  const balanceDue = Number(Math.max(0, totalAmount - deposit).toFixed(2));

  return {
    nights,
    nightlyRate,
    roomCharges,
    taxRatePercent: taxRate,
    taxAmount,
    extraCharges: extra,
    discountAmount: discount,
    depositPaid: deposit,
    totalAmount,
    balanceDue,
  };
}

export class HotelService {
  private rooms: Map<number, Room> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private nextBookingIdNumber = 1001;

  constructor() {
    this.loadState();
  }

  public getRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  public getRoom(roomNumber: number): Room | undefined {
    return this.rooms.get(roomNumber);
  }

  public getBookings(): Booking[] {
    return Array.from(this.bookings.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getBooking(bookingId: string): Booking | undefined {
    return this.bookings.get(bookingId.toUpperCase());
  }

  /**
   * Search available rooms of a given type (or all types) within a date range.
   */
  public searchAvailableRooms(
    checkIn: string,
    checkOut: string,
    type?: RoomType
  ): { availableRooms: Room[]; occupiedCount: number; totalCount: number } {
    const allRooms = this.getRooms().filter((r) => !type || r.type === type);
    const activeBookings = Array.from(this.bookings.values()).filter(
      (b) => b.status === 'RESERVED' || b.status === 'IN_HOUSE'
    );

    const availableRooms = allRooms.filter((room) => {
      // Check maintenance status
      if (room.status === 'MAINTENANCE') {
        return false;
      }
      // Check if room has any active booking overlapping with requested dates
      const hasOverlap = activeBookings.some(
        (b) =>
          b.roomNumber === room.roomNumber &&
          rangesOverlap(checkIn, checkOut, b.checkInDate, b.checkOutDate)
      );
      return !hasOverlap;
    });

    return {
      availableRooms,
      occupiedCount: allRooms.length - availableRooms.length,
      totalCount: allRooms.length,
    };
  }

  /**
   * Validate booking input before creation
   */
  public validateBookingRequest(params: {
    roomNumber: number;
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests?: number;
  }): { valid: boolean; error?: string } {
    if (!params.guestName || params.guestName.trim().length === 0) {
      return { valid: false, error: 'Guest name cannot be empty.' };
    }

    if (!params.checkInDate || !/^\d{4}-\d{2}-\d{2}$/.test(params.checkInDate)) {
      return { valid: false, error: 'Invalid check-in date format. Expected YYYY-MM-DD.' };
    }

    if (!params.checkOutDate || !/^\d{4}-\d{2}-\d{2}$/.test(params.checkOutDate)) {
      return { valid: false, error: 'Invalid check-out date format. Expected YYYY-MM-DD.' };
    }

    if (params.checkOutDate <= params.checkInDate) {
      return { valid: false, error: 'Check-out date must be strictly after check-in date (minimum 1 night).' };
    }

    const room = this.rooms.get(params.roomNumber);
    if (!room) {
      return { valid: false, error: `Room ${params.roomNumber} does not exist.` };
    }

    const maxCap = ROOM_TYPE_CONFIGS[room.type]?.capacity ?? 2;
    if (params.numberOfGuests && params.numberOfGuests > maxCap) {
      return {
        valid: false,
        error: `Capacity exceeded: Room #${room.roomNumber} (${ROOM_TYPE_CONFIGS[room.type]?.name}) allows maximum ${maxCap} guest(s), but ${params.numberOfGuests} were requested.`,
      };
    }

    if (room.status === 'MAINTENANCE') {
      return { valid: false, error: `Room ${params.roomNumber} is currently undergoing maintenance.` };
    }

    // Overlap validation
    const activeBookings = Array.from(this.bookings.values()).filter(
      (b) =>
        b.roomNumber === params.roomNumber &&
        (b.status === 'RESERVED' || b.status === 'IN_HOUSE')
    );

    const conflictingBooking = activeBookings.find((b) =>
      rangesOverlap(params.checkInDate, params.checkOutDate, b.checkInDate, b.checkOutDate)
    );

    if (conflictingBooking) {
      return {
        valid: false,
        error: `Room ${params.roomNumber} is already booked from ${conflictingBooking.checkInDate} to ${conflictingBooking.checkOutDate} (Booking ID: ${conflictingBooking.bookingId}).`,
      };
    }

    return { valid: true };
  }

  /**
   * Create a new booking
   */
  public createBooking(params: {
    roomNumber: number;
    guest: Guest;
    checkInDate: string;
    checkOutDate: string;
    depositPaid?: number;
    discountAmount?: number;
    extraCharges?: number;
  }): { success: boolean; booking?: Booking; error?: string } {
    const validation = this.validateBookingRequest({
      roomNumber: params.roomNumber,
      guestName: params.guest.name,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      numberOfGuests: params.guest.numberOfGuests,
    });

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const room = this.rooms.get(params.roomNumber)!;
    const nights = calculateNights(params.checkInDate, params.checkOutDate);
    const bookingId = `BK-${this.nextBookingIdNumber++}`;

    const billing = calculateBill(room.rate, nights, {
      extraCharges: params.extraCharges,
      discountAmount: params.discountAmount,
      depositPaid: params.depositPaid,
    });

    const booking: Booking = {
      bookingId,
      roomNumber: room.roomNumber,
      roomType: room.type,
      guest: { ...params.guest },
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      nights,
      status: 'RESERVED',
      billing,
      createdAt: new Date().toISOString(),
    };

    this.bookings.set(bookingId, booking);
    this.refreshRoomStatuses();
    this.persistState();

    return { success: true, booking };
  }

  /**
   * Check in guest for an existing booking
   */
  public checkIn(bookingId: string): { success: boolean; message: string; booking?: Booking } {
    const booking = this.getBooking(bookingId);
    if (!booking) {
      return { success: false, message: `No booking found for ID ${bookingId}.` };
    }

    if (booking.status !== 'RESERVED') {
      return {
        success: false,
        message: `Cannot check in. Booking status is '${booking.status}' (must be 'RESERVED').`,
      };
    }

    booking.status = 'IN_HOUSE';
    booking.checkedInAt = new Date().toISOString();

    const room = this.rooms.get(booking.roomNumber);
    if (room) {
      room.status = 'OCCUPIED';
      room.currentBookingId = booking.bookingId;
    }

    this.persistState();
    return {
      success: true,
      message: `Guest ${booking.guest.name} checked in to Room ${booking.roomNumber}. Enjoy your stay!`,
      booking,
    };
  }

  /**
   * Check out guest and finalize bill
   */
  public checkOut(
    bookingId: string,
    additionalCharges: number = 0
  ): { success: boolean; message: string; booking?: Booking; bill?: BillBreakdown } {
    const booking = this.getBooking(bookingId);
    if (!booking) {
      return { success: false, message: `No booking found for ID ${bookingId}.` };
    }

    if (booking.status !== 'IN_HOUSE') {
      return {
        success: false,
        message: `Cannot check out. Booking status is '${booking.status}' (must be 'IN_HOUSE').`,
      };
    }

    if (additionalCharges > 0) {
      booking.billing = calculateBill(booking.billing.nightlyRate, booking.nights, {
        extraCharges: (booking.billing.extraCharges || 0) + additionalCharges,
        discountAmount: booking.billing.discountAmount,
        depositPaid: booking.billing.depositPaid,
      });
    }

    booking.status = 'COMPLETED';
    booking.checkedOutAt = new Date().toISOString();

    const room = this.rooms.get(booking.roomNumber);
    if (room) {
      room.status = 'VACANT';
      if (room.currentBookingId === booking.bookingId) {
        room.currentBookingId = null;
      }
    }

    this.refreshRoomStatuses();
    this.persistState();

    return {
      success: true,
      message: `Booking ${bookingId} for ${booking.guest.name} checked out successfully. Room ${booking.roomNumber} is now VACANT.`,
      booking,
      bill: booking.billing,
    };
  }

  /**
   * Cancel an existing reservation
   */
  public cancelBooking(
    bookingId: string,
    reason: string = 'Guest requested cancellation'
  ): { success: boolean; message: string; booking?: Booking } {
    const booking = this.getBooking(bookingId);
    if (!booking) {
      return { success: false, message: `No booking found for ID ${bookingId}.` };
    }

    if (booking.status !== 'RESERVED') {
      return {
        success: false,
        message: `Cannot cancel booking ${bookingId}. Only 'RESERVED' bookings can be cancelled (current status: '${booking.status}').`,
      };
    }

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date().toISOString();
    booking.cancellationReason = reason;

    const room = this.rooms.get(booking.roomNumber);
    if (room && room.currentBookingId === booking.bookingId) {
      room.currentBookingId = null;
    }

    this.refreshRoomStatuses();
    this.persistState();

    return {
      success: true,
      message: `Booking ${bookingId} has been successfully cancelled.`,
      booking,
    };
  }

  /**
   * Update Room Status manually (e.g. set to Maintenance or Cleaning)
   */
  public updateRoomStatus(roomNumber: number, status: RoomStatus): { success: boolean; message: string } {
    const room = this.rooms.get(roomNumber);
    if (!room) {
      return { success: false, message: `Room ${roomNumber} not found.` };
    }
    room.status = status;
    this.persistState();
    return { success: true, message: `Room ${roomNumber} status updated to ${status}.` };
  }

  /**
   * Re-evaluate room statuses based on currently active bookings and today's date
   */
  public refreshRoomStatuses(): void {
    const today = getTodayDateString();
    
    // First reset non-maintenance rooms to VACANT
    for (const room of this.rooms.values()) {
      if (room.status !== 'MAINTENANCE' && room.status !== 'CLEANING') {
        room.status = 'VACANT';
        room.currentBookingId = null;
      }
    }

    // Find in-house bookings
    for (const booking of this.bookings.values()) {
      if (booking.status === 'IN_HOUSE') {
        const room = this.rooms.get(booking.roomNumber);
        if (room) {
          room.status = 'OCCUPIED';
          room.currentBookingId = booking.bookingId;
        }
      }
    }
  }

  /**
   * Export booking records to CSV string matching data/bookings.csv format
   */
  public exportBookingsCSV(): string {
    const headers = [
      'booking_id',
      'room_number',
      'room_type',
      'guest_name',
      'guest_email',
      'guest_phone',
      'check_in',
      'check_out',
      'nights',
      'status',
      'nightly_rate',
      'tax_amount',
      'total_amount',
      'deposit_paid',
      'balance_due',
      'cancellation_reason',
      'created_at',
    ];

    const rows = Array.from(this.bookings.values()).map((b) => [
      b.bookingId,
      b.roomNumber,
      b.roomType,
      `"${b.guest.name.replace(/"/g, '""')}"`,
      b.guest.email || '',
      b.guest.phone || '',
      b.checkInDate,
      b.checkOutDate,
      b.nights,
      b.status,
      b.billing.nightlyRate.toFixed(2),
      b.billing.taxAmount.toFixed(2),
      b.billing.totalAmount.toFixed(2),
      b.billing.depositPaid.toFixed(2),
      b.billing.balanceDue.toFixed(2),
      `"${(b.cancellationReason || '').replace(/"/g, '""')}"`,
      b.createdAt,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * Import bookings from CSV
   */
  public importBookingsCSV(csvContent: string): { importedCount: number; errors: string[] } {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      return { importedCount: 0, errors: ['CSV is empty or missing data rows.'] };
    }

    let count = 0;
    const errors: string[] = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',');
      if (cols.length >= 10) {
        try {
          const bookingId = cols[0].trim();
          const roomNumber = parseInt(cols[1].trim(), 10);
          const roomType = (cols[2].trim() as RoomType) || 'SINGLE';
          const guestName = cols[3].replace(/^"|"$/g, '').trim();
          const guestEmail = cols[4]?.trim() || '';
          const guestPhone = cols[5]?.trim() || '';
          const checkInDate = cols[6].trim();
          const checkOutDate = cols[7].trim();
          const nights = parseInt(cols[8].trim(), 10) || 1;
          const status = (cols[9].trim() as BookingStatus) || 'RESERVED';
          const nightlyRate = parseFloat(cols[10]?.trim() || '2000');
          const totalAmount = parseFloat(cols[12]?.trim() || '2200');
          const cancellationReason = cols[15] ? cols[15].replace(/^"|"$/g, '').trim() : undefined;

          const billing = calculateBill(nightlyRate, nights);
          billing.totalAmount = totalAmount;

          const booking: Booking = {
            bookingId,
            roomNumber,
            roomType,
            guest: {
              name: guestName,
              email: guestEmail,
              phone: guestPhone,
            },
            checkInDate,
            checkOutDate,
            nights,
            status,
            cancellationReason: cancellationReason || undefined,
            billing,
            createdAt: new Date().toISOString(),
          };

          this.bookings.set(bookingId, booking);
          count++;
        } catch (err: any) {
          errors.push(`Row ${i + 1}: ${err.message}`);
        }
      }
    }

    this.refreshRoomStatuses();
    this.persistState();
    return { importedCount: count, errors };
  }

  /**
   * Reset data to initial sample seed
   */
  public resetToSampleData(): void {
    localStorage.removeItem(LOCAL_STORAGE_ROOMS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_BOOKINGS_KEY);
    this.rooms.clear();
    this.bookings.clear();
    this.nextBookingIdNumber = 1001;
    this.seedDefaultData();
    this.persistState();
  }

  // Private helpers
  private loadState(): void {
    try {
      const storedRooms = localStorage.getItem(LOCAL_STORAGE_ROOMS_KEY);
      const storedBookings = localStorage.getItem(LOCAL_STORAGE_BOOKINGS_KEY);

      if (storedRooms && storedBookings) {
        const roomsArr: Room[] = JSON.parse(storedRooms);
        const bookingsArr: Booking[] = JSON.parse(storedBookings);

        roomsArr.forEach((r) => this.rooms.set(r.roomNumber, r));
        bookingsArr.forEach((b) => {
          this.bookings.set(b.bookingId, b);
          const num = parseInt(b.bookingId.replace(/\D/g, ''), 10);
          if (!isNaN(num) && num >= this.nextBookingIdNumber) {
            this.nextBookingIdNumber = num + 1;
          }
        });

        this.refreshRoomStatuses();
        return;
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage, seeding defaults', e);
    }

    this.seedDefaultData();
    this.persistState();
  }

  private seedDefaultData(): void {
    INITIAL_ROOMS.forEach((r) => this.rooms.set(r.roomNumber, { ...r }));

    const today = getTodayDateString();
    const in3Days = addDaysToDateString(today, 3);
    const in5Days = addDaysToDateString(today, 5);
    const in7Days = addDaysToDateString(today, 7);
    const yesterday = addDaysToDateString(today, -1);
    const in2Days = addDaysToDateString(today, 2);

    // 1. IN_HOUSE Booking on Room 101
    const b1: Booking = {
      bookingId: 'BK-1001',
      roomNumber: 101,
      roomType: 'SINGLE',
      guest: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 555-0192',
        idType: 'Passport',
        idNumber: 'P892011A',
        specialRequests: 'Quiet room near corner',
      },
      checkInDate: yesterday,
      checkOutDate: in2Days,
      nights: 3,
      status: 'IN_HOUSE',
      billing: calculateBill(2000, 3, { depositPaid: 2000 }),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      checkedInAt: new Date(Date.now() - 86400000).toISOString(),
    };

    // 2. RESERVED Booking on Room 201
    const b2: Booking = {
      bookingId: 'BK-1002',
      roomNumber: 201,
      roomType: 'DOUBLE',
      guest: {
        name: 'Sarah Connor',
        email: 'sarah.c@techcorp.io',
        phone: '+1 555-0441',
        idType: 'Driving License',
        idNumber: 'DL-992182',
        specialRequests: 'Late check-in requested (8 PM)',
      },
      checkInDate: today,
      checkOutDate: in3Days,
      nights: 3,
      status: 'RESERVED',
      billing: calculateBill(3200, 3, { depositPaid: 3200 }),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    };

    // 3. RESERVED Booking on Room 301 (Deluxe)
    const b3: Booking = {
      bookingId: 'BK-1003',
      roomNumber: 301,
      roomType: 'DELUXE',
      guest: {
        name: 'Alexander Vance',
        email: 'a.vance@vanceholdings.com',
        phone: '+1 555-0812',
        idType: 'National ID',
        idNumber: 'ID-448201',
        specialRequests: 'High floor, champagne on arrival',
      },
      checkInDate: in3Days,
      checkOutDate: in7Days,
      nights: 4,
      status: 'RESERVED',
      billing: calculateBill(4800, 4, { depositPaid: 10000, extraCharges: 500 }),
      createdAt: new Date().toISOString(),
    };

    // 4. COMPLETED Booking in past
    const b4: Booking = {
      bookingId: 'BK-1000',
      roomNumber: 202,
      roomType: 'DOUBLE',
      guest: {
        name: 'Michael Scott',
        email: 'michael.scott@dunder.com',
        phone: '+1 555-0100',
        idType: 'Passport',
      },
      checkInDate: addDaysToDateString(today, -5),
      checkOutDate: yesterday,
      nights: 4,
      status: 'COMPLETED',
      billing: calculateBill(3200, 4, { depositPaid: 14080 }),
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      checkedInAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      checkedOutAt: new Date(Date.now() - 86400000).toISOString(),
    };

    this.bookings.set(b1.bookingId, b1);
    this.bookings.set(b2.bookingId, b2);
    this.bookings.set(b3.bookingId, b3);
    this.bookings.set(b4.bookingId, b4);

    this.nextBookingIdNumber = 1004;

    this.refreshRoomStatuses();
  }

  private persistState(): void {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_ROOMS_KEY,
        JSON.stringify(Array.from(this.rooms.values()))
      );
      localStorage.setItem(
        LOCAL_STORAGE_BOOKINGS_KEY,
        JSON.stringify(Array.from(this.bookings.values()))
      );
    } catch (e) {
      console.error('Failed to persist to localStorage', e);
    }
  }
}

export const hotelService = new HotelService();
