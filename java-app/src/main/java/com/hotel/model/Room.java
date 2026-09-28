package com.hotel.model;

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
