# Smoker Monitor

A DIY smoker controller and monitor built with an ESP32 and a Next.js web frontend. The ESP32 reads two thermocouples, runs a PID control loop to drive a solid-state relay (SSR), and publishes live temperature data to the cloud. A browser-based dashboard lets you watch temperatures in real time and adjust the target setpoint from anywhere.

---

## What it does

- Monitors **chamber temperature** and **meat temperature** simultaneously via two MAX31855 SPI thermocouples
- Controls a **solid-state relay** (SSR) using a slow-PWM PID loop to maintain a target temperature
- Publishes sensor data to **HiveMQ Cloud** over MQTT/TLS every 2 seconds
- Displays live data in a web dashboard that connects to the same broker over WebSocket
- Accepts remote commands from the browser to change the target temperature or toggle the smoker on/off

---

## System architecture

```
MAX31855 (×2) ──SPI──► ESP32 ──TCP/TLS 8883──► HiveMQ Cloud ◄──WSS 8884── Browser (Next.js)
                          │                                                        │
                          │◄──────────── smoker/target/temperature ◄───────────────┤
                          │◄──────────── smoker/power ◄────────────────────────────┘
```

The ESP32 is the sole publisher of sensor data. The browser is the sole publisher of commands. HiveMQ Cloud is the shared broker — nothing communicates directly between hardware and browser.

---

## Repository layout

```
smoker/
  firmware/          ESP32 Arduino sketch (C++ / PlatformIO)
  smoker-monitor/    Next.js web frontend (TypeScript)
```

---

## Firmware (`firmware/`)

Written in C++ for the ESP32, built with PlatformIO.

**Key modules:**

| File | Responsibility |
|------|---------------|
| `main.ino` | Setup, loop, WiFi/MQTT reconnect, 2-second publish cycle |
| `config.h` | All credentials, pin assignments, PID tuning, shared globals |
| `thermocouple.cpp` | MAX31855 reads over SPI; returns °F, holds last-good value on fault |
| `pid_controller.cpp` | PID_v1 loop with slow-PWM SSR output (10-second window) |
| `mqtt_client.cpp` | PubSubClient/TLS connection, publish, subscribe, reconnect logic |

**Slow-PWM SSR control:** The SSR switches mains AC, so `analogWrite` is not used. Instead, a 10-second rolling window maps PID output (0–255) to an on-time fraction. At 60% output the SSR is on for 6 s and off for 4 s per window.

**Fault handling:** If a thermocouple returns a fault (open circuit, short to GND/VCC), the last known-good reading is held and fed to the PID — the bad value is never used.

**Libraries:** Adafruit MAX31855, PubSubClient, ArduinoJson, PID_v1, WiFiClientSecure

**Unit tests** run natively (no hardware needed) via PlatformIO:

```bash
cd firmware
pio test -e native
```

---

## Frontend (`smoker-monitor/`)

Built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

The UI is styled as an analog hi-fi instrument panel — black glass dials, chrome bezels, and blue glow readouts.

**Key pieces:**

- `app/page.tsx` — single-page client component, all layout and controls inline
- `hooks/useMqtt.ts` — MQTT WebSocket hook; returns a `SmokerState` interface
- `hooks/useMockMqtt.ts` — drop-in mock for UI development without hardware
- `lib/mqttConfig.ts` — single source of truth for all MQTT topic strings

**Mock mode** (no broker or hardware required):

```bash
# .env.local
NEXT_PUBLIC_MOCK_MODE=true

npm run dev
```

**Dev server:**

```bash
cd smoker-monitor
npm install
npm run dev    # http://localhost:3000
```

---

## MQTT topic schema

| Topic | Publisher | Payload |
|-------|-----------|---------|
| `smoker/chamber/temperature` | ESP32 | JSON `{chamber, meat, target, ssr}` |
| `smoker/ssr/status` | ESP32 | `"ON"` / `"OFF"` |
| `smoker/target/temperature` | Browser | plain float string e.g. `"250.0"` |
| `smoker/power` | Browser | `"on"` / `"off"` |

---


```
