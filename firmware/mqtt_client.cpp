#include "mqtt_client.h"
#include "config.h"
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

static WiFiClientSecure espClient;
PubSubClient            mqttClient(espClient);

// Called by PubSubClient when a message arrives on a subscribed topic
static void mqttCallback(char* topic, byte* payload, unsigned int length) {
    // Null-terminate the payload so we can treat it as a string
    char msg[32];
    unsigned int len = min(length, (unsigned int)(sizeof(msg) - 1));
    memcpy(msg, payload, len);
    msg[len] = '\0';

    if (strcmp(topic, TOPIC_TARGET) == 0) {
        float newTarget = atof(msg);
        if (newTarget >= 100.0f && newTarget <= 400.0f) {
            targetTemp = newTarget;
            Serial.print("[MQTT] New target temperature: ");
            Serial.print(targetTemp);
            Serial.println(" °F");
        } else {
            Serial.print("[MQTT] Rejected out-of-range chamber target: ");
            Serial.println(newTarget);
        }
    }

    if (strcmp(topic, TOPIC_MEAT_TARGET) == 0) {
        float newMeatTarget = atof(msg);
        if (newMeatTarget >= 100.0f && newMeatTarget <= 250.0f) {
            targetMeatTemp = newMeatTarget;
            Serial.print("[MQTT] New meat target temperature: ");
            Serial.print(targetMeatTemp);
            Serial.println(" °F");
        } else {
            Serial.print("[MQTT] Rejected out-of-range meat target: ");
            Serial.println(newMeatTarget);
        }
    }

    if (strcmp(topic, TOPIC_POWER) == 0) {
        if (strcmp(msg, "on") == 0) {
            smokerEnabled = true;
            Serial.println("[MQTT] Smoker ENABLED");
        } else if (strcmp(msg, "off") == 0) {
            smokerEnabled = false;
            Serial.println("[MQTT] Smoker DISABLED");
        }
    }
}

void initMQTT() {
    // setInsecure() skips certificate verification.
    // To add a root CA certificate later, replace this with espClient.setCACert(ca_cert).
    espClient.setInsecure();

    mqttClient.setServer(MQTT_HOST, MQTT_PORT);
    mqttClient.setCallback(mqttCallback);
}

void reconnect() {
    while (!mqttClient.connected()) {
        Serial.print("[MQTT] Connecting to broker...");

        if (mqttClient.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASSWORD)) {
            Serial.println(" connected.");
            mqttClient.subscribe(TOPIC_TARGET);
            mqttClient.subscribe(TOPIC_POWER);
            mqttClient.subscribe(TOPIC_MEAT_TARGET);
            Serial.print("[MQTT] Subscribed to ");
            Serial.print(TOPIC_TARGET);
            Serial.print(", ");
            Serial.print(TOPIC_POWER);
            Serial.print(", ");
            Serial.println(TOPIC_MEAT_TARGET);
        } else {
            Serial.print(" failed, rc=");
            Serial.print(mqttClient.state());
            Serial.println(". Retrying in 5 s.");
            delay(5000);
        }
    }
}

void publishData(float chamber, float meat, bool ssrOn, double pidOutput) {
    // Build JSON: {"chamber":224.5,"meat":145.2,"target":225.0,"ssr":true,"meatTarget":165.0,"pidOutput":255}
    StaticJsonDocument<192> doc;
    doc["chamber"]    = chamber;
    doc["meat"]       = meat;
    doc["target"]     = targetTemp;
    doc["ssr"]        = ssrOn;
    doc["meatTarget"] = targetMeatTemp;
    doc["pidOutput"]  = (int)pidOutput;

    char jsonBuf[192];
    serializeJson(doc, jsonBuf, sizeof(jsonBuf));

    mqttClient.publish(TOPIC_CHAMBER, jsonBuf);

    // Publish SSR state separately for consumers that only care about relay status
    mqttClient.publish(TOPIC_SSR, ssrOn ? "ON" : "OFF");
}

// Expose the underlying client so main.ino can call client.loop()
PubSubClient& getMQTTClient() {
    return mqttClient;
}
