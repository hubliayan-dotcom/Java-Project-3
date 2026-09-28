# Hotel Room Booking & Front Desk System
> **Core Java (OOP, Collections, java.nio File Handling, BigDecimal) Console Application & Interactive Web Simulator**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Interactive%20PMS%20Simulator-0284c7?style=for-the-badge&logo=google-chrome&logoColor=white)](https://ais-pre-t3bpqaui5n27ncu5azaom3-50948685477.asia-southeast1.run.app)
[![Java 17+](https://img.shields.io/badge/Java-17%2B-orange?style=for-the-badge&logo=openjdk&logoColor=white)](java-app/)
[![JUnit 5](https://img.shields.io/badge/JUnit-5%20Test%20Suite-25a162?style=for-the-badge&logo=junit5&logoColor=white)](java-app/src/test/java/com/hotel/HotelServiceTest.java)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## 🌐 Live Interactive Demo

🚀 **Explore the live interactive web simulator and PMS interface:**  
🔗 **[Launch Grand Horizon PMS & Java Emulator (Live Demo)](https://ais-pre-t3bpqaui5n27ncu5azaom3-50948685477.asia-southeast1.run.app)**

> **Live Demo Features:**
> - **Interactive Front Desk Dashboard**: Manage real-time room inventory, check-ins, check-outs, and folio billing.
> - **In-Browser Java CLI Emulator**: Execute menu actions (`1-7`) directly in an authentic terminal interface.
> - **Interactive 10-Point QA Test Runner**: Run automated edge-case scenarios (double booking collisions, capacity guards, CSV reload) with real-time pass/fail telemetry.
> - **Tax Invoice & Folio Generator**: Print or download customized official PDF & HTML invoices.
> - **Java Code Explorer & Source ZIP Download**: Inspect and download the entire Maven Java project source code directly in the browser.

---

## 1. Project Overview & Problem Statement

Modern hospitality management requires robust room reservation engines that prevent costly operational hazards such as **double-booking conflicts**, **currency rounding discrepancies**, and **invalid state transitions** (such as checking out a guest who has not checked in or cancelling a completed stay).

The **Grand Horizon Hotel Room Booking System** is a portfolio-ready, industry-oriented Core Java application built with strict **Object-Oriented Programming (OOP)** principles, layered domain separation, accurate interval overlap mathematics, financial decimal precision via `BigDecimal`, and durable CSV file persistence.

The project is delivered as a dual-tier solution:
1. **Core Java Console Application (`java-app/`)**: The authoritative, industry-oriented Java application with full OOP architecture, validation guards, cancellation reason tracking, and persistent CSV storage.
2. **Interactive Web Simulator (`src/`)**: A modern TypeScript/React visual simulator and test harness that models the front-desk Property Management System (PMS), date-range timeline matrix, interactive CLI emulator, and live 10-point automated QA test suite.

---

## 2. Industry Relevance & Real-World Value

In real-world hotel reservation and property management systems (PMS):
- **Date Overlap Mathematics**: Booking collisions cost hotels compensation and customer trust.
- **Financial Precision**: Using IEEE 754 floating-point numbers (`double` / `float`) for billing introduces rounding errors in tax and billing aggregation. Financial systems mandate arbitrary-precision fixed-point arithmetic (`BigDecimal` with `RoundingMode.HALF_UP`).
- **State Machine Invariants**: A reservation follows an explicit lifecycle (`RESERVED` → `IN_HOUSE` → `COMPLETED` or `CANCELLED`). Enforcing non-revertible transitions prevents accidental state corruption.
- **Durable File Persistence**: Storing operational transactions and complete booking history in standard tabular CSV files (`data/bookings.csv`) ensures persistence across application restarts without requiring external database setup.

---

## 3. Core Java & OOP Concepts Implemented

| OOP Concept / Java API | Concrete Implementation in Project |
| :--- | :--- |
| **Encapsulation** | Private instance variables in `Room`, `Guest`, and `Booking` with validated getters and domain mutators. |
| **Type-Safe Enums** | `RoomType` (with encapsulated pricing and capacity), `RoomStatus` (`VACANT`, `OCCUPIED`, `MAINTENANCE`), `BookingStatus` (`RESERVED`, `IN_HOUSE`, `COMPLETED`, `CANCELLED`). |
| **Layered Architecture** | Strict separation of concerns across `model`, `repository`, `service`, `utility`, and `main` packages. |
| **Monetary Accuracy (`BigDecimal`)** | Room charges, 10% Goods & Services Tax (GST), and total billing computed using `BigDecimal` and `RoundingMode.HALF_UP`. |
| **Date & Time API (`java.time`)** | `LocalDate` and `ChronoUnit.DAYS` for date interval parsing, duration calculation, and non-overlapping interval comparisons. |
| **Non-Overlapping Interval Math** | De Morgan's interval overlap algorithm: `startA < endB && startB < endA` strictly preventing booking collisions while allowing adjacent same-day check-in. |
| **File I/O & Persistence (`java.nio.file`)** | `Files`, `Path`, `BufferedReader`, and `BufferedWriter` to read/write `data/bookings.csv` (including cancellation reasons) with safe quote/comma escaping and startup auto-recovery. |
| **Booking History Reload** | All historic bookings are loaded from `data/bookings.csv` upon application startup, preserving history and sequence IDs. |
| **Input Sanitization & Validation** | `InputValidator` utility performing regex phone/email checks, date formatting, and capacity threshold verification. |
| **Automated Testing** | 10-point JUnit 5 test suite verifying date overlap, reverse check-outs, capacity limits, lifecycle transitions, cancellation reasons, and persistence reload. |

---

## 4. Architecture & Layered Folder Structure

```
hotel-room-booking-system/
│
├── java-app/                                   # Real Core Java Project
│   ├── pom.xml                                 # Maven Build Configuration
│   ├── run.sh                                  # Linux/macOS Compilation & Execution Script
│   ├── run.bat                                 # Windows CMD Execution Script
│   ├── data/
│   │   └── bookings.csv                        # Persistent CSV Storage File (History & Active Bookings)
│   └── src/
│       ├── main/java/com/hotel/
│       │   ├── model/
│       │   │   ├── RoomType.java               # Enum: SINGLE, DOUBLE, DELUXE, SUITE + Pricing/Cap
│       │   │   ├── RoomStatus.java             # Enum: VACANT, OCCUPIED, MAINTENANCE
│       │   │   ├── BookingStatus.java          # Enum: RESERVED, IN_HOUSE, COMPLETED, CANCELLED
│       │   │   ├── Room.java                   # Room Entity (number, type, status, capacity)
│       │   │   ├── Guest.java                  # Guest Value Object (name, phone, email, id, count)
│       │   │   └── Booking.java                # Booking Aggregate with BigDecimal billing & cancellationReason
│       │   ├── repository/
│       │   │   └── FileManager.java            # java.nio CSV persistence engine
│       │   ├── service/
│       │   │   └── HotelService.java           # Business logic, overlap checks, lifecycle guards
│       │   ├── utility/
│       │   │   └── InputValidator.java         # Date, string, and integer sanitizers
│       │   └── main/
│       │       └── Main.java                   # Menu-driven Console CLI Application
│       └── test/java/com/hotel/
│           └── HotelServiceTest.java           # 10-Point JUnit 5 Test Matrix
│
├── src/                                        # Interactive Web Simulator (React + TypeScript)
│   ├── components/                             # PMS Dashboard, Terminal, Test Runner, Flashcards
│   ├── services/                               # Ported TypeScript Hotel Engine & Test Runner
│   ├── types/                                  # Domain interfaces
│   └── App.tsx                                 # Main Simulator Layout
└── README.md                                   # Project Documentation
```

---

## 5. Room Inventory & Capacity Matrix

| Room Type | Room Numbers | Nightly Rate (₹) | Max Guest Capacity | Features & Bedding |
| :--- | :--- | :--- | :--- | :--- |
| **SINGLE** | 101, 102 | ₹2,000.00 | 1 Guest | 1 Single Bed, Wi-Fi, Work Desk, En-suite |
| **DOUBLE** | 103, 104, 201, 202 | ₹3,000.00 | 2 Guests | 1 Queen Bed, Coffee Maker, Air Conditioning |
| **DELUXE** | 203, 204, 301, 302 | ₹4,500.00 | 3 Guests | 1 King Bed + Sofa, Balcony, Mini Bar |
| **SUITE** | 303, 304, 401–404 | ₹6,000.00 | 4 Guests | Master Suite + Living Lounge, Jacuzzi |

---

## 6. Key Business Logic & Features

### 6.1. Date Interval Overlap Detection Algorithm
A requested reservation $A = [\text{checkIn}_A, \text{checkOut}_A)$ conflicts with an existing active booking $B = [\text{checkIn}_B, \text{checkOut}_B)$ on the same room if and only if:
$$\text{checkIn}_A < \text{checkOut}_B \quad \land \quad \text{checkIn}_B < \text{checkOut}_A$$
- **Adjacent Stays Allowed**: If Guest 1 checks out on `2026-09-05` and Guest 2 checks in on `2026-09-05`, the condition evaluates to `false`, correctly allowing back-to-back stays on the same date.
- **Cancelled/Completed Bookings Ignored**: Bookings with status `CANCELLED` or `COMPLETED` do not block room availability.

### 6.2. Maximum Guest Limit Validation
During booking creation, the system validates the requested guest count against `Room.getMaximumCapacity()`:
```java
if (guest.getNumberOfGuests() > room.getMaximumCapacity()) {
    throw new IllegalArgumentException(String.format(
        "Capacity exceeded: Room #%d (%s) allows maximum %d guest(s), but %d were requested.",
        roomNumber, room.getRoomType().getDisplayName(), room.getMaximumCapacity(), guest.getNumberOfGuests()));
}
```

### 6.3. Booking State Machine Lifecycle & Cancellation Tracking
```
                 ┌──────────────┐
                 │   RESERVED   │
                 └──────┬───────┘
                        │
         ┌──────────────┴──────────────┐
         │ Check-In                    │ Cancel (with Reason)
         ▼                             ▼
  ┌──────────────┐              ┌──────────────┐
  │   IN_HOUSE   │              │  CANCELLED   │
  └──────┬───────┘              └──────────────┘
         │ Check-Out
         ▼
  ┌──────────────┐
  │  COMPLETED   │
  └──────────────┘
```
**Strict Lifecycle Rules**:
- `RESERVED` $\rightarrow$ `IN_HOUSE` (Valid: Room becomes `OCCUPIED`)
- `IN_HOUSE` $\rightarrow$ `COMPLETED` (Valid: Room returns to `VACANT`)
- `RESERVED` $\rightarrow$ `CANCELLED` (Valid: Captures `cancellationReason` in `Booking` and `data/bookings.csv`, freeing room dates)
- `IN_HOUSE` $\rightarrow$ `CANCELLED` (❌ Illegal: In-house guest cannot cancel stay)
- `COMPLETED` $\rightarrow$ `CANCELLED` (❌ Illegal: Historic settled stay cannot be cancelled)

### 6.4. Persistent Booking History
Booking history is persisted to `data/bookings.csv` and reloaded when the application starts. Every reservation record—whether `RESERVED`, `IN_HOUSE`, `COMPLETED`, or `CANCELLED` (including the recorded cancellation reason)—remains preserved across application sessions.

---

## 7. How to Run the Java Application

### Prerequisites
- **Java SE Development Kit (JDK) 17 or higher** (`javac -version`, `java -version`)
- *(Optional)* **Apache Maven 3.8+** (`mvn -v`)

### Option A: Using Maven (Recommended)
```bash
cd java-app

# 1. Compile and run the CLI Application
mvn clean compile exec:java

# 2. Run all 10 automated unit & integration tests
mvn test

# 3. Package as executable standalone JAR
mvn package
java -jar target/hotel-room-booking-system-1.0.0.jar
```

### Option B: Using Direct Java Compiler (`javac`)
#### On Linux / macOS:
```bash
cd java-app
chmod +x run.sh
./run.sh
```
Or manually:
```bash
cd java-app
mkdir -p bin
javac -d bin -sourcepath src/main/java src/main/java/com/hotel/main/Main.java
java -cp bin com.hotel.main.Main
```

#### On Windows (Command Prompt / PowerShell):
```cmd
cd java-app
run.bat
```
Or manually:
```cmd
cd java-app
if not exist bin mkdir bin
dir /s /b src\main\java\*.java > sources.txt
javac -d bin -sourcepath src\main\java @sources.txt
del sources.txt
java -cp bin com.hotel.main.Main
```

---

## 8. Sample CLI Menu & Output Traces

### Main Menu
```text
========================================
       HOTEL ROOM BOOKING SYSTEM        
========================================
1. List All Rooms
2. Search Available Rooms
3. Create Booking
4. View Booking
5. View Booking History
6. Cancel Booking
7. Check In
8. Check Out
9. Exit
========================================
Enter choice (1-9): 3
```

### Sample Booking Creation & Itemized Bill Output
```text
--- CREATE NEW BOOKING ---
Enter Check-in Date (YYYY-MM-DD): 2026-09-01
Enter Check-out Date (YYYY-MM-DD): 2026-09-04
Enter chosen Room Number: 203
Enter Guest Full Name: John Doe
Enter Contact Phone: +1 555-0199
Enter Email Address (optional): john.doe@example.com
Enter ID / Passport Number (optional): PASSPORT-A9921
Enter Number of Guests (Max 3): 2

✅ BOOKING CONFIRMED & SAVED TO CSV!
================================
        HOTEL BILL
================================
Booking ID     : BK-1004
Guest          : John Doe
Guests Count   : 2 (Max Cap: 3)
Room           : 203
Room Type      : Deluxe Room
Status         : RESERVED

Check-in       : 2026-09-01
Check-out      : 2026-09-04
Nights         : 3

Room charge    : ₹13,500.00
Tax (10%)      : ₹1,350.00
--------------------------------
TOTAL          : ₹14,850.00
================================
```

---

## 9. 10-Point QA Test Matrix

| # | Test Scenario | Input / Action | Expected Result | Status |
| :-: | :--- | :--- | :--- | :---: |
| **1** | **Valid Booking Creation** | Room 101, 3 nights, 1 guest | Booking created with exact 10% tax and `BigDecimal` billing | ✅ PASS |
| **2** | **Date Overlap Double-Booking** | Book Room 101 on overlapping dates | Rejected with `IllegalStateException` | ✅ PASS |
| **3** | **Adjacent Back-to-Back Stays** | Guest 2 check-in = Guest 1 check-out | Approved without collision | ✅ PASS |
| **4** | **Reverse Check-Out Date** | Check-out $\le$ Check-in | Rejected with `IllegalArgumentException` | ✅ PASS |
| **5** | **Guest Capacity Overflow** | 3 guests in Single Room (Cap: 1) | Rejected with descriptive capacity violation | ✅ PASS |
| **6** | **Cancel Reserved Booking** | Cancel `BK-1002` with reason | Status $\rightarrow$ `CANCELLED`; reason stored; room dates freed | ✅ PASS |
| **7** | **Illegal Cancellation Guard** | Cancel `IN_HOUSE` or `COMPLETED` | Blocked by state machine invariant | ✅ PASS |
| **8** | **Guest Check-In** | Check-in `BK-1001` (RESERVED) | Status $\rightarrow$ `IN_HOUSE`; Room $\rightarrow$ `OCCUPIED` | ✅ PASS |
| **9** | **Guest Check-Out** | Check-out `BK-1001` (IN_HOUSE) | Status $\rightarrow$ `COMPLETED`; Room $\rightarrow$ `VACANT` | ✅ PASS |
| **10** | **CSV Persistence Reload** | Restart JVM and read `bookings.csv` | All bookings restored identically including cancellation reasons | ✅ PASS |

---

## 10. Limitations & Future Roadmap

- **Current Architecture**:
  - Single-node file-based concurrency (tailored for portfolio demonstration, learning OOP, and single-desk front operations).
  - Terminal-based interactive scanner input loop.
- **Future Improvements**:
  - Integrate Spring Boot RESTful API endpoints with PostgreSQL / JPA repository layer.
  - Multi-tier dynamic seasonal pricing rules (weekend multipliers, corporate promo codes).
  - Automated email/SMS notification integration via SendGrid/Twilio.

---

## 11. Key Learning Outcomes

1. **Domain-Driven Design (DDD)**: Translating real-world hospitality workflows into cohesive domain models and value objects.
2. **Defensive Programming**: Preventing runtime faults through comprehensive input validation and exception hierarchies.
3. **Data Integrity**: Guaranteeing consistent records via atomic `java.nio` file writes and reproducible state transitions.
4. **Clean Code & Design Patterns**: Applying Separation of Concerns (SoC) across Model, View (Main), Service, and Repository layers.

---

## 12. Author & License

- **Project**: Grand Horizon Hotel Room Booking & Front Desk Management System
- **Technologies**: Java 17+, Maven, JUnit 5, React, TypeScript, Tailwind CSS
- **License**: MIT License
