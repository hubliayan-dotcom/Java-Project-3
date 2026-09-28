package com.hotel.model;

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
