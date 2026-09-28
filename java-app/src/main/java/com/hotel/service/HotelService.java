package com.hotel.service;

import com.hotel.model.*;
import com.hotel.repository.FileManager;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

public class HotelService {
    private final Map<Integer, Room> rooms = new LinkedHashMap<>();
    private final List<Booking> bookings = new ArrayList<>();
    private final FileManager fileManager;
    private int nextBookingSequence = 1001;

    public HotelService() {
        this(new FileManager());
    }

    public HotelService(FileManager fileManager) {
        this.fileManager = Objects.requireNonNull(fileManager, "FileManager cannot be null");
        initializeDefaultRooms();
        loadExistingBookings();
    }

    private void initializeDefaultRooms() {
        // Floor 1 - Singles & Doubles
        addRoom(new Room(101, RoomType.SINGLE));
        addRoom(new Room(102, RoomType.SINGLE));
        addRoom(new Room(103, RoomType.DOUBLE));
        addRoom(new Room(104, RoomType.DOUBLE));

        // Floor 2 - Doubles & Deluxes
        addRoom(new Room(201, RoomType.DOUBLE));
        addRoom(new Room(202, RoomType.DOUBLE));
        addRoom(new Room(203, RoomType.DELUXE));
        addRoom(new Room(204, RoomType.DELUXE));

        // Floor 3 - Deluxes & Suites
        addRoom(new Room(301, RoomType.DELUXE));
        addRoom(new Room(302, RoomType.DELUXE));
        addRoom(new Room(303, RoomType.SUITE));
        addRoom(new Room(304, RoomType.SUITE));

        // Floor 4 - Executive Suites
        addRoom(new Room(401, RoomType.SUITE));
        addRoom(new Room(402, RoomType.SUITE));
        addRoom(new Room(403, RoomType.SUITE));
        addRoom(new Room(404, RoomType.SUITE));
    }

    private void addRoom(Room room) {
        rooms.put(room.getRoomNumber(), room);
    }

    private void loadExistingBookings() {
        List<Booking> loaded = fileManager.loadBookings(rooms);
        bookings.addAll(loaded);

        // Update sequence counter based on loaded IDs
        for (Booking b : loaded) {
            String id = b.getBookingId();
            if (id.startsWith("BK-")) {
                try {
                    int num = Integer.parseInt(id.substring(3));
                    if (num >= nextBookingSequence) {
                        nextBookingSequence = num + 1;
                    }
                } catch (NumberFormatException ignored) {}
            }
        }
        syncRoomStatusesWithBookings(LocalDate.now());
    }

    public synchronized List<Room> getAllRooms() {
        return new ArrayList<>(rooms.values());
    }

    public synchronized Optional<Room> getRoom(int roomNumber) {
        return Optional.ofNullable(rooms.get(roomNumber));
    }

    public synchronized List<Booking> getAllBookings() {
        return Collections.unmodifiableList(new ArrayList<>(bookings));
    }

    public synchronized Optional<Booking> getBooking(String bookingId) {
        if (bookingId == null) return Optional.empty();
        return bookings.stream()
                .filter(b -> b.getBookingId().equalsIgnoreCase(bookingId.trim()))
                .findFirst();
    }

    /**
     * Date Overlap Detection Rule:
     * Two date intervals [startA, endA) and [startB, endB) overlap if and only if:
     * startA < endB AND startB < endA
     */
    public synchronized boolean isRoomAvailable(int roomNumber, LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null || !checkOut.isAfter(checkIn)) {
            return false;
        }
        Room room = rooms.get(roomNumber);
        if (room == null || room.getStatus() == RoomStatus.MAINTENANCE) {
            return false;
        }

