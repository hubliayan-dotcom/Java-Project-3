package com.hotel.repository;

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
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }

    private String[] parseCsvLine(String line) {
        List<String> list = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '\"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '\"') {
                    sb.append('\"');
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
