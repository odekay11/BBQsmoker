#pragma once
// Arduino mock for native PC-side unit tests.
// All globals are defined here (safe because #pragma once ensures a single
// definition per translation unit — each test suite compiles as one TU).

#include <cstdint>
#include <cstring>
#include <math.h>       // provides isnan(), NAN in global namespace
#include <algorithm>

using std::min;
using std::max;

typedef uint8_t  byte;
typedef uint32_t word;

#define HIGH      1
#define LOW       0
#define OUTPUT    1
#define INPUT     0
#define DIRECT    0
#define AUTOMATIC 1

// ---------------------------------------------------------------------------
// Fake time — set _fake_millis in setUp() to control millis()
// ---------------------------------------------------------------------------
unsigned long _fake_millis = 0;
inline unsigned long millis() { return _fake_millis; }
inline void delay(unsigned long) {}

// ---------------------------------------------------------------------------
// Fake pin state — read _pin_states[pin] after computePID() to verify SSR
// ---------------------------------------------------------------------------
int _pin_states[40] = {};

inline void pinMode(int, int) {}
inline void digitalWrite(int pin, int val) {
    if (pin >= 0 && pin < 40) _pin_states[pin] = val;
}
inline int digitalRead(int pin) {
    return (pin >= 0 && pin < 40) ? _pin_states[pin] : 0;
}

// ---------------------------------------------------------------------------
// Serial stub — all output silently discarded
// ---------------------------------------------------------------------------
struct SerialStub {
    void begin(int) {}
    template<typename T>           void print(T)     {}
    template<typename T, typename B> void print(T, B) {}
    template<typename T>           void println(T)   {}
    void println() {}
} Serial;
