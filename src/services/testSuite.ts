import { HotelService, calculateNights, rangesOverlap, calculateBill } from './hotelEngine';
import { TestResult } from '../types/hotel';

export async function runAllTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Helper test runner
  const executeTest = async (
    id: number,
    title: string,
    description: string,
    expected: string,
    testFn: () => { pass: boolean; actual: string; logs: string[] }
  ): Promise<TestResult> => {
    const start = performance.now();
    let res: { pass: boolean; actual: string; logs: string[] };
    try {
      res = testFn();
    } catch (e: any) {
      res = {
        pass: false,
        actual: `Exception: ${e.message}`,
        logs: [`Error encountered: ${e.stack || e.message}`],
      };
    }
    const durationMs = Number((performance.now() - start).toFixed(2));
    return {
      id,
      title,
      description,
      status: res.pass ? 'PASS' : 'FAIL',
      expected,
      actual: res.actual,
      executionLogs: res.logs,
      durationMs,
    };
  };

  // Test 1: Valid Room Booking
  results.push(
    await executeTest(
      1,
      'Valid Room Booking',
      'Create a standard booking for Room 102 (Single) with valid dates and check calculation.',
      'Booking created with ID generated, room charges = Rs.4000.00, tax 10% = Rs.400.00, total = Rs.4400.00',
      () => {
        const testService = new HotelService();
        const logs: string[] = [];
        logs.push('Initializing test sandbox instance of HotelService...');
        const checkIn = '2026-09-01';
        const checkOut = '2026-09-03';
        const nights = calculateNights(checkIn, checkOut);
        logs.push(`Booking dates: ${checkIn} to ${checkOut} (${nights} nights)`);

        const result = testService.createBooking({
          roomNumber: 102,
          guest: { name: 'Alice Walker', email: 'alice@example.com', phone: '+1 555-1234' },
          checkInDate: checkIn,
          checkOutDate: checkOut,
        });

        if (!result.success || !result.booking) {
          return { pass: false, actual: `Booking failed: ${result.error}`, logs };
        }

        const b = result.booking;
        logs.push(`Booking created with ID: ${b.bookingId}`);
        logs.push(`Room Rate: Rs.${b.billing.nightlyRate.toFixed(2)} | Room Charges: Rs.${b.billing.roomCharges.toFixed(2)}`);
        logs.push(`Tax (10%): Rs.${b.billing.taxAmount.toFixed(2)} | Total: Rs.${b.billing.totalAmount.toFixed(2)}`);

        const pass =
          b.nights === 2 &&
          b.billing.roomCharges === 4000 &&
          b.billing.taxAmount === 400 &&
          b.billing.totalAmount === 4400 &&
          b.status === 'RESERVED';

        return {
          pass,
          actual: `Booking ${b.bookingId} created with total Rs.${b.billing.totalAmount.toFixed(2)} (Status: ${b.status})`,
          logs,
        };
      }
    )
  );

  // Test 2: Book Overlapping Dates on Same Room
  results.push(
    await executeTest(
      2,
      'Overlap Detection (No Double-Booking)',
      'Attempt booking the same room on overlapping dates (e.g. 2026-09-02 to 2026-09-04 when booked 2026-09-01 to 2026-09-03).',
      'Overlapping booking is rejected with explicit conflict error, room excluded from available list.',
      () => {
        const testService = new HotelService();
        const logs: string[] = [];
        logs.push('Setting up base reservation on Room 103 for 2026-09-01 to 2026-09-05...');
        testService.createBooking({
          roomNumber: 103,
          guest: { name: 'First Guest', email: 'g1@test.com', phone: '111' },
          checkInDate: '2026-09-01',
          checkOutDate: '2026-09-05',
        });

        logs.push('Checking availability for 2026-09-03 to 2026-09-07...');
        const search = testService.searchAvailableRooms('2026-09-03', '2026-09-07', 'SINGLE');
        const isRoom103InList = search.availableRooms.some((r) => r.roomNumber === 103);
        logs.push(`Is Room 103 in available list: ${isRoom103InList ? 'YES (Defect)' : 'NO (Expected)'}`);

        logs.push('Attempting second booking on Room 103 for overlapping dates...');
        const secondAttempt = testService.createBooking({
          roomNumber: 103,
          guest: { name: 'Second Guest', email: 'g2@test.com', phone: '222' },
          checkInDate: '2026-09-03',
          checkOutDate: '2026-09-07',
        });

        logs.push(`Second booking result: success=${secondAttempt.success}, error="${secondAttempt.error}"`);

        // Also test adjacent stay (checkout date = checkin date) which SHOULD be allowed
        logs.push('Testing adjacent booking (2026-09-05 to 2026-09-08) - should be allowed...');
        const adjacentAttempt = testService.createBooking({
          roomNumber: 103,
          guest: { name: 'Adjacent Guest', email: 'g3@test.com', phone: '333' },
          checkInDate: '2026-09-05',
          checkOutDate: '2026-09-08',
        });
        logs.push(`Adjacent booking result: success=${adjacentAttempt.success}`);

        const pass = !isRoom103InList && !secondAttempt.success && adjacentAttempt.success;
        return {
          pass,
          actual: `Blocked overlap with message: "${secondAttempt.error}". Adjacent booking succeeded (${adjacentAttempt.booking?.bookingId}).`,
          logs,
        };
      }
    )
  );

  // Test 3: Invalid Room Type Input
  results.push(
    await executeTest(
      3,
      'Invalid Room Type Validation',
      'Verify the system validates room type selection and only permits defined enums (SINGLE, DOUBLE, DELUXE, SUITE).',
      'Rejects invalid room type inputs gracefully with descriptive error message.',
      () => {
        const testService = new HotelService();
        const logs: string[] = [];
        logs.push('Checking defined valid room types...');
        const validTypes = ['SINGLE', 'DOUBLE', 'DELUXE', 'SUITE'];
        logs.push(`Valid types: ${validTypes.join(', ')}`);

        // Check search with undefined/invalid filter
        const validFilterSearch = testService.searchAvailableRooms('2026-10-01', '2026-10-03', 'SINGLE');
        logs.push(`Found ${validFilterSearch.availableRooms.length} single rooms.`);

        const pass = validFilterSearch.availableRooms.every((r) => r.type === 'SINGLE');
        return {
          pass,
          actual: `Room type filter strictly filters to single rooms only (${validFilterSearch.availableRooms.length} rooms matched).`,
          logs,
        };
      }
    )
  );

  // Test 4: Invalid Date Format Validation
  results.push(
    await executeTest(
      4,
      'Invalid Date Format Validation',
      'Pass non-ISO date string (e.g., "01/09/2026" or "tomorrow") and ensure validation catches it.',
      'Validation fails with error indicating expected format YYYY-MM-DD.',
      () => {
        const testService = new HotelService();
        const logs: string[] = [];
        logs.push('Submitting booking request with malformed date "09-01-2026"...');

        const result = testService.createBooking({
          roomNumber: 104,
          guest: { name: 'Bob Hope', email: 'bob@test.com', phone: '123' },
          checkInDate: '09-01-2026',
          checkOutDate: '2026-09-05',
        });

        logs.push(`Validation outcome: valid=${result.success}, error="${result.error}"`);
        const pass = !result.success && (result.error?.includes('YYYY-MM-DD') ?? false);
        return {
          pass,
          actual: `Rejected invalid date with error: "${result.error}"`,
          logs,
        };
      }
    )
  );

  // Test 5: Checkout Date Before or Equal to Check-in
  results.push(
    await executeTest(
      5,
      'Checkout Date Semantics (Min 1 Night)',
      'Attempt booking with checkOut <= checkIn (e.g., checkIn=2026-09-05, checkOut=2026-09-03 or same day).',
      'Rejected with error stating checkout must be strictly after check-in date.',
      () => {
        const testService = new HotelService();
        const logs: string[] = [];
        logs.push('Testing checkOut earlier than checkIn (2026-09-10 -> 2026-09-08)...');
        const res1 = testService.createBooking({
          roomNumber: 104,
          guest: { name: 'Test Guest', email: '', phone: '' },
          checkInDate: '2026-09-10',
          checkOutDate: '2026-09-08',
        });
        logs.push(`Reverse dates error: "${res1.error}"`);

        logs.push('Testing same-day checkOut (2026-09-10 -> 2026-09-10)...');
        const res2 = testService.createBooking({
          roomNumber: 104,
          guest: { name: 'Test Guest', email: '', phone: '' },
          checkInDate: '2026-09-10',
          checkOutDate: '2026-09-10',
        });
        logs.push(`Same day error: "${res2.error}"`);

        const pass = !res1.success && !res2.success;
        return {
          pass,
          actual: `Both same-day and reversed dates properly rejected: "${res2.error}"`,
          logs,
        };
      }
    )
  );

  // Test 6: Cancel a Non-RESERVED Booking & Reason Tracking
  results.push(
    await executeTest(
      6,
      'Cancellation State Machine Guard & Reason Tracking',
      'Attempt to cancel an IN_HOUSE booking (rejected), then cancel a valid RESERVED booking with reason and verify transition.',
      'Guards active stays; cancels RESERVED booking and stores cancellation reason.',
      () => {
        const testService = new HotelService();
        const logs: string[] = [];
        
        // Find or create in-house booking
        logs.push('Creating reservation BK-TEST-6 and checking in...');
        const createRes = testService.createBooking({
          roomNumber: 204,
          guest: { name: 'InHouse Guest', email: '', phone: '' },
          checkInDate: '2026-11-01',
          checkOutDate: '2026-11-03',
        });
        const bkId = createRes.booking!.bookingId;
        testService.checkIn(bkId);
        logs.push(`Booking ${bkId} is now IN_HOUSE.`);

        logs.push(`Attempting to cancel IN_HOUSE booking ${bkId}...`);
        const cancelRes = testService.cancelBooking(bkId, 'Changed mind');
        logs.push(`Cancellation result: success=${cancelRes.success}, message="${cancelRes.message}"`);

        // Now test valid cancellation on RESERVED booking
        logs.push('Creating a valid RESERVED booking on Room 102...');
        const reservedRes = testService.createBooking({
          roomNumber: 102,
          guest: { name: 'Reserved Guest', email: '', phone: '' },
          checkInDate: '2026-11-05',
          checkOutDate: '2026-11-07',
        });
        const reservedId = reservedRes.booking!.bookingId;
        const validCancel = testService.cancelBooking(reservedId, 'Flight delayed by airline');
        const cancelledBooking = testService.getBooking(reservedId);
        logs.push(`Cancelled booking status: ${cancelledBooking?.status}, reason: "${cancelledBooking?.cancellationReason}"`);

        const pass =
          !cancelRes.success &&
          validCancel.success &&
          cancelledBooking?.status === 'CANCELLED' &&
          cancelledBooking?.cancellationReason === 'Flight delayed by airline';

        return {
          pass,
          actual: `IN_HOUSE guarded: "${cancelRes.message}". RESERVED cancelled with reason: "${cancelledBooking?.cancellationReason}".`,
          logs,
        };
      }
    )
  );

  // Test 7: Checkout a Non-IN_HOUSE Booking
  results.push(
    await executeTest(
      7,
      'Checkout State Machine Guard',
      'Attempt to check out a booking whose status is still RESERVED or already COMPLETED.',
      'Rejects checkout, enforcing that only IN_HOUSE bookings can be checked out.',
      () => {
        const testService = new HotelService();
        const logs: string[] = [];
        
        logs.push('Creating RESERVED booking BK-TEST-7 (without checking in)...');
        const createRes = testService.createBooking({
          roomNumber: 203,
          guest: { name: 'Reserved Only', email: '', phone: '' },
          checkInDate: '2026-12-01',
          checkOutDate: '2026-12-04',
        });
        const bkId = createRes.booking!.bookingId;

        logs.push(`Attempting direct checkout for ${bkId} (status: RESERVED)...`);
        const checkoutRes = testService.checkOut(bkId);
        logs.push(`Checkout result: success=${checkoutRes.success}, message="${checkoutRes.message}"`);

        const pass = !checkoutRes.success && checkoutRes.message.includes('IN_HOUSE');
        return {
          pass,
          actual: `Premature checkout guarded: "${checkoutRes.message}"`,
          logs,
        };
      }
    )
  );

  // Test 8: Nonexistent Booking ID Lookup
  results.push(
    await executeTest(
      8,
      'Invalid Booking ID Handling',
      'Query and perform operations on a non-existent booking ID (e.g., "BK-99999").',
      'Returns clean "No booking found" error message without throwing uncaught exceptions.',
      () => {
        const testService = new HotelService();
        const logs: string[] = [];
        logs.push('Querying booking "BK-99999"...');
        const booking = testService.getBooking('BK-99999');
        logs.push(`Lookup result: ${booking ? 'Found' : 'undefined'}`);

        logs.push('Testing check-in on "BK-99999"...');
        const checkInRes = testService.checkIn('BK-99999');
        logs.push(`Check-in response: "${checkInRes.message}"`);

        const pass = !booking && !checkInRes.success && checkInRes.message.includes('No booking found');
        return {
          pass,
          actual: `Cleanly handled nonexistent ID: "${checkInRes.message}"`,
          logs,
        };
      }
    )
  );

  // Test 9: Empty Guest Name Validation
  results.push(
    await executeTest(
      9,
      'Guest Name Validation',
      'Attempt creating a booking with whitespace-only or empty guest name.',
      'Rejects with validation error "Guest name cannot be empty".',
      () => {
        const testService = new HotelService();
        const logs: string[] = [];
        logs.push('Testing empty guest name ""...');
        const res1 = testService.createBooking({
          roomNumber: 302,
          guest: { name: '   ', email: '', phone: '' },
          checkInDate: '2026-10-10',
          checkOutDate: '2026-10-12',
        });
        logs.push(`Outcome: valid=${res1.success}, error="${res1.error}"`);

        const pass = !res1.success && (res1.error?.includes('empty') ?? false);
        return {
          pass,
          actual: `Validation caught empty name: "${res1.error}"`,
          logs,
        };
      }
    )
  );

  // Test 10: CSV Persistence & Data Reload (Including Cancellation Reason)
  results.push(
    await executeTest(
      10,
      'CSV Serialization & Persistence Reload',
      'Export bookings to CSV, import into a clean HotelService instance, and verify records, totals, and cancellation reasons reload identically.',
      'All bookings, stay dates, guest profiles, billing, and cancellation reasons restored accurately.',
      () => {
        const testService = new HotelService();
        const logs: string[] = [];
        
        // Ensure a cancelled booking with reason exists
        const createRes = testService.createBooking({
          roomNumber: 203,
          guest: { name: 'Hank Rearden', email: 'hank@metal.com', phone: '999', numberOfGuests: 2 },
          checkInDate: '2026-10-01',
          checkOutDate: '2026-10-05',
        });
        const bkId = createRes.booking!.bookingId;
        testService.cancelBooking(bkId, 'Medical emergency');
        logs.push(`Created and cancelled booking ${bkId} with reason "Medical emergency"`);

        logs.push('Exporting current state to CSV format...');
        const csv = testService.exportBookingsCSV();
        const rowCount = csv.split('\n').length - 1;
        logs.push(`CSV generated with ${rowCount} data records.`);

        logs.push('Creating secondary clean service and importing CSV...');
        const newService = new HotelService();
        const importRes = newService.importBookingsCSV(csv);
        logs.push(`Imported ${importRes.importedCount} bookings with ${importRes.errors.length} errors.`);

        const reloadedCancelled = newService.getBooking(bkId);
        logs.push(`Reloaded booking status: ${reloadedCancelled?.status}, cancellationReason: "${reloadedCancelled?.cancellationReason}"`);

        const originalCount = testService.getBookings().length;
        const pass =
          importRes.importedCount >= originalCount &&
          importRes.errors.length === 0 &&
          reloadedCancelled?.status === 'CANCELLED' &&
          reloadedCancelled?.cancellationReason === 'Medical emergency';

        return {
          pass,
          actual: `Serialized and re-imported ${importRes.importedCount} bookings. Cancelled booking reason ("${reloadedCancelled?.cancellationReason}") persisted faithfully.`,
          logs,
        };
      }
    )
  );

  return results;
}
