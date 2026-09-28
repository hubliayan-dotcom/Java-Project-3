export interface JavaFileEntry {
  path: string;
  filename: string;
  category: 'model' | 'repository' | 'service' | 'utility' | 'main' | 'test' | 'config' | 'doc';
  description: string;
  content: string;
}

export const JAVA_PROJECT_FILES: JavaFileEntry[] = [
  {
    path: 'src/main/java/com/hotel/model/RoomType.java',
    filename: 'RoomType.java',
    category: 'model',
    description: 'Enum defining room tiers with encapsulated display name, nightly rate (BigDecimal), and maximum guest capacity.',
    content: `package com.hotel.model;

import java.math.BigDecimal;

public enum RoomType {
    SINGLE("Single Room", new BigDecimal("2000.00"), 1),
    DOUBLE("Double Room", new BigDecimal("3000.00"), 2),
    DELUXE("Deluxe Room", new BigDecimal("4500.00"), 3),
    SUITE("Executive Suite", new BigDecimal("6000.00"), 4);

    private final String displayName;
    private final BigDecimal pricePerNight;
    private final int maxCapacity;

    RoomType(String displayName, BigDecimal pricePerNight, int maxCapacity) {
        this.displayName = displayName;
        this.pricePerNight = pricePerNight;
        this.maxCapacity = maxCapacity;
    }

    public String getDisplayName() {
        return displayName;
    }

    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }

    public int getMaxCapacity() {
        return maxCapacity;
    }
}
`,
  },
  {
    path: 'src/main/java/com/hotel/model/RoomStatus.java',
    filename: 'RoomStatus.java',
    category: 'model',
    description: 'Enum representing physical room state: VACANT, OCCUPIED, or MAINTENANCE.',
    content: `package com.hotel.model;

public enum RoomStatus {
    VACANT,
    OCCUPIED,
    MAINTENANCE
}
`,
  },
  {
    path: 'src/main/java/com/hotel/model/BookingStatus.java',
    filename: 'BookingStatus.java',
    category: 'model',
    description: 'Enum defining reservation state machine: RESERVED -> IN_HOUSE -> COMPLETED or CANCELLED.',
    content: `package com.hotel.model;

public enum BookingStatus {
    RESERVED,
    IN_HOUSE,
    COMPLETED,
    CANCELLED
}
`,
  },
  {
    path: 'src/main/java/com/hotel/model/Room.java',
    filename: 'Room.java',
    category: 'model',
    description: 'Room entity encapsulating roomNumber, type, price, maximum capacity, and status.',
    content: `package com.hotel.model;

import java.math.BigDecimal;
import java.util.Objects;

public class Room {
    private final int roomNumber;
    private final RoomType roomType;
    private final BigDecimal pricePerNight;
    private final int maximumCapacity;
    private RoomStatus status;

    public Room(int roomNumber, RoomType roomType) {
        if (roomNumber <= 0) {
            throw new IllegalArgumentException("Room number must be positive");
        }
        Objects.requireNonNull(roomType, "Room type cannot be null");
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.pricePerNight = roomType.getPricePerNight();
        this.maximumCapacity = roomType.getMaxCapacity();
        this.status = RoomStatus.VACANT;
    }

    public Room(int roomNumber, RoomType roomType, RoomStatus status) {
        this(roomNumber, roomType);
        this.status = Objects.requireNonNull(status, "Room status cannot be null");
    }

    public int getRoomNumber() {
        return roomNumber;
    }

    public RoomType getRoomType() {
        return roomType;
    }

    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }

    public int getMaximumCapacity() {
        return maximumCapacity;
    }

    public RoomStatus getStatus() {
        return status;
    }

    public void setStatus(RoomStatus status) {
        this.status = Objects.requireNonNull(status, "Status cannot be null");
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Room room = (Room) o;
        return roomNumber == room.roomNumber;
    }

    @Override
    public int hashCode() {
        return Objects.hash(roomNumber);
    }

    @Override
    public String toString() {
        return String.format("Room #%-4d | %-15s | Cap: %d | Status: %-10s | ₹%s/night",
                roomNumber, roomType.getDisplayName(), maximumCapacity, status, pricePerNight);
    }
}
`,
  },
  {
    path: 'src/main/java/com/hotel/model/Guest.java',
    filename: 'Guest.java',
    category: 'model',
    description: 'Guest value object tracking name, contact info, ID verification, and number of guests.',
    content: `package com.hotel.model;

import java.util.Objects;

public class Guest {
    private final String guestName;
    private final String phone;
    private final String email;
    private final String idProof;
    private final int numberOfGuests;

    public Guest(String guestName, String phone, String email, String idProof, int numberOfGuests) {
        if (guestName == null || guestName.trim().isEmpty()) {
            throw new IllegalArgumentException("Guest name cannot be empty");
        }
        if (numberOfGuests <= 0) {
            throw new IllegalArgumentException("Number of guests must be at least 1");
        }
        this.guestName = guestName.trim();
        this.phone = phone != null ? phone.trim() : "";
        this.email = email != null ? email.trim() : "";
        this.idProof = idProof != null ? idProof.trim() : "";
        this.numberOfGuests = numberOfGuests;
    }

    public Guest(String guestName, String phone, int numberOfGuests) {
        this(guestName, phone, "", "", numberOfGuests);
    }

    public String getGuestName() {
        return guestName;
    }

    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }

    public String getIdProof() {
        return idProof;
    }

    public int getNumberOfGuests() {
        return numberOfGuests;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Guest guest = (Guest) o;
        return guestName.equalsIgnoreCase(guest.guestName) && Objects.equals(phone, guest.phone);
    }

    @Override
    public int hashCode() {
        return Objects.hash(guestName.toLowerCase(), phone);
    }

    @Override
    public String toString() {
        return String.format("%s (Phone: %s, Guests: %d)", guestName, phone.isEmpty() ? "N/A" : phone, numberOfGuests);
    }
}
`,
  },
  {
    path: 'src/main/java/com/hotel/model/Booking.java',
    filename: 'Booking.java',
    category: 'model',
    description: 'Booking aggregate with date interval math, BigDecimal financial totals, cancellationReason persistence, and ASCII bill renderer.',
    content: `package com.hotel.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

public class Booking {
    private final String bookingId;
    private final Guest guest;
    private final Room room;
    private final LocalDate checkIn;
    private final LocalDate checkOut;
    private final long numberOfNights;
    private final BigDecimal roomCharge;
    private final BigDecimal taxAmount;
    private final BigDecimal totalAmount;
    private BookingStatus status;
    private String cancellationReason;

    public Booking(String bookingId, Guest guest, Room room, LocalDate checkIn, LocalDate checkOut) {
        this(bookingId, guest, room, checkIn, checkOut, BookingStatus.RESERVED, "");
    }

    public Booking(String bookingId, Guest guest, Room room, LocalDate checkIn, LocalDate checkOut, BookingStatus status) {
        this(bookingId, guest, room, checkIn, checkOut, status, "");
    }

    public Booking(String bookingId, Guest guest, Room room, LocalDate checkIn, LocalDate checkOut, BookingStatus status, String cancellationReason) {
        this.bookingId = Objects.requireNonNull(bookingId, "Booking ID cannot be null");
        this.guest = Objects.requireNonNull(guest, "Guest cannot be null");
        this.room = Objects.requireNonNull(room, "Room cannot be null");
        this.checkIn = Objects.requireNonNull(checkIn, "Check-in date cannot be null");
        this.checkOut = Objects.requireNonNull(checkOut, "Check-out date cannot be null");
        
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("Check-out date must be strictly after check-in date");
        }

        this.status = Objects.requireNonNull(status, "Booking status cannot be null");
        this.cancellationReason = cancellationReason != null ? cancellationReason.trim() : "";
        this.numberOfNights = ChronoUnit.DAYS.between(checkIn, checkOut);
        
        // Accurate financial calculations with BigDecimal
        this.roomCharge = room.getPricePerNight().multiply(BigDecimal.valueOf(numberOfNights)).setScale(2, RoundingMode.HALF_UP);
        this.taxAmount = this.roomCharge.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        this.totalAmount = this.roomCharge.add(this.taxAmount).setScale(2, RoundingMode.HALF_UP);
    }

    public String getBookingId() {
        return bookingId;
    }

    public Guest getGuest() {
        return guest;
    }

    public Room getRoom() {
        return room;
    }

    public LocalDate getCheckIn() {
        return checkIn;
    }

    public LocalDate getCheckOut() {
        return checkOut;
    }

    public long getNumberOfNights() {
        return numberOfNights;
    }

    public BigDecimal getRoomCharge() {
        return roomCharge;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = Objects.requireNonNull(status, "Status cannot be null");
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason != null ? cancellationReason.trim() : "";
    }

    public String getFormattedBill() {
        StringBuilder sb = new StringBuilder();
        sb.append("================================\\n");
        sb.append("        HOTEL BILL\\n");
        sb.append("================================\\n");
        sb.append(String.format("Booking ID     : %s\\n", bookingId));
        sb.append(String.format("Guest          : %s\\n", guest.getGuestName()));
        sb.append(String.format("Guests Count   : %d (Max Cap: %d)\\n", guest.getNumberOfGuests(), room.getMaximumCapacity()));
        sb.append(String.format("Room           : %d\\n", room.getRoomNumber()));
        sb.append(String.format("Room Type      : %s\\n", room.getRoomType().getDisplayName()));
        sb.append(String.format("Status         : %s\\n", status));
        if (status == BookingStatus.CANCELLED && cancellationReason != null && !cancellationReason.isEmpty()) {
            sb.append(String.format("Cancel Reason  : %s\\n", cancellationReason));
        }
        sb.append("\\n");
        sb.append(String.format("Check-in       : %s\\n", checkIn));
        sb.append(String.format("Check-out      : %s\\n", checkOut));
        sb.append(String.format("Nights         : %d\\n", numberOfNights));
        sb.append("\\n");
        sb.append(String.format("Room charge    : ₹%,.2f\\n", roomCharge));
        sb.append(String.format("Tax (10%%)      : ₹%,.2f\\n", taxAmount));
        sb.append("--------------------------------\\n");
        sb.append(String.format("TOTAL          : ₹%,.2f\\n", totalAmount));
        sb.append("================================\\n");
        return sb.toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Booking booking = (Booking) o;
        return Objects.equals(bookingId, booking.bookingId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(bookingId);
    }

    @Override
    public String toString() {
        return String.format("%-10s | Room #%-4d (%-12s) | Guest: %-16s | %s to %s (%d nts) | Status: %-10s | Total: ₹%,.2f",
                bookingId, room.getRoomNumber(), room.getRoomType().name(), guest.getGuestName(),
                checkIn, checkOut, numberOfNights, status, totalAmount);
    }
}
`,
  },
  {
    path: 'src/main/java/com/hotel/repository/FileManager.java',
    filename: 'FileManager.java',
    category: 'repository',
    description: 'CSV persistence repository utilizing java.nio.file, BufferedReader, and safe row parsing for bookings and cancellation reasons.',
    content: `package com.hotel.repository;

import com.hotel.model.*;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class FileManager {
    private static final String DEFAULT_CSV_PATH = "data/bookings.csv";
    private static final String CSV_HEADER = "bookingId,roomNumber,roomType,guestName,phone,email,idProof,numberOfGuests,checkInDate,checkOutDate,numberOfNights,roomCharge,taxAmount,totalAmount,status,cancellationReason";

    private final Path filePath;

    public FileManager() {
        this(DEFAULT_CSV_PATH);
    }

    public FileManager(String pathStr) {
        this.filePath = Paths.get(pathStr);
        ensureFileExists();
    }

    public Path getFilePath() {
        return filePath;
    }

    public synchronized void ensureFileExists() {
        try {
            Path parent = filePath.getParent();
            if (parent != null && !Files.exists(parent)) {
                Files.createDirectories(parent);
            }
            if (!Files.exists(filePath)) {
                try (BufferedWriter writer = Files.newBufferedWriter(filePath, StandardCharsets.UTF_8,
                        StandardOpenOption.CREATE, StandardOpenOption.WRITE)) {
                    writer.write(CSV_HEADER);
                    writer.newLine();
                }
            }
        } catch (IOException e) {
            System.err.println("Error initializing CSV storage at " + filePath + ": " + e.getMessage());
        }
    }

    public synchronized void saveBooking(Booking booking) {
        ensureFileExists();
        try (BufferedWriter writer = Files.newBufferedWriter(filePath, StandardCharsets.UTF_8,
                StandardOpenOption.CREATE, StandardOpenOption.APPEND)) {
            writer.write(formatBookingToCsv(booking));
            writer.newLine();
        } catch (IOException e) {
            System.err.println("Error appending booking to CSV: " + e.getMessage());
        }
    }

    public synchronized List<Booking> loadBookings(Map<Integer, Room> roomsByNumber) {
        ensureFileExists();
        List<Booking> list = new ArrayList<>();
        if (!Files.exists(filePath)) {
            return list;
        }

        try (BufferedReader reader = Files.newBufferedReader(filePath, StandardCharsets.UTF_8)) {
            String line = reader.readLine(); // Header
            if (line == null) {
                return list;
            }

            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;
                try {
                    Booking booking = parseCsvToBooking(line, roomsByNumber);
                    if (booking != null) {
                        list.add(booking);
                    }
                } catch (Exception ex) {
                    System.err.println("Skipping malformed CSV row: " + line + " (" + ex.getMessage() + ")");
                }
            }
        } catch (IOException e) {
            System.err.println("Error reading CSV file: " + e.getMessage());
        }
        return list;
    }

    public synchronized void updateAllBookings(List<Booking> bookings) {
        ensureFileExists();
        try (BufferedWriter writer = Files.newBufferedWriter(filePath, StandardCharsets.UTF_8,
                StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE)) {
            writer.write(CSV_HEADER);
            writer.newLine();
            for (Booking b : bookings) {
                writer.write(formatBookingToCsv(b));
                writer.newLine();
            }
        } catch (IOException e) {
            System.err.println("Error syncing bookings to CSV: " + e.getMessage());
        }
    }

    private String formatBookingToCsv(Booking b) {
        Guest g = b.getGuest();
        return String.join(",",
                escapeCsv(b.getBookingId()),
                String.valueOf(b.getRoom().getRoomNumber()),
                escapeCsv(b.getRoom().getRoomType().name()),
                escapeCsv(g.getGuestName()),
                escapeCsv(g.getPhone()),
                escapeCsv(g.getEmail()),
                escapeCsv(g.getIdProof()),
                String.valueOf(g.getNumberOfGuests()),
                b.getCheckIn().toString(),
                b.getCheckOut().toString(),
                String.valueOf(b.getNumberOfNights()),
                b.getRoomCharge().toPlainString(),
                b.getTaxAmount().toPlainString(),
                b.getTotalAmount().toPlainString(),
                b.getStatus().name(),
                escapeCsv(b.getCancellationReason() != null ? b.getCancellationReason() : "")
        );
    }

    private Booking parseCsvToBooking(String line, Map<Integer, Room> roomsByNumber) {
        String[] tokens = parseCsvLine(line);
        if (tokens.length < 15) {
            return null;
        }

        String bookingId = tokens[0].trim();
        int roomNumber = Integer.parseInt(tokens[1].trim());
        RoomType roomType = RoomType.valueOf(tokens[2].trim());
        String guestName = tokens[3].trim();
        String phone = tokens[4].trim();
        String email = tokens[5].trim();
        String idProof = tokens[6].trim();
        int numGuests = Integer.parseInt(tokens[7].trim());
        LocalDate checkIn = LocalDate.parse(tokens[8].trim());
        LocalDate checkOut = LocalDate.parse(tokens[9].trim());
        BookingStatus status = BookingStatus.valueOf(tokens[14].trim());
        String cancellationReason = tokens.length >= 16 ? tokens[15].trim() : "";

        Room room = roomsByNumber.get(roomNumber);
        if (room == null) {
            room = new Room(roomNumber, roomType);
        }

        Guest guest = new Guest(guestName, phone, email, idProof, numGuests);
        return new Booking(bookingId, guest, room, checkIn, checkOut, status, cancellationReason);
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\\"") || val.contains("\\n")) {
            return "\\"" + val.replace("\\"", "\\"\\"") + "\\"";
        }
        return val;
    }

    private String[] parseCsvLine(String line) {
        List<String> list = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '\\"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '\\"') {
                    sb.append('\\"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                list.add(sb.toString());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        list.add(sb.toString());
        return list.toArray(new String[0]);
    }
}
`,
  },
  {
    path: 'src/main/java/com/hotel/service/HotelService.java',
    filename: 'HotelService.java',
    category: 'service',
    description: 'Core business service coordinating inventory, date-overlap search, booking creation, lifecycle, and room occupancy.',
    content: `package com.hotel.service;

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

        if (guest.getNumberOfGuests() > room.getMaximumCapacity()) {
            throw new IllegalArgumentException(String.format(
                    "Capacity exceeded: Room #%d (%s) allows maximum %d guest(s), but %d were requested.",
                    roomNumber, room.getRoomType().getDisplayName(), room.getMaximumCapacity(), guest.getNumberOfGuests()));
        }

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
        for (Room r : rooms.values()) {
            if (r.getStatus() != RoomStatus.MAINTENANCE) {
                r.setStatus(RoomStatus.VACANT);
            }
        }

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
`,
  },
  {
    path: 'src/main/java/com/hotel/utility/InputValidator.java',
    filename: 'InputValidator.java',
    category: 'utility',
    description: 'Input validation utility providing regex matching, date format validation, and positive integer checks.',
    content: `package com.hotel.utility;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.regex.Pattern;

public final class InputValidator {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final Pattern PHONE_PATTERN = Pattern.compile("^[+]?[0-9\\\\s\\\\-]{7,15}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

    private InputValidator() {}

    public static boolean isValidDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return false;
        }
        try {
            LocalDate.parse(dateStr.trim(), DATE_FORMATTER);
            return true;
        } catch (DateTimeParseException e) {
            return false;
        }
    }

    public static LocalDate parseDate(String dateStr) {
        if (!isValidDate(dateStr)) {
            throw new IllegalArgumentException("Invalid date format. Expected YYYY-MM-DD (e.g. 2026-09-01)");
        }
        return LocalDate.parse(dateStr.trim(), DATE_FORMATTER);
    }

    public static boolean isValidName(String name) {
        return name != null && !name.trim().isEmpty() && name.trim().length() >= 2;
    }

    public static boolean isValidPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return true;
        }
        return PHONE_PATTERN.matcher(phone.trim()).matches();
    }

    public static boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return true;
        }
        return EMAIL_PATTERN.matcher(email.trim()).matches();
    }

    public static boolean isValidPositiveInt(String str) {
        if (str == null || str.trim().isEmpty()) {
            return false;
        }
        try {
            int val = Integer.parseInt(str.trim());
            return val > 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
`,
  },
  {
    path: 'src/main/java/com/hotel/main/Main.java',
    filename: 'Main.java',
    category: 'main',
    description: 'Menu-driven Console UI application handling user interactions, input routing, and formatted bill outputs.',
    content: `package com.hotel.main;

import com.hotel.model.*;
import com.hotel.service.HotelService;
import com.hotel.utility.InputValidator;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Scanner;

public class Main {
    private static final Scanner scanner = new Scanner(System.in);
    private static final HotelService hotelService = new HotelService();

    public static void main(String[] args) {
        printWelcomeBanner();
        boolean running = true;

        while (running) {
            printMenu();
            System.out.print("Enter choice (1-9): ");
            String choice = scanner.nextLine().trim();

            switch (choice) {
                case "1":
                    handleListRooms();
                    break;
                case "2":
                    handleSearchRooms();
                    break;
                case "3":
                    handleCreateBooking();
                    break;
                case "4":
                    handleViewBooking();
                    break;
                case "5":
                    handleViewBookingHistory();
                    break;
                case "6":
                    handleCancelBooking();
                    break;
                case "7":
                    handleCheckIn();
                    break;
                case "8":
                    handleCheckOut();
                    break;
                case "9":
                    System.out.println("\\nThank you for using the Grand Horizon Hotel Management System. Goodbye!");
                    running = false;
                    break;
                default:
                    System.out.println("⚠️ Invalid choice. Please enter a number from 1 to 9.");
            }
            if (running) {
                System.out.println("\\nPress ENTER to continue...");
                scanner.nextLine();
            }
        }
    }

    private static void printWelcomeBanner() {
        System.out.println("==================================================");
        System.out.println("     GRAND HORIZON HOTEL - FRONT DESK SYSTEM      ");
        System.out.println("      Core Java OOP & Persistent File Engine      ");
        System.out.println("==================================================");
    }

    private static void printMenu() {
        System.out.println("\\n========================================");
        System.out.println("       HOTEL ROOM BOOKING SYSTEM        ");
        System.out.println("========================================");
        System.out.println("1. List All Rooms");
        System.out.println("2. Search Available Rooms");
        System.out.println("3. Create Booking");
        System.out.println("4. View Booking");
        System.out.println("5. View Booking History");
        System.out.println("6. Cancel Booking");
        System.out.println("7. Check In");
        System.out.println("8. Check Out");
        System.out.println("9. Exit");
        System.out.println("========================================");
    }

    private static void handleListRooms() {
        System.out.println("\\n--- HOTEL ROOM INVENTORY ---");
        System.out.printf("%-6s | %-16s | %-8s | %-12s | %s\\n", "Room", "Type", "Capacity", "Status", "Nightly Rate");
        System.out.println("------------------------------------------------------------------");
        List<Room> rooms = hotelService.getAllRooms();
        for (Room r : rooms) {
            System.out.printf("#%-5d | %-16s | %-8d | %-12s | ₹%,.2f\\n",
                    r.getRoomNumber(),
                    r.getRoomType().getDisplayName(),
                    r.getMaximumCapacity(),
                    r.getStatus(),
                    r.getPricePerNight());
        }
    }

    private static void handleSearchRooms() {
        System.out.println("\\n--- SEARCH AVAILABLE ROOMS ---");
        LocalDate checkIn = promptDate("Enter Check-in Date (YYYY-MM-DD): ");
        LocalDate checkOut = promptDate("Enter Check-out Date (YYYY-MM-DD): ");

        if (!checkOut.isAfter(checkIn)) {
            System.out.println("❌ Error: Check-out date must be after check-in date.");
            return;
        }

        System.out.println("Filter by Room Type:");
        System.out.println("1. Single Room (Max 1)");
        System.out.println("2. Double Room (Max 2)");
        System.out.println("3. Deluxe Room (Max 3)");
        System.out.println("4. Executive Suite (Max 4)");
        System.out.println("0. All Room Types");
        System.out.print("Select type (0-4): ");
        String typeChoice = scanner.nextLine().trim();

        RoomType selectedType = null;
        if ("1".equals(typeChoice)) selectedType = RoomType.SINGLE;
        else if ("2".equals(typeChoice)) selectedType = RoomType.DOUBLE;
        else if ("3".equals(typeChoice)) selectedType = RoomType.DELUXE;
        else if ("4".equals(typeChoice)) selectedType = RoomType.SUITE;

        List<Room> available = hotelService.searchAvailableRooms(checkIn, checkOut, selectedType);
        System.out.println("\\n--- Search Results for " + checkIn + " to " + checkOut + " ---");
        if (available.isEmpty()) {
            System.out.println("⚠️ No rooms available matching the specified criteria and dates.");
        } else {
            System.out.printf("%-6s | %-16s | %-8s | %s\\n", "Room", "Type", "Capacity", "Rate / Night");
            System.out.println("-----------------------------------------------------");
            for (Room r : available) {
                System.out.printf("#%-5d | %-16s | %-8d | ₹%,.2f\\n",
                        r.getRoomNumber(), r.getRoomType().getDisplayName(), r.getMaximumCapacity(), r.getPricePerNight());
            }
            System.out.println("Total " + available.size() + " room(s) available for booking.");
        }
    }

    private static void handleCreateBooking() {
        System.out.println("\\n--- CREATE NEW BOOKING ---");
        LocalDate checkIn = promptDate("Enter Check-in Date (YYYY-MM-DD): ");
        LocalDate checkOut = promptDate("Enter Check-out Date (YYYY-MM-DD): ");

        if (!checkOut.isAfter(checkIn)) {
            System.out.println("❌ Error: Check-out date must be strictly after check-in date.");
            return;
        }

        List<Room> available = hotelService.searchAvailableRooms(checkIn, checkOut, null);
        if (available.isEmpty()) {
            System.out.println("❌ No rooms are available in the hotel for " + checkIn + " to " + checkOut);
            return;
        }

        System.out.println("\\nAvailable Rooms for selected dates:");
        for (Room r : available) {
            System.out.printf("  • Room #%-3d (%-14s | Cap: %d | ₹%,.2f/night)\\n",
                    r.getRoomNumber(), r.getRoomType().getDisplayName(), r.getMaximumCapacity(), r.getPricePerNight());
        }

        int roomNumber = promptPositiveInt("Enter chosen Room Number: ");
        Optional<Room> optRoom = hotelService.getRoom(roomNumber);
        if (optRoom.isEmpty()) {
            System.out.println("❌ Room #" + roomNumber + " does not exist.");
            return;
        }

        Room room = optRoom.get();
        if (!hotelService.isRoomAvailable(roomNumber, checkIn, checkOut)) {
            System.out.println("❌ Room #" + roomNumber + " is already booked for these dates (Date Overlap Detected).");
            return;
        }

        String guestName = promptNonEmptyString("Enter Guest Full Name: ");
        String phone = promptString("Enter Contact Phone: ");
        String email = promptString("Enter Email Address (optional): ");
        String idProof = promptString("Enter ID / Passport Number (optional): ");
        int numGuests = promptPositiveInt("Enter Number of Guests (Max " + room.getMaximumCapacity() + "): ");

        if (numGuests > room.getMaximumCapacity()) {
            System.out.printf("❌ Booking rejected: Room #%d maximum capacity is %d, but %d guests were requested.\\n",
                    roomNumber, room.getMaximumCapacity(), numGuests);
            return;
        }

        try {
            Guest guest = new Guest(guestName, phone, email, idProof, numGuests);
            Booking booking = hotelService.createBooking(roomNumber, guest, checkIn, checkOut);
            System.out.println("\\n✅ BOOKING CONFIRMED & SAVED TO CSV!");
            System.out.println(booking.getFormattedBill());
        } catch (Exception e) {
            System.out.println("❌ Booking failed: " + e.getMessage());
        }
    }

    private static void handleViewBooking() {
        System.out.print("\\nEnter Booking ID to view (e.g. BK-1001): ");
        String id = scanner.nextLine().trim();
        Optional<Booking> opt = hotelService.getBooking(id);
        if (opt.isEmpty()) {
            System.out.println("❌ No booking record found with ID: " + id);
            return;
        }
        Booking b = opt.get();
        System.out.println("\\n" + b.getFormattedBill());
    }

    private static void handleViewBookingHistory() {
        System.out.println("\\n--- COMPLETE BOOKING HISTORY (data/bookings.csv) ---");
        List<Booking> bookings = hotelService.getAllBookings();
        if (bookings.isEmpty()) {
            System.out.println("No booking records found.");
            return;
        }

        System.out.printf("%-9s | %-6s | %-16s | %-10s | %-10s | %-5s | %-10s | %s\\n",
                "Booking ID", "Room", "Guest", "Check-In", "Check-Out", "Nts", "Status", "Total Amount");
        System.out.println("------------------------------------------------------------------------------------------------");
        for (Booking b : bookings) {
            System.out.printf("%-9s | #%-5d | %-16s | %-10s | %-10s | %-5d | %-10s | ₹%,.2f\\n",
                    b.getBookingId(),
                    b.getRoom().getRoomNumber(),
                    truncate(b.getGuest().getGuestName(), 16),
                    b.getCheckIn(),
                    b.getCheckOut(),
                    b.getNumberOfNights(),
                    b.getStatus(),
                    b.getTotalAmount());
        }
    }

    private static void handleCancelBooking() {
        System.out.print("\\nEnter Booking ID to cancel: ");
        String id = scanner.nextLine().trim();
        System.out.print("Enter Cancellation Reason: ");
        String reason = scanner.nextLine().trim();

        try {
            hotelService.cancelBooking(id, reason.isEmpty() ? "Guest request" : reason);
            System.out.println("✅ Booking " + id + " has been successfully CANCELLED.");
        } catch (Exception e) {
            System.out.println("❌ Cancellation error: " + e.getMessage());
        }
    }

    private static void handleCheckIn() {
        System.out.print("\\nEnter Booking ID for Check-In: ");
        String id = scanner.nextLine().trim();
        try {
            Booking b = hotelService.checkIn(id);
            System.out.println("✅ Check-in successful!");
            System.out.println("Guest " + b.getGuest().getGuestName() + " checked into Room #" + b.getRoom().getRoomNumber());
            System.out.println("Room status updated to OCCUPIED.");
        } catch (Exception e) {
            System.out.println("❌ Check-in failed: " + e.getMessage());
        }
    }

    private static void handleCheckOut() {
        System.out.print("\\nEnter Booking ID for Check-Out: ");
        String id = scanner.nextLine().trim();
        try {
            Booking b = hotelService.checkOut(id);
            System.out.println("✅ Check-out successful!");
            System.out.println("Room #" + b.getRoom().getRoomNumber() + " is now VACANT.");
            System.out.println("\\n" + b.getFormattedBill());
        } catch (Exception e) {
            System.out.println("❌ Check-out failed: " + e.getMessage());
        }
    }

    private static LocalDate promptDate(String prompt) {
        while (true) {
            System.out.print(prompt);
            String input = scanner.nextLine().trim();
            if (InputValidator.isValidDate(input)) {
                return InputValidator.parseDate(input);
            }
            System.out.println("⚠️ Invalid date format. Please use YYYY-MM-DD (e.g. 2026-09-01).");
        }
    }

    private static int promptPositiveInt(String prompt) {
        while (true) {
            System.out.print(prompt);
            String input = scanner.nextLine().trim();
            if (InputValidator.isValidPositiveInt(input)) {
                return Integer.parseInt(input);
            }
            System.out.println("⚠️ Please enter a valid positive whole number.");
        }
    }

    private static String promptNonEmptyString(String prompt) {
        while (true) {
            System.out.print(prompt);
            String input = scanner.nextLine().trim();
            if (!input.isEmpty()) {
                return input;
            }
            System.out.println("⚠️ Input cannot be blank.");
        }
    }

    private static String promptString(String prompt) {
        System.out.print(prompt);
        return scanner.nextLine().trim();
    }

    private static String truncate(String val, int maxLen) {
        if (val == null) return "";
        if (val.length() <= maxLen) return val;
        return val.substring(0, maxLen - 1) + "…";
    }
}
`,
  },
  {
    path: 'src/test/java/com/hotel/HotelServiceTest.java',
    filename: 'HotelServiceTest.java',
    category: 'test',
    description: '10-Point JUnit 5 test suite verifying date overlap, max capacity, state machine transitions, and CSV persistence.',
    content: `package com.hotel;

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
`,
  },
  {
    path: 'pom.xml',
    filename: 'pom.xml',
    category: 'config',
    description: 'Maven Project Object Model build definition for Java 17, exec:java plugin, and JUnit 5.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.hotel</groupId>
    <artifactId>hotel-room-booking-system</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>Hotel Room Booking System</name>
    <description>Core Java OOP Hotel Room Booking &amp; Front Desk Property Management System</description>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <junit.jupiter.version>5.10.2</junit.jupiter.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>\${junit.jupiter.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>17</source>
                    <target>17</target>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>exec-maven-plugin</artifactId>
                <version>3.1.1</version>
                <configuration>
                    <mainClass>com.hotel.main.Main</mainClass>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.2.5</version>
            </plugin>
        </plugins>
    </build>
</project>
`,
  },
  {
    path: 'README.md',
    filename: 'README.md',
    category: 'doc',
    description: 'Comprehensive project documentation, OOP architecture breakdown, and CLI usage guide.',
    content: `# Hotel Room Booking & Front Desk System
> **Core Java (OOP, Collections, java.nio File Handling, BigDecimal) Console Application & Interactive Web Simulator**

## 🌐 Live Interactive Demo
🔗 [Launch Grand Horizon PMS & Java Simulator (Live Demo)](https://ais-pre-t3bpqaui5n27ncu5azaom3-50948685477.asia-southeast1.run.app)

Check full details in the repository README.md.
`,
  },
];

export const INTERVIEW_QUESTIONS = [
  {
    id: 1,
    question: 'Explain your project architecture and how packages are structured.',
    answer:
      "The application is architected with a strict layered domain structure following Separation of Concerns: 1. 'model' contains entities and enums (Room, Guest, Booking, RoomType, RoomStatus, BookingStatus) with encapsulated fields and BigDecimal financial methods; 2. 'repository' contains FileManager managing java.nio.file CSV persistence; 3. 'service' contains HotelService coordinating room inventory, De Morgan's date-overlap algorithm, and state machine transitions; 4. 'utility' provides regex and date sanitization via InputValidator; and 5. 'main' provides a menu-driven CLI in Main.java.",
    tags: ['Architecture', 'Layered Design', 'OOP'],
  },
  {
    id: 2,
    question: 'How do you prevent double-booking of a room across arbitrary date ranges?',
    answer:
      "Two date ranges [startA, endA) and [startB, endB) overlap if and only if: (startA < endB) AND (startB < endA). Before confirming or displaying a room as available, the service iterates over active (RESERVED or IN_HOUSE) bookings for that room and verifies this condition. Back-to-back adjacent bookings (where check-out of Booking 1 matches check-in of Booking 2) evaluate to false, correctly allowing same-day room turnaround.",
    tags: ['Algorithms', 'Business Logic', 'Date Math'],
    codeSnippet: `public synchronized boolean isRoomAvailable(int roomNumber, LocalDate checkIn, LocalDate checkOut) {
    for (Booking b : bookings) {
        if (b.getRoom().getRoomNumber() == roomNumber) {
            if (b.getStatus() == BookingStatus.RESERVED || b.getStatus() == BookingStatus.IN_HOUSE) {
                if (checkIn.isBefore(b.getCheckOut()) && b.getCheckIn().isBefore(checkOut)) {
                    return false; // Overlap collision detected
                }
            }
        }
    }
    return true;
}`,
  },
  {
    id: 3,
    question: 'Why did you use BigDecimal instead of double/float for money and billing?',
    answer:
      "Java's primitive 'double' and 'float' use IEEE 754 binary floating-point representation. They cannot accurately represent base-10 decimal fractions like 0.10, which leads to cumulative precision errors (e.g., 0.1 + 0.2 = 0.30000000000000004). In enterprise hospitality systems, rounding errors cause accounting discrepancies and tax compliance failures. Using BigDecimal with explicit scale and RoundingMode.HALF_UP guarantees penny-accurate financial totals.",
    tags: ['Financial Math', 'Precision', 'Core Java'],
    codeSnippet: `this.roomCharge = room.getPricePerNight().multiply(BigDecimal.valueOf(numberOfNights)).setScale(2, RoundingMode.HALF_UP);
this.taxAmount = this.roomCharge.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
this.totalAmount = this.roomCharge.add(this.taxAmount).setScale(2, RoundingMode.HALF_UP);`,
  },
  {
    id: 4,
    question: 'How does the booking state machine lifecycle work?',
    answer:
      "A booking follows a non-reversible state machine: RESERVED -> IN_HOUSE -> COMPLETED (or CANCELLED). Only RESERVED bookings can be checked in or cancelled. An IN_HOUSE guest cannot cancel their stay; they must check out. Once COMPLETED or CANCELLED, the booking record is sealed in history and cannot be mutated.",
    tags: ['State Machine', 'Business Invariants', 'Security'],
  },
  {
    id: 5,
    question: 'How is persistence handled without a database?',
    answer:
      "Persistence is handled via java.nio.file (Files, Path, Paths, StandardOpenOption, BufferedReader/BufferedWriter) to 'data/bookings.csv'. When bookings are created or transitioned, records are serialized to CSV with quotation escaping. On startup, FileManager parses the file, reconstructs the Booking objects, and recalculates live room occupancy.",
    tags: ['Persistence', 'File I/O', 'NIO'],
  },
  {
    id: 6,
    question: 'How do you handle guest capacity limits?',
    answer:
      "Each RoomType defines a maximum capacity (Single: 1, Double: 2, Deluxe: 3, Suite: 4). During booking creation, Guest.getNumberOfGuests() is validated against Room.getMaximumCapacity(). If exceeded, an IllegalArgumentException is thrown, preventing over-occupancy violations.",
    tags: ['Validation', 'Domain Rules'],
  },
  {
    id: 7,
    question: 'Why are enums used for RoomType and BookingStatus?',
    answer:
      "Enums guarantee compile-time type safety against typos and invalid states. In Java, enums are full classes, allowing us to attach domain behavior, nightly rate (BigDecimal), max capacity, and display names directly to RoomType without fragile switch statements.",
    tags: ['Enums', 'Type Safety', 'OOP'],
  },
  {
    id: 8,
    question: 'How would you scale this to a multi-threaded enterprise architecture?',
    answer:
      "1. Synchronized service methods or ReentrantReadWriteLock for thread-safe in-memory collections; 2. Replace CSV with a relational database (PostgreSQL) using JPA/Hibernate with pessimistic row locks during reservation to prevent race conditions; 3. Expose Spring Boot REST APIs; 4. Add Spring Security with JWT authentication for Front Desk vs. Admin roles.",
    tags: ['Scalability', 'System Design', 'Concurrency'],
  },
  {
    id: 9,
    question: 'How do you ensure test coverage for all boundary conditions?',
    answer:
      "We wrote an automated 10-scenario JUnit 5 test suite verifying: valid creation, date-overlap double booking rejection, adjacent same-day checkin/checkout acceptance, invalid date orders, capacity violations, cancellation guards, check-in room status transitions, check-out bill finalization, and persistence round-trip.",
    tags: ['Testing', 'QA', 'JUnit 5'],
  },
  {
    id: 10,
    question: 'What is the advantage of pairing a Java Core with a React Simulator?',
    answer:
      "The Java application acts as the authoritative backend domain logic and CLI source of truth. The React Web Simulator provides an interactive property management visual interface, date-range calendar matrix, interactive terminal emulator, and 10-point test runner, making it ideal for demonstrations, QA verification, and technical interviews.",
    tags: ['Full Stack', 'Demo', 'Architecture'],
  },
];
