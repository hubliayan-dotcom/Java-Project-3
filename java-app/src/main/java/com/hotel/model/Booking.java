package com.hotel.model;

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
        sb.append("================================\n");
        sb.append("        HOTEL BILL\n");
        sb.append("================================\n");
        sb.append(String.format("Booking ID     : %s\n", bookingId));
        sb.append(String.format("Guest          : %s\n", guest.getGuestName()));
        sb.append(String.format("Guests Count   : %d (Max Cap: %d)\n", guest.getNumberOfGuests(), room.getMaximumCapacity()));
        sb.append(String.format("Room           : %d\n", room.getRoomNumber()));
        sb.append(String.format("Room Type      : %s\n", room.getRoomType().getDisplayName()));
        sb.append(String.format("Status         : %s\n", status));
        if (status == BookingStatus.CANCELLED && cancellationReason != null && !cancellationReason.isEmpty()) {
            sb.append(String.format("Cancel Reason  : %s\n", cancellationReason));
        }
        sb.append("\n");
        sb.append(String.format("Check-in       : %s\n", checkIn));
        sb.append(String.format("Check-out      : %s\n", checkOut));
        sb.append(String.format("Nights         : %d\n", numberOfNights));
        sb.append("\n");
        sb.append(String.format("Room charge    : ₹%,.2f\n", roomCharge));
        sb.append(String.format("Tax (10%%)      : ₹%,.2f\n", taxAmount));
        sb.append("--------------------------------\n");
        sb.append(String.format("TOTAL          : ₹%,.2f\n", totalAmount));
        sb.append("================================\n");
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
