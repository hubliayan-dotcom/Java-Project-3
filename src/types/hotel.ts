export type RoomType = 'SINGLE' | 'DOUBLE' | 'DELUXE' | 'SUITE';
export type RoomStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' | 'CLEANING';
export type BookingStatus = 'RESERVED' | 'IN_HOUSE' | 'COMPLETED' | 'CANCELLED';

export interface RoomTypeConfig {
  type: RoomType;
  name: string;
  nightlyRate: number; // in currency units (e.g., Rs. / $)
  capacity: number;
  bedType: string;
  amenities: string[];
  description: string;
}

export interface Room {
  roomNumber: number;
  type: RoomType;
  status: RoomStatus;
  floor: number;
  rate: number;
  features: string[];
  currentBookingId?: string | null;
}

export interface Guest {
  name: string;
  email: string;
  phone: string;
  numberOfGuests?: number;
  idType?: string;
  idNumber?: string;
  specialRequests?: string;
}

export interface BillBreakdown {
  nights: number;
  nightlyRate: number;
  roomCharges: number; // nights * nightlyRate
  taxRatePercent: number; // e.g. 10% or 12%
  taxAmount: number;
  extraCharges: number;
  discountAmount: number;
  depositPaid: number;
  totalAmount: number;
  balanceDue: number;
}

export interface Booking {
  bookingId: string;
  roomNumber: number;
  roomType: RoomType;
  guest: Guest;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nights: number;
  status: BookingStatus;
  billing: BillBreakdown;
  createdAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface TestResult {
  id: number;
  title: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'RUNNING' | 'PENDING';
  expected: string;
  actual: string;
  executionLogs: string[];
  durationMs: number;
}

export const ROOM_TYPE_CONFIGS: Record<RoomType, RoomTypeConfig> = {
  SINGLE: {
    type: 'SINGLE',
    name: 'Single Room',
    nightlyRate: 2000,
    capacity: 1,
    bedType: '1 Single Bed',
    amenities: ['High-speed Wi-Fi', 'Work Desk', 'En-suite Bathroom', 'Smart TV'],
    description: 'Cozy and functional for solo travelers and business professionals.',
  },
  DOUBLE: {
    type: 'DOUBLE',
    name: 'Double Room',
    nightlyRate: 3000,
    capacity: 2,
    bedType: '1 Queen Bed',
    amenities: ['High-speed Wi-Fi', 'Coffee Maker', 'City View', 'Air Conditioning', 'Smart TV'],
    description: 'Spacious room ideal for couples or twin travelers.',
  },
  DELUXE: {
    type: 'DELUXE',
    name: 'Deluxe Room',
    nightlyRate: 4500,
    capacity: 3,
    bedType: '1 King Bed + 1 Sofa',
    amenities: ['Balcony View', 'Mini Bar', 'Bath Tub', 'Complimentary Breakfast', 'High-speed Wi-Fi', 'Smart TV'],
    description: 'Premium luxury room with breathtaking views and upscale amenities.',
  },
  SUITE: {
    type: 'SUITE',
    name: 'Executive Suite',
    nightlyRate: 6000,
    capacity: 4,
    bedType: 'Master Bedroom + Living Area',
    amenities: ['Private Lounge', 'Jacuzzi', 'Butler Service', 'Complimentary Breakfast', 'Mini Bar', 'Panoramic View'],
    description: 'The pinnacle of luxury with separated living room, master suite, and VIP privileges.',
  },
};
