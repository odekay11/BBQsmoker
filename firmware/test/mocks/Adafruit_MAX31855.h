#pragma once
// Stub for Adafruit MAX31855 thermocouple library.
// Tests set _fakeTemp / _returnNan to control readCelsius() output.

#include <cstdint>
#include <math.h>   // NAN

#define MAX31855_FAULT_OPEN      0x01
#define MAX31855_FAULT_SHORT_GND 0x02
#define MAX31855_FAULT_SHORT_VCC 0x04

class Adafruit_MAX31855 {
public:
    double  _fakeTemp   = 0.0;
    bool    _returnNan  = false;
    uint8_t _fakeFault  = 0;

    explicit Adafruit_MAX31855(int /*csPin*/) {}

    void    begin()      {}
    double  readCelsius(){ return _returnNan ? (double)NAN : _fakeTemp; }
    uint8_t readError()  { return _fakeFault; }
};
