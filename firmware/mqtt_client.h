#pragma once

// Set up WiFiClientSecure and PubSubClient, attach the message callback.
void initMQTT();

// Connect (or reconnect) to the MQTT broker.
// Retries every 5 seconds until successful, printing status to Serial.
void reconnect();

// Publish chamber temp, meat temp, target, and SSR status as JSON.
// Also publishes SSR status separately to TOPIC_SSR.
void publishData(float chamber, float meat, bool ssrOn);

// Returns a reference to the underlying PubSubClient for calling client.loop().
#include <PubSubClient.h>
PubSubClient& getMQTTClient();
