package com.hotel;

import com.hotel.model.*;
import com.hotel.repository.FileManager;
import com.hotel.service.HotelService;
import org.junit.jupiter.api.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class HotelServiceTest {
    private static Path tempCsv;
    private FileManager fileManager;
    private HotelService hotelService;

    @BeforeEach
    public void setUp() throws IOException {
        tempCsv = Files.createTempFile("test-bookings-", ".csv");
        fileManager = new FileManager(tempCsv.toString());
        hotelService = new HotelService(fileManager);
    }

    @AfterEach
    public void tearDown() throws IOException {
        Files.deleteIfExists(tempCsv);
    }

    @Test
    @Order(1)
    @DisplayName("Test 1: Valid Booking Creation and Bill Calculation")
    public void testValidBookingCreation() {
        Guest guest = new Guest("Alice Smith", "+1 555-0101", "alice@example.com", "ID-9921", 1);
        LocalDate checkIn = LocalDate.of(2026, 9, 1);
        LocalDate checkOut = LocalDate.of(2026, 9, 4); // 3 nights

        Booking booking = hotelService.createBooking(101, guest, checkIn, checkOut);

        assertNotNull(booking.getBookingId());
        assertEquals(3, booking.getNumberOfNights());
        assertEquals(new BigDecimal("6000.00"), booking.getRoomCharge()); // 3 * 2000
        assertEquals(new BigDecimal("600.00"), booking.getTaxAmount());   // 10%
        assertEquals(new BigDecimal("6600.00"), booking.getTotalAmount());
        assertEquals(BookingStatus.RESERVED, booking.getStatus());
    }

    @Test
    @Order(2)
    @DisplayName("Test 2: Double-Booking Overlapping Dates Rejected")
    public void testOverlappingDatesRejected() {
        Guest guest1 = new Guest("Guest One", "111", 1);
        Guest guest2 = new Guest("Guest Two", "222", 1);

        hotelService.createBooking(101, guest1, LocalDate.of(2026, 9, 5), LocalDate.of(2026, 9, 10));

        // Overlapping requested stay: Sep 7 to Sep 12
        assertThrows(IllegalStateException.class, () -> {
            hotelService.createBooking(101, guest2, LocalDate.of(2026, 9, 7), LocalDate.of(2026, 9, 12));
        });
    }

    @Test
    @Order(3)
    @DisplayName("Test 3: Adjacent Stays (Back-to-Back) Allowed")
    public void testAdjacentStaysAllowed() {
        Guest guest1 = new Guest("Guest One", "111", 1);
        Guest guest2 = new Guest("Guest Two", "222", 1);

        Booking b1 = hotelService.createBooking(101, guest1, LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 5));
        // Guest 2 checks in on the exact checkout day of Guest 1
        Booking b2 = hotelService.createBooking(101, guest2, LocalDate.of(2026, 9, 5), LocalDate.of(2026, 9, 8));

        assertNotNull(b1);
        assertNotNull(b2);
        assertEquals(2, hotelService.getAllBookings().size());
    }

    @Test
    @Order(4)
    @DisplayName("Test 4: Invalid Date Range (Checkout <= Checkin) Rejected")
    public void testInvalidDateRangeRejected() {
        Guest guest = new Guest("Bob Martin", "333", 1);
        LocalDate checkIn = LocalDate.of(2026, 9, 10);
        LocalDate checkOutSame = LocalDate.of(2026, 9, 10);
        LocalDate checkOutBefore = LocalDate.of(2026, 9, 8);

        assertThrows(IllegalArgumentException.class, () -> {
            hotelService.createBooking(101, guest, checkIn, checkOutSame);
        });

        assertThrows(IllegalArgumentException.class, () -> {
            hotelService.createBooking(101, guest, checkIn, checkOutBefore);
        });
    }

    @Test
    @Order(5)
    @DisplayName("Test 5: Guest Count Exceeding Room Capacity Rejected")
    public void testGuestCapacityValidation() {
        // Room 101 is Single Room (Max capacity: 1)
        Guest tooManyGuests = new Guest("Family", "444", 3);
        LocalDate in = LocalDate.of(2026, 9, 1);
        LocalDate out = LocalDate.of(2026, 9, 3);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            hotelService.createBooking(101, tooManyGuests, in, out);
        });
        assertTrue(ex.getMessage().contains("Capacity exceeded"));
    }

    @Test
    @Order(6)
    @DisplayName("Test 6: Cancel RESERVED Booking Transitions to CANCELLED and Stores Reason")
    public void testCancelReservedBooking() {
        Guest guest = new Guest("Charlie", "555", 1);
        Booking b = hotelService.createBooking(102, guest, LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 3));

        boolean cancelled = hotelService.cancelBooking(b.getBookingId(), "Flight delayed by airline");
        assertTrue(cancelled);
        assertEquals(BookingStatus.CANCELLED, b.getStatus());
        assertEquals("Flight delayed by airline", b.getCancellationReason());

        // Cancelled booking frees the room for another reservation on the same dates
        Booking newBooking = hotelService.createBooking(102, new Guest("Dave", "666", 1), LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 3));
        assertNotNull(newBooking);
    }

    @Test
    @Order(7)
    @DisplayName("Test 7: Cannot Cancel IN_HOUSE or COMPLETED Booking")
    public void testInvalidCancellationLifecycle() {
        Guest guest = new Guest("Eva", "777", 1);
        Booking b = hotelService.createBooking(103, guest, LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 3));

        hotelService.checkIn(b.getBookingId());
        assertEquals(BookingStatus.IN_HOUSE, b.getStatus());

        assertThrows(IllegalStateException.class, () -> {
            hotelService.cancelBooking(b.getBookingId(), "Trying to cancel in-house stay");
        });
    }

    @Test
    @Order(8)
    @DisplayName("Test 8: Check-In Transitions Booking to IN_HOUSE and Room to OCCUPIED")
    public void testCheckInLifecycle() {
        Guest guest = new Guest("Frank", "888", 2);
        Booking b = hotelService.createBooking(201, guest, LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 3));

        assertEquals(RoomStatus.VACANT, b.getRoom().getStatus());
        hotelService.checkIn(b.getBookingId());

        assertEquals(BookingStatus.IN_HOUSE, b.getStatus());
        assertEquals(RoomStatus.OCCUPIED, b.getRoom().getStatus());
    }

    @Test
    @Order(9)
    @DisplayName("Test 9: Check-Out Transitions Booking to COMPLETED and Room to VACANT")
    public void testCheckOutLifecycle() {
        Guest guest = new Guest("Grace", "999", 2);
        Booking b = hotelService.createBooking(202, guest, LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 3));

        hotelService.checkIn(b.getBookingId());
        hotelService.checkOut(b.getBookingId());

        assertEquals(BookingStatus.COMPLETED, b.getStatus());
        assertEquals(RoomStatus.VACANT, b.getRoom().getStatus());
    }

    @Test
    @Order(10)
    @DisplayName("Test 10: CSV Persistence Reload Round-Trip Including Cancellation Reason")
    public void testCsvPersistenceRestart() {
        Guest guest = new Guest("Hank", "000", 2);
        Booking b = hotelService.createBooking(203, guest, LocalDate.of(2026, 10, 1), LocalDate.of(2026, 10, 5));
        String id = b.getBookingId();

        // Simulate application restart with new Service instance reading the same CSV
        HotelService restartedService = new HotelService(new FileManager(tempCsv.toString()));
        List<Booking> reloaded = restartedService.getAllBookings();

        assertEquals(1, reloaded.size());
        Booking loadedBooking = reloaded.get(0);
        assertEquals(id, loadedBooking.getBookingId());
        assertEquals("Hank", loadedBooking.getGuest().getGuestName());
        assertEquals(4, loadedBooking.getNumberOfNights());
        assertEquals(new BigDecimal("19800.00"), loadedBooking.getTotalAmount()); // 4 * 4500 = 18000 + 10% = 19800

        // Cancel and verify persistence of cancellation reason across reload
        restartedService.cancelBooking(id, "Medical emergency");
        HotelService reloadAfterCancel = new HotelService(new FileManager(tempCsv.toString()));
        Booking cancelledReload = reloadAfterCancel.getBooking(id).orElseThrow();
        assertEquals(BookingStatus.CANCELLED, cancelledReload.getStatus());
        assertEquals("Medical emergency", cancelledReload.getCancellationReason());
    }
}
