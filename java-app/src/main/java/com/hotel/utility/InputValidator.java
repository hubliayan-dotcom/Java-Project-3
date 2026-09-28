package com.hotel.utility;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.regex.Pattern;

public final class InputValidator {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final Pattern PHONE_PATTERN = Pattern.compile("^[+]?[0-9\\s\\-]{7,15}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

    private InputValidator() {
        // Utility class
    }

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
            return true; // Optional field
        }
        return PHONE_PATTERN.matcher(phone.trim()).matches();
    }

    public static boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return true; // Optional field
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
