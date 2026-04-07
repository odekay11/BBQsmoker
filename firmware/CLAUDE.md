# Smoker Monitor — Firmware (ESP32)

## Project context
This is the firmware half of a two-part smoker monitoring project. The ESP32 reads two thermocouples, runs a PID control loop, controls a hot plate via an SSR relay, and publishes temperature data to HiveMQ Cloud via MQTT. A separate Next.js frontend on Vercel subscribes to that data and sends target temperature commands back to the ESP32.

---

## File structure
```
/firmware
  main.ino
  config.h
  thermocouple.h
  thermocouple.cpp
  pid_controller.h
  pid_controller.cpp
  mqtt_client.h
  mqtt_client.cpp
```

---

## config.h
Create a config file with the following constants. Leave credential values as empty strings — the user will fill them in:
```cpp
// WiFi
const char* WIFI_SSID     = "";
const char* WIFI_PASSWORD = "";

// HiveMQ
const char* MQTT_HOST      = "";   // e.g. abc123.s1.eu.hivemq.cloud
const int   MQTT_PORT      = 8883; // TLS port
const char* MQTT_USER      = "";
const char* MQTT_PASSWORD  = "";
const char* MQTT_CLIENT_ID = "ESP32Smoker";

// MQTT topics
const char* TOPIC_CHAMBER = "smoker/chamber/temperature";
const char* TOPIC_MEAT    = "smoker/meat/temperature";
const char* TOPIC_TARGET  = "smoker/target/temperature";
const char* TOPIC_SSR     = "smoker/ssr/status";

// Pin assignments
const int SSR_PIN    = 26;
const int TC1_CS_PIN = 5;  // Chamber thermocouple chip select
const int TC2_CS_PIN = 17; // Meat thermocouple chip select

// PID tuning — user should tune these for their setup
const double PID_KP = 2.0;
const double PID_KI = 5.0;
const double PID_KD = 1.0;

// Slow PWM control window (milliseconds)
const int WINDOW_SIZE = 10000;

// Default target temperature (Fahrenheit)
double targetTemp = 225.0;
```

---

## Required libraries
The user installs these via Arduino Library Manager:
- `Adafruit MAX31855 library` — thermocouple reading over SPI
- `PubSubClient` — MQTT client
- `ArduinoJson` — JSON serialization
- `PID_v1` — PID control loop
- `WiFiClientSecure` — TLS connection to HiveMQ

---

## thermocouple module (thermocouple.h / thermocouple.cpp)
- Use the Adafruit MAX31855 library
- Instantiate two MAX31855 objects using TC1_CS_PIN and TC2_CS_PIN from config.h
- Both thermocouples share the same SPI bus — only the CS pin differs
- Provide a `readChamberTemp()` function returning float in Fahrenheit
- Provide a `readMeatTemp()` function returning float in Fahrenheit
- Handle NaN and fault conditions gracefully — return -1.0 on any fault and print the fault type to Serial
- Fault types to handle: open circuit, short to GND, short to VCC

---

## pid_controller module (pid_controller.h / pid_controller.cpp)
- Use the PID_v1 Arduino library
- Input: current chamber temperature (double)
- Setpoint: targetTemp from config.h (double)
- Output: value 0–255 mapped to duty cycle (double)
- Initialize PID with KP, KI, KD from config.h in DIRECT mode
- Set output limits: 0 to 255
- Use slow PWM for SSR control — do NOT use analogWrite on the SSR pin. SSRs switching mains AC too fast can cause problems. Instead:
  - Track millis() within a rolling WINDOW_SIZE window
  - Compute windowStartTime at the start of each window
  - If (millis() - windowStartTime) < (output / 255.0 * WINDOW_SIZE) → digitalWrite SSR_PIN HIGH
  - Else → digitalWrite SSR_PIN LOW
  - When window expires, reset windowStartTime
- This produces a clean on/off cycle — e.g. at 60% output the SSR is on for 6 seconds and off for 4 seconds out of every 10 second window
- Provide a `computePID(double currentTemp)` function that runs the PID and applies the slow PWM
- Provide a `getSSRStatus()` function returning bool (true = currently ON)

---

## mqtt_client module (mqtt_client.h / mqtt_client.cpp)
- Use PubSubClient with a WiFiClientSecure connection
- Call `espClient.setInsecure()` for v1 — the user can add a certificate later
- On successful MQTT connect: subscribe to `smoker/target/temperature`
- Implement a message callback:
  - When a message arrives on the target topic, parse it as a float
  - Update targetTemp in config.h
  - Print the new target to Serial
- Implement `reconnect()` — retry every 5 seconds if connection drops, print status to Serial
- Implement `publishData(float chamber, float meat, bool ssrOn)`:
  - Build a JSON payload using ArduinoJson:
    ```json
    {
      "chamber": 224.5,
      "meat": 145.2,
      "target": 225.0,
      "ssr": true
    }
    ```
  - Publish to `smoker/chamber/temperature`
  - Publish SSR status separately to `smoker/ssr/status` as "ON" or "OFF"

---

## main.ino
```
setup():
  1. Serial.begin(115200)
  2. Initialize SPI and both thermocouples
  3. Set SSR_PIN as OUTPUT, default LOW
  4. Connect to WiFi — print dots to Serial while connecting
  5. Initialize PID
  6. Connect to MQTT broker

loop():
  1. If WiFi disconnected, attempt reconnect
  2. If MQTT disconnected, call reconnect()
  3. Call client.loop() to process incoming messages
  4. Every 2000ms:
     a. Read chamber temp via readChamberTemp()
     b. Read meat temp via readMeatTemp()
     c. Call computePID(chamberTemp) to run PID and update SSR
     d. Call publishData(chamberTemp, meatTemp, getSSRStatus())
     e. Print debug info to Serial:
        Chamber: 224.5°F | Meat: 145.2°F | Target: 225.0°F | SSR: ON
```

---

## Important notes for Claude Code
- Never hardcode credentials — all config lives in config.h which the user populates
- Add clear comments explaining the slow PWM logic since it is non-obvious to someone unfamiliar with SSR control
- The ESP32 connects to HiveMQ on port 8883 (TCP/TLS) — not 8884 which is the WebSocket port used by the browser frontend
- If either thermocouple returns -1 (fault), do not feed that value into the PID — hold the last known good value and print a warning to Serial
- All temperature values are in Fahrenheit throughout
- The MQTT client ID must be unique — use "ESP32Smoker" as defined in config.h. The web frontend uses a randomly generated client ID so there is no collision risk
- If MQTT connection drops, reconnect automatically without requiring a device restart
