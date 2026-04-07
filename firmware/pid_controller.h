#pragma once

// Initialize PID controller and set SSR_PIN as OUTPUT.
void initPID();

// Run one PID iteration using currentTemp as input, then apply the
// slow-PWM SSR control logic. Must be called frequently (every loop).
void computePID(double currentTemp);

// Returns true if the SSR is currently energized (HIGH).
bool getSSRStatus();
