#pragma once

// Initialize both MAX31855 thermocouple objects.
// Both share the SPI bus; only the CS pin differs.
void initThermocouples();

// Returns chamber temperature in Fahrenheit.
// Returns -1.0 on any fault (open circuit, short to GND, short to VCC).
float readChamberTemp();

// Returns meat probe temperature in Fahrenheit.
// Returns -1.0 on any fault.
float readMeatTemp();
