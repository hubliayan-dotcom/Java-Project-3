package com.hotel.main;

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
                    System.out.println("\nThank you for using the Grand Horizon Hotel Management System. Goodbye!");
                    running = false;
                    break;
                default:
                    System.out.println("⚠️ Invalid choice. Please enter a number from 1 to 9.");
            }
            if (running) {
                System.out.println("\nPress ENTER to continue...");
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
        System.out.println("\n========================================");
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
        System.out.println("\n--- HOTEL ROOM INVENTORY ---");
        System.out.printf("%-6s | %-16s | %-8s | %-12s | %s\n", "Room", "Type", "Capacity", "Status", "Nightly Rate");
        System.out.println("------------------------------------------------------------------");
        List<Room> rooms = hotelService.getAllRooms();
        for (Room r : rooms) {
            System.out.printf("#%-5d | %-16s | %-8d | %-12s | ₹%,.2f\n",
                    r.getRoomNumber(),
                    r.getRoomType().getDisplayName(),
                    r.getMaximumCapacity(),
                    r.getStatus(),
                    r.getPricePerNight());
        }
    }

    private static void handleSearchRooms() {
        System.out.println("\n--- SEARCH AVAILABLE ROOMS ---");
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
        System.out.println("\n--- Search Results for " + checkIn + " to " + checkOut + " ---");
        if (available.isEmpty()) {
            System.out.println("⚠️ No rooms available matching the specified criteria and dates.");
        } else {
            System.out.printf("%-6s | %-16s | %-8s | %s\n", "Room", "Type", "Capacity", "Rate / Night");
            System.out.println("-----------------------------------------------------");
            for (Room r : available) {
                System.out.printf("#%-5d | %-16s | %-8d | ₹%,.2f\n",
                        r.getRoomNumber(), r.getRoomType().getDisplayName(), r.getMaximumCapacity(), r.getPricePerNight());
            }
            System.out.println("Total " + available.size() + " room(s) available for booking.");
        }
    }

    private static void handleCreateBooking() {
        System.out.println("\n--- CREATE NEW BOOKING ---");
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

        System.out.println("\nAvailable Rooms for selected dates:");
        for (Room r : available) {
            System.out.printf("  • Room #%-3d (%-14s | Cap: %d | ₹%,.2f/night)\n",
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
            System.out.printf("❌ Booking rejected: Room #%d maximum capacity is %d, but %d guests were requested.\n",
                    roomNumber, room.getMaximumCapacity(), numGuests);
            return;
        }

        try {
            Guest guest = new Guest(guestName, phone, email, idProof, numGuests);
            Booking booking = hotelService.createBooking(roomNumber, guest, checkIn, checkOut);
            System.out.println("\n✅ BOOKING CONFIRMED & SAVED TO CSV!");
            System.out.println(booking.getFormattedBill());
        } catch (Exception e) {
            System.out.println("❌ Booking failed: " + e.getMessage());
        }
    }

    private static void handleViewBooking() {
        System.out.print("\nEnter Booking ID to view (e.g. BK-1001): ");
        String id = scanner.nextLine().trim();
        Optional<Booking> opt = hotelService.getBooking(id);
        if (opt.isEmpty()) {
            System.out.println("❌ No booking record found with ID: " + id);
            return;
        }
        Booking b = opt.get();
        System.out.println("\n" + b.getFormattedBill());
    }

    private static void handleViewBookingHistory() {
        System.out.println("\n--- COMPLETE BOOKING HISTORY (data/bookings.csv) ---");
        List<Booking> bookings = hotelService.getAllBookings();
        if (bookings.isEmpty()) {
            System.out.println("No booking records found.");
            return;
        }

        System.out.printf("%-9s | %-6s | %-16s | %-10s | %-10s | %-5s | %-10s | %s\n",
                "Booking ID", "Room", "Guest", "Check-In", "Check-Out", "Nts", "Status", "Total Amount");
        System.out.println("------------------------------------------------------------------------------------------------");
        for (Booking b : bookings) {
            System.out.printf("%-9s | #%-5d | %-16s | %-10s | %-10s | %-5d | %-10s | ₹%,.2f\n",
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
        System.out.print("\nEnter Booking ID to cancel: ");
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
        System.out.print("\nEnter Booking ID for Check-In: ");
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
        System.out.print("\nEnter Booking ID for Check-Out: ");
        String id = scanner.nextLine().trim();
        try {
            Booking b = hotelService.checkOut(id);
            System.out.println("✅ Check-out successful!");
            System.out.println("Room #" + b.getRoom().getRoomNumber() + " is now VACANT.");
            System.out.println("\n" + b.getFormattedBill());
        } catch (Exception e) {
            System.out.println("❌ Check-out failed: " + e.getMessage());
        }
    }

    // Helper input prompts with looping validation
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
