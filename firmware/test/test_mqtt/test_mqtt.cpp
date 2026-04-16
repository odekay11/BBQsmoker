#include <unity.h>
#include <string>

// Pull in production source.  Arduino.h / PubSubClient.h mocks are resolved
// via -I test/mocks before the system include path.
#include "../../mqtt_client.cpp"

// getMQTTClient() returns the mock PubSubClient by reference so tests can
// inspect published[] and inject simulated incoming messages.
static PubSubClient& client() { return getMQTTClient(); }

static const double TEST_PID_OUTPUT = 200.0;

void setUp(void) {
    targetTemp     = 225.0;
    targetMeatTemp = 165.0;
    smokerEnabled  = false;
    initMQTT();             // registers mqttCallback via setCallback()
    client().clearPublished();
}

void tearDown(void) {}

// ---------------------------------------------------------------------------
// publishData() — JSON schema
// ---------------------------------------------------------------------------

void test_publishData_json_contains_chamber(void) {
    publishData(224.5f, 145.2f, true, TEST_PID_OUTPUT);
    const std::string& payload = client().published[0].payload;
    TEST_ASSERT_TRUE(payload.find("\"chamber\"") != std::string::npos);
}

void test_publishData_json_contains_meat(void) {
    publishData(224.5f, 145.2f, true, TEST_PID_OUTPUT);
    const std::string& payload = client().published[0].payload;
    TEST_ASSERT_TRUE(payload.find("\"meat\"") != std::string::npos);
}

void test_publishData_json_contains_target(void) {
    publishData(224.5f, 145.2f, true, TEST_PID_OUTPUT);
    const std::string& payload = client().published[0].payload;
    TEST_ASSERT_TRUE(payload.find("\"target\"") != std::string::npos);
}

void test_publishData_json_contains_ssr(void) {
    publishData(224.5f, 145.2f, true, TEST_PID_OUTPUT);
    const std::string& payload = client().published[0].payload;
    TEST_ASSERT_TRUE(payload.find("\"ssr\"") != std::string::npos);
}

void test_publishData_json_contains_meat_target(void) {
    targetMeatTemp = 165.0;
    publishData(224.5f, 145.2f, true, TEST_PID_OUTPUT);
    const std::string& payload = client().published[0].payload;
    TEST_ASSERT_TRUE(payload.find("\"meatTarget\"") != std::string::npos);
}

void test_publishData_json_contains_pid_output(void) {
    publishData(224.5f, 145.2f, true, TEST_PID_OUTPUT);
    const std::string& payload = client().published[0].payload;
    TEST_ASSERT_TRUE(payload.find("\"pidOutput\"") != std::string::npos);
}

// ---------------------------------------------------------------------------
// publishData() — topics
// ---------------------------------------------------------------------------

void test_publishData_uses_chamber_topic(void) {
    publishData(224.5f, 145.2f, true, TEST_PID_OUTPUT);
    TEST_ASSERT_EQUAL_STRING(TOPIC_CHAMBER, client().published[0].topic.c_str());
}

void test_publishData_publishes_ssr_status_separately(void) {
    publishData(224.5f, 145.2f, true, TEST_PID_OUTPUT);
    TEST_ASSERT_EQUAL(2, (int)client().published.size());
    TEST_ASSERT_EQUAL_STRING(TOPIC_SSR, client().published[1].topic.c_str());
    TEST_ASSERT_EQUAL_STRING("ON",      client().published[1].payload.c_str());
}

void test_publishData_ssr_off_sends_OFF(void) {
    publishData(224.5f, 145.2f, false, TEST_PID_OUTPUT);
    TEST_ASSERT_EQUAL_STRING("OFF", client().published[1].payload.c_str());
}

// ---------------------------------------------------------------------------
// MQTT callback — target temperature
// ---------------------------------------------------------------------------

void test_callback_valid_float_updates_target(void) {
    client().simulateReceive(TOPIC_TARGET, "250.0");
    TEST_ASSERT_FLOAT_WITHIN(0.1f, 250.0f, (float)targetTemp);
}

void test_callback_zero_leaves_target_unchanged(void) {
    // atof("0") = 0.0; guard is "newTarget > 0" so targetTemp must not change
    client().simulateReceive(TOPIC_TARGET, "0");
    TEST_ASSERT_FLOAT_WITHIN(0.1f, 225.0f, (float)targetTemp);
}

void test_callback_negative_leaves_target_unchanged(void) {
    client().simulateReceive(TOPIC_TARGET, "-50");
    TEST_ASSERT_FLOAT_WITHIN(0.1f, 225.0f, (float)targetTemp);
}

// ---------------------------------------------------------------------------
// MQTT callback — meat target temperature
// ---------------------------------------------------------------------------

void test_callback_valid_float_updates_meat_target(void) {
    client().simulateReceive(TOPIC_MEAT_TARGET, "190.0");
    TEST_ASSERT_FLOAT_WITHIN(0.1f, 190.0f, (float)targetMeatTemp);
}

void test_callback_zero_leaves_meat_target_unchanged(void) {
    client().simulateReceive(TOPIC_MEAT_TARGET, "0");
    TEST_ASSERT_FLOAT_WITHIN(0.1f, 165.0f, (float)targetMeatTemp);
}

// ---------------------------------------------------------------------------
// MQTT callback — power control
// ---------------------------------------------------------------------------

void test_callback_on_enables_smoker(void) {
    smokerEnabled = false;
    client().simulateReceive(TOPIC_POWER, "on");
    TEST_ASSERT_TRUE(smokerEnabled);
}

void test_callback_off_disables_smoker(void) {
    smokerEnabled = true;
    client().simulateReceive(TOPIC_POWER, "off");
    TEST_ASSERT_FALSE(smokerEnabled);
}

void test_callback_unknown_msg_leaves_smoker_unchanged(void) {
    smokerEnabled = true;
    client().simulateReceive(TOPIC_POWER, "standby");
    TEST_ASSERT_TRUE(smokerEnabled);   // must not have been cleared
}

// ---------------------------------------------------------------------------

int main(int argc, char** argv) {
    UNITY_BEGIN();
    RUN_TEST(test_publishData_json_contains_chamber);
    RUN_TEST(test_publishData_json_contains_meat);
    RUN_TEST(test_publishData_json_contains_target);
    RUN_TEST(test_publishData_json_contains_ssr);
    RUN_TEST(test_publishData_uses_chamber_topic);
    RUN_TEST(test_publishData_publishes_ssr_status_separately);
    RUN_TEST(test_publishData_ssr_off_sends_OFF);
    RUN_TEST(test_publishData_json_contains_meat_target);
    RUN_TEST(test_publishData_json_contains_pid_output);
    RUN_TEST(test_callback_valid_float_updates_target);
    RUN_TEST(test_callback_zero_leaves_target_unchanged);
    RUN_TEST(test_callback_negative_leaves_target_unchanged);
    RUN_TEST(test_callback_valid_float_updates_meat_target);
    RUN_TEST(test_callback_zero_leaves_meat_target_unchanged);
    RUN_TEST(test_callback_on_enables_smoker);
    RUN_TEST(test_callback_off_disables_smoker);
    RUN_TEST(test_callback_unknown_msg_leaves_smoker_unchanged);
    return UNITY_END();
}
