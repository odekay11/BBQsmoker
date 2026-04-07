#include "pid_controller.h"
#include "config.h"
#include <PID_v1.h>
#include <Arduino.h>

static double pidInput;    // Current chamber temperature fed into PID
static double pidOutput;   // PID output: 0–255 (maps to duty cycle)
static double pidSetpoint; // Desired temperature (mirrors targetTemp)

static PID myPID(&pidInput, &pidOutput, &pidSetpoint, PID_KP, PID_KI, PID_KD, DIRECT);

// Tracks the start of the current slow-PWM window (milliseconds)
static unsigned long windowStartTime = 0;

// Reflects the current SSR state so getSSRStatus() can report it
static bool ssrOn = false;

void initPID() {
    pinMode(SSR_PIN, OUTPUT);
    digitalWrite(SSR_PIN, LOW);

    windowStartTime = millis();

    myPID.SetOutputLimits(0, 255);
    myPID.SetMode(AUTOMATIC);
}

void computePID(double currentTemp) {
    // If the smoker has been stopped via MQTT, cut power and do nothing.
    if (!smokerEnabled) {
        digitalWrite(SSR_PIN, LOW);
        ssrOn = false;
        return;
    }

    pidInput    = currentTemp;
    pidSetpoint = targetTemp; // Read global from config.h

    myPID.Compute(); // Updates pidOutput

    // --- Slow PWM logic for SSR ---
    //
    // Instead of analogWrite (which switches too fast for mains-voltage SSRs),
    // we use a rolling time window (WINDOW_SIZE ms, default 10 s).
    //
    // The PID output (0–255) is scaled to a fraction of the window:
    //   on-time = (pidOutput / 255) * WINDOW_SIZE
    //
    // Example at 60% output (pidOutput ~153):
    //   on-time  = 6000 ms  → SSR HIGH for the first 6 s
    //   off-time = 4000 ms  → SSR LOW  for the remaining 4 s

    unsigned long now = millis();

    // Start a fresh window once the previous one expires
    if (now - windowStartTime >= (unsigned long)WINDOW_SIZE) {
        windowStartTime += WINDOW_SIZE;
    }

    unsigned long onTime = (unsigned long)(pidOutput / 255.0 * WINDOW_SIZE);

    if ((now - windowStartTime) < onTime) {
        digitalWrite(SSR_PIN, HIGH);
        ssrOn = true;
    } else {
        digitalWrite(SSR_PIN, LOW);
        ssrOn = false;
    }
}

bool getSSRStatus() {
    return ssrOn;
}
