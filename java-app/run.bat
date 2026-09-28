@echo off
REM Hotel Room Booking System - Run Script for Windows
echo ==================================================
echo     Compiling Hotel Room Booking System...
echo ==================================================

if not exist bin mkdir bin
if not exist data mkdir data

dir /s /b src\main\java\*.java > sources.txt
javac -d bin -sourcepath src/main/java @sources.txt
del sources.txt

echo Starting Grand Horizon Front Desk Application...
java -cp bin com.hotel.main.Main
pause
