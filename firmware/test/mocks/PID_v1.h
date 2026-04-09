#pragma once
// Stub for Brett Beauregard's Arduino PID library.
// Compute() is intentionally a no-op so tests can call _test_forcePIDOutput()
// to set pidOutput to a precise value before invoking computePID().

class PID {
public:
    PID(double* /*input*/, double* /*output*/, double* /*setpoint*/,
        double /*kp*/, double /*ki*/, double /*kd*/, int /*dir*/) {}

    void SetOutputLimits(double, double) {}
    void SetMode(int) {}

    // No-op: tests drive pidOutput via _test_forcePIDOutput() instead.
    bool Compute() { return true; }
};
