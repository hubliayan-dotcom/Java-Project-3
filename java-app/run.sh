#!/usr/bin/env bash
# Hotel Room Booking System - Run Script for Linux/macOS
set -e

echo "=================================================="
echo "    Compiling Hotel Room Booking System...        "
echo "=================================================="

mkdir -p bin
mkdir -p data

javac -d bin -sourcepath src/main/java $(find src/main/java -name "*.java")

echo "Starting Grand Horizon Front Desk Application..."
java -cp bin com.hotel.main.Main
