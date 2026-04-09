#include "thermocouple.h"
#include "config.h"
#include <Adafruit_MAX31855.h>

// Both thermocouples share the hardware SPI bus.
// Only the chip-select (CS) pin differs between the two.
Adafruit_MAX31855 tc1(TC1_CS_PIN); // Chamber
Adafruit_MAX31855 tc2(TC2_CS_PIN); // Meat

void initThermocouples() {
    tc1.begin();
    tc2.begin();
}

// Helper: read a thermocouple, handle faults, return Fahrenheit or -1.0
static float readTC(Adafruit_MAX31855& tc, const char* label) {
    double tempC = tc.readCelsius();

    if (isnan(tempC)) {
        uint8_t fault = tc.readError();
        Serial.print("[TC] Fault on ");
        Serial.print(label);
        Serial.print(": ");
        if (fault & MAX31855_FAULT_OPEN)   Serial.println("open circuit");
        if (fault & MAX31855_FAULT_SHORT_GND) Serial.println("short to GND");
        if (fault & MAX31855_FAULT_SHORT_VCC) Serial.println("short to VCC");
        return -1.0f;
    }

    // Convert Celsius to Fahrenheit
    return (float)(tempC * 9.0 / 5.0 + 32.0);
}

float readChamberTemp() {
    return readTC(tc1, "Chamber");
}

float readMeatTemp() {
    return readTC(tc2, "Meat");
}
