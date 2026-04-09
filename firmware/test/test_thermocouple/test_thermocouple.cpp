#include <unity.h>

// Pull in production source — Arduino.h mock defines globals for this TU.
#include "../../thermocouple.cpp"

// tc1/tc2 are no longer static, so we can reach them directly.
extern Adafruit_MAX31855 tc1;
extern Adafruit_MAX31855 tc2;

void setUp(void) {
    tc1._fakeTemp  = 0.0;
    tc1._returnNan = false;
    tc1._fakeFault = 0;
    tc2._fakeTemp  = 0.0;
    tc2._returnNan = false;
    tc2._fakeFault = 0;
}

void tearDown(void) {}

// ---------------------------------------------------------------------------
// C to F conversion
// ---------------------------------------------------------------------------

void test_freezing_point(void) {
    tc1._fakeTemp = 0.0;
    // 0 * 9/5 + 32 = 32 °F
    TEST_ASSERT_FLOAT_WITHIN(0.5f, 32.0f, readChamberTemp());
}

void test_boiling_point(void) {
    tc1._fakeTemp = 100.0;
    // 100 * 9/5 + 32 = 212 °F
    TEST_ASSERT_FLOAT_WITHIN(0.5f, 212.0f, readChamberTemp());
}

void test_smoke_target_temp(void) {
    tc1._fakeTemp = 107.2;
    // 107.2 * 9/5 + 32 = 224.96 °F  ≈ 225 °F (default smoker target)
    TEST_ASSERT_FLOAT_WITHIN(0.5f, 224.96f, readChamberTemp());
}

// ---------------------------------------------------------------------------
// Fault handling
// ---------------------------------------------------------------------------

void test_nan_input_returns_negative_one(void) {
    tc1._returnNan = true;
    TEST_ASSERT_FLOAT_WITHIN(0.01f, -1.0f, readChamberTemp());
}

// ---------------------------------------------------------------------------

int main(int argc, char** argv) {
    UNITY_BEGIN();
    RUN_TEST(test_freezing_point);
    RUN_TEST(test_boiling_point);
    RUN_TEST(test_smoke_target_temp);
    RUN_TEST(test_nan_input_returns_negative_one);
    return UNITY_END();
}
