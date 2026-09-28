package com.hotel.model;

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
