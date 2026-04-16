#include <unity.h>

// Expose _test_forcePIDOutput() — defined under #ifdef UNIT_TEST in pid_controller.cpp.
// UNIT_TEST is set via -DUNIT_TEST in platformio.ini [env:native] build_flags.
#include "../../pid_controller.cpp"

// From the Arduino mock
extern unsigned long _fake_millis;
extern int           _pin_states[];

// _test_forcePIDOutput is defined in pid_controller.cpp under UNIT_TEST guard
void _test_forcePIDOutput(double v);

void setUp(void) {
    _fake_millis = 0;
    memset(_pin_states, 0, 40 * sizeof(int));
    smokerEnabled = true;
    targetTemp    = 225.0;
    initPID();   // sets windowStartTime = millis() = 0
}

void tearDown(void) {}

// ---------------------------------------------------------------------------
// Kill switch: smokerEnabled = false → SSR must never fire
// ---------------------------------------------------------------------------

void test_smoker_disabled_ssr_always_low(void) {
    smokerEnabled = false;
    _test_forcePIDOutput(255.0);
    _fake_millis = 100;
    computePID(200.0);
    TEST_ASSERT_EQUAL(LOW, _pin_states[SSR_PIN]);
}

// ---------------------------------------------------------------------------
// High PID output early in window → SSR HIGH
// ---------------------------------------------------------------------------

void test_high_output_ssr_high_early_in_window(void) {
    _test_forcePIDOutput(255.0);   // full output → onTime = WINDOW_SIZE
    _fake_millis = 100;            // 100 ms into a 10 000 ms window → inside on-time
    computePID(200.0);
    TEST_ASSERT_EQUAL(HIGH, _pin_states[SSR_PIN]);
}

// ---------------------------------------------------------------------------
// Low PID output early in window → SSR LOW
// ---------------------------------------------------------------------------

void test_zero_output_ssr_low(void) {
    _test_forcePIDOutput(0.0);   // zero output → onTime = 0
    _fake_millis = 100;          // any position > 0 → outside on-time
    computePID(200.0);
    TEST_ASSERT_EQUAL(LOW, _pin_states[SSR_PIN]);
}

// ---------------------------------------------------------------------------
// Window rollover: at t > WINDOW_SIZE the window resets and a fresh cycle starts
// ---------------------------------------------------------------------------

void test_window_rollover_starts_new_cycle(void) {
    _test_forcePIDOutput(255.0);
    // t = 10 100 ms: windowStartTime advances from 0 → 10 000; elapsed = 100 ms.
    // onTime = 10 000, 100 < 10 000 → SSR HIGH (first 100 ms of new window)
    _fake_millis = 10100;
    computePID(200.0);
    TEST_ASSERT_EQUAL(HIGH, _pin_states[SSR_PIN]);
}

// ---------------------------------------------------------------------------
// getSSRStatus() must always agree with the physical pin
// ---------------------------------------------------------------------------

void test_getSSRStatus_matches_pin(void) {
    _test_forcePIDOutput(255.0);
    _fake_millis = 100;
    computePID(200.0);
    bool ssr = getSSRStatus();
    TEST_ASSERT_EQUAL(ssr ? HIGH : LOW, _pin_states[SSR_PIN]);
}

void test_getPIDOutput_returns_forced_value(void) {
    _test_forcePIDOutput(128.0);
    TEST_ASSERT_FLOAT_WITHIN(0.01f, 128.0f, (float)getPIDOutput());
}

// ---------------------------------------------------------------------------

int main(int argc, char** argv) {
    UNITY_BEGIN();
    RUN_TEST(test_smoker_disabled_ssr_always_low);
    RUN_TEST(test_high_output_ssr_high_early_in_window);
    RUN_TEST(test_zero_output_ssr_low);
    RUN_TEST(test_window_rollover_starts_new_cycle);
    RUN_TEST(test_getSSRStatus_matches_pin);
    RUN_TEST(test_getPIDOutput_returns_forced_value);
    return UNITY_END();
}