        for (Booking b : bookings) {
            if (b.getRoom().getRoomNumber() == roomNumber) {
                // Cancelled and completed bookings do not block new reservations
                if (b.getStatus() == BookingStatus.RESERVED || b.getStatus() == BookingStatus.IN_HOUSE) {
                    boolean overlaps = checkIn.isBefore(b.getCheckOut()) && b.getCheckIn().isBefore(checkOut);
                    if (overlaps) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    public synchronized List<Room> searchAvailableRooms(LocalDate checkIn, LocalDate checkOut, RoomType type) {
        if (checkIn == null || checkOut == null || !checkOut.isAfter(checkIn)) {
            return Collections.emptyList();
        }

        return rooms.values().stream()
                .filter(r -> type == null || r.getRoomType() == type)
                .filter(r -> isRoomAvailable(r.getRoomNumber(), checkIn, checkOut))
                .collect(Collectors.toList());
    }

    public synchronized Booking createBooking(int roomNumber, Guest guest, LocalDate checkIn, LocalDate checkOut) {
        Room room = rooms.get(roomNumber);
        if (room == null) {
            throw new IllegalArgumentException("Room #" + roomNumber + " does not exist in hotel inventory.");
        }
        if (checkIn == null || checkOut == null) {
            throw new IllegalArgumentException("Check-in and check-out dates cannot be null.");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("Check-out date (" + checkOut + ") must be after check-in date (" + checkIn + ").");
        }
        if (guest == null) {
            throw new IllegalArgumentException("Guest details cannot be null.");
        }

        // Maximum Guest Capacity Rule
        if (guest.getNumberOfGuests() > room.getMaximumCapacity()) {
            throw new IllegalArgumentException(String.format(
                    "Capacity exceeded: Room #%d (%s) allows maximum %d guest(s), but %d were requested.",
                    roomNumber, room.getRoomType().getDisplayName(), room.getMaximumCapacity(), guest.getNumberOfGuests()));
        }

        // Overlap Verification Rule
        if (!isRoomAvailable(roomNumber, checkIn, checkOut)) {
            throw new IllegalStateException("Room #" + roomNumber + " is not available between " + checkIn + " and " + checkOut + ".");
        }

        String bookingId = "BK-" + (nextBookingSequence++);
        Booking booking = new Booking(bookingId, guest, room, checkIn, checkOut, BookingStatus.RESERVED);
        bookings.add(booking);
        fileManager.saveBooking(booking);

        syncRoomStatusesWithBookings(LocalDate.now());
        return booking;
    }

    public synchronized boolean cancelBooking(String bookingId) {
        return cancelBooking(bookingId, "Guest requested cancellation");
    }

    public synchronized boolean cancelBooking(String bookingId, String reason) {
        Optional<Booking> opt = getBooking(bookingId);
        if (opt.isEmpty()) {
            throw new NoSuchElementException("No booking found with ID: " + bookingId);
        }

        Booking booking = opt.get();
        if (booking.getStatus() != BookingStatus.RESERVED) {
            throw new IllegalStateException("Cannot cancel booking " + bookingId + " because its status is " + booking.getStatus() + ". Only RESERVED bookings can be cancelled.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason != null && !reason.trim().isEmpty() ? reason.trim() : "Guest requested cancellation");
        fileManager.updateAllBookings(bookings);
        syncRoomStatusesWithBookings(LocalDate.now());
        return true;
    }

    public synchronized Booking checkIn(String bookingId) {
        Optional<Booking> opt = getBooking(bookingId);
        if (opt.isEmpty()) {
            throw new NoSuchElementException("No booking found with ID: " + bookingId);
        }

        Booking booking = opt.get();
        if (booking.getStatus() != BookingStatus.RESERVED) {
            throw new IllegalStateException("Cannot check-in booking " + bookingId + " with status: " + booking.getStatus() + ". Expected status: RESERVED.");
        }

        booking.setStatus(BookingStatus.IN_HOUSE);
        booking.getRoom().setStatus(RoomStatus.OCCUPIED);
        fileManager.updateAllBookings(bookings);
        return booking;
    }

    public synchronized Booking checkOut(String bookingId) {
        Optional<Booking> opt = getBooking(bookingId);
        if (opt.isEmpty()) {
            throw new NoSuchElementException("No booking found with ID: " + bookingId);
        }

        Booking booking = opt.get();
        if (booking.getStatus() != BookingStatus.IN_HOUSE) {
            throw new IllegalStateException("Cannot check-out booking " + bookingId + " with status: " + booking.getStatus() + ". Guest must be IN_HOUSE to check out.");
        }

        booking.setStatus(BookingStatus.COMPLETED);
        booking.getRoom().setStatus(RoomStatus.VACANT);
        fileManager.updateAllBookings(bookings);
        syncRoomStatusesWithBookings(LocalDate.now());
        return booking;
    }

    public synchronized void syncRoomStatusesWithBookings(LocalDate date) {
        // Reset all active rooms to vacant first (unless in maintenance)
        for (Room r : rooms.values()) {
            if (r.getStatus() != RoomStatus.MAINTENANCE) {
                r.setStatus(RoomStatus.VACANT);
            }
        }

        // Mark occupied if an IN_HOUSE booking is currently staying
        for (Booking b : bookings) {
            if (b.getStatus() == BookingStatus.IN_HOUSE) {
                Room r = rooms.get(b.getRoom().getRoomNumber());
                if (r != null && r.getStatus() != RoomStatus.MAINTENANCE) {
                    r.setStatus(RoomStatus.OCCUPIED);
                }
            }
        }
    }
}
