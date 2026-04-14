#include <Arduino.h>
#include <WiFi.h>
#include <SPI.h>

#include "config.h"
#include "thermocouple.h"
#include "pid_controller.h"
#include "mqtt_client.h"

// Interval between sensor reads and MQTT publishes (milliseconds)
static const unsigned long READ_INTERVAL = 2000;

// Last known good temperatures — used when a thermocouple returns a fault
static float lastChamberTemp = 0.0f;
static float lastMeatTemp    = 0.0f;

void setup() {
    Serial.begin(115200);
    delay(500);
    Serial.println("[Boot] Smoker monitor starting...");

    // 1. Initialize SPI and both thermocouple objects
    SPI.begin();
    initThermocouples();
    Serial.println("[Boot] Thermocouples initialized.");

    // 2. SSR pin is configured inside initPID() — set here for explicitness
    //    (initPID will also set it, so this is belt-and-suspenders)
    pinMode(SSR_PIN, OUTPUT);
    digitalWrite(SSR_PIN, LOW);

    // 3. Connect to WiFi
    Serial.print("[WiFi] Connecting to ");
    Serial.print(WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println();
    Serial.print("[WiFi] Connected. IP: ");
    Serial.println(WiFi.localIP());

    // 4. Initialize PID controller
    initPID();
    Serial.println("[PID] PID controller initialized.");

    // 5. Initialize MQTT and connect
    initMQTT();
    reconnect();
}

void loop() {
    // Keep WiFi alive
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[WiFi] Disconnected — reconnecting...");
        WiFi.reconnect();
        unsigned long t = millis();
        while (WiFi.status() != WL_CONNECTED && millis() - t < 10000) {
            delay(500);
            Serial.print(".");
        }
        Serial.println();
    }

    // Keep MQTT alive
    PubSubClient& client = getMQTTClient();
    if (!client.connected()) {
        reconnect();
    }
    client.loop(); // Process incoming messages (e.g. new target temperature)

    // Sensor reads and publish every READ_INTERVAL ms
    static unsigned long lastRead = 0;
    unsigned long now = millis();

    if (now - lastRead >= READ_INTERVAL) {
        lastRead = now;

        // Read chamber temperature; require 3 consecutive faults before holding
        // to avoid acting on transient noise spikes from SSR switching.
        static int chamberFaultCount = 0;
        float chamberTemp = readChamberTemp();
        if (chamberTemp < 0) {
            chamberFaultCount++;
            if (chamberFaultCount >= 3) {
                Serial.println("[WARN] Chamber thermocouple fault — holding last value.");
                chamberTemp = lastChamberTemp;
            } else {
                chamberTemp = lastChamberTemp; // use last good silently on transient
            }
        } else {
            chamberFaultCount = 0;
            lastChamberTemp = chamberTemp;
        }

        // Read meat temperature; require 3 consecutive faults before holding
        static int meatFaultCount = 0;
        float meatTemp = readMeatTemp();
        if (meatTemp < 0) {
            meatFaultCount++;
            if (meatFaultCount >= 3) {
                Serial.println("[WARN] Meat thermocouple fault — holding last value.");
                meatTemp = lastMeatTemp;
            } else {
                meatTemp = lastMeatTemp; // use last good silently on transient
            }
        } else {
            meatFaultCount = 0;
            lastMeatTemp = meatTemp;
        }

        // Publish to HiveMQ
        bool ssrOn = getSSRStatus();
        publishData(chamberTemp, meatTemp, ssrOn);

        // Debug output
        Serial.printf("Chamber: %.1f°F | Meat: %.1f°F | Target: %.1f°F | SSR: %s\n",
                       chamberTemp, meatTemp, targetTemp, ssrOn ? "ON" : "OFF");
    }

    // computePID runs every loop iteration — not just every 2 s — so that the
    // slow-PWM window transitions happen at the correct millisecond. It uses
    // the last known good chamber temperature between sensor reads.
    computePID((double)lastChamberTemp);
}
