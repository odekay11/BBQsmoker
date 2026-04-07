#pragma once

// WiFi
const char* WIFI_SSID     = "";
const char* WIFI_PASSWORD = "";

// HiveMQ
const char* MQTT_HOST      = "c3d71cf3320e46e4b3d517dd60f64fb4.s1.eu.hivemq.cloud";   // e.g. abc123.s1.eu.hivemq.cloud
const int   MQTT_PORT      = 8883; // TLS port (not 8884 which is WebSocket)
const char* MQTT_USER      = "smokerV1";
const char* MQTT_PASSWORD  = "SCUsmoker12!";
const char* MQTT_CLIENT_ID = "ESP32Smoker";

// MQTT topics
const char* TOPIC_CHAMBER = "smoker/chamber/temperature";
const char* TOPIC_MEAT    = "smoker/meat/temperature";
const char* TOPIC_TARGET  = "smoker/target/temperature";
const char* TOPIC_SSR     = "smoker/ssr/status";
const char* TOPIC_POWER   = "smoker/power";

// Pin assignments
const int SSR_PIN    = 26;
const int TC1_CS_PIN = 5;  // Chamber thermocouple chip select
const int TC2_CS_PIN = 17; // Meat thermocouple chip select

// PID tuning — tune these for your setup
const double PID_KP = 2.0;
const double PID_KI = 5.0;
const double PID_KD = 1.0;

// Slow PWM control window (milliseconds)
// SSRs switch mains AC — switching too fast can cause problems.
// We use a 10-second window: at 60% output, SSR is ON for 6s, OFF for 4s.
const int WINDOW_SIZE = 10000;

// Default target temperature (Fahrenheit)
double targetTemp = 225.0;

// Controls whether the PID/SSR are active.
// Set to true by MQTT "on" message, false by "off" message.
bool smokerEnabled = false;
