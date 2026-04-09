# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Repository layout

```
smoker/
  firmware/          ESP32 Arduino sketch (C++)
  smoker-monitor/    Next.js web frontend (TypeScript)
```

Both sub-projects have their own `CLAUDE.md`. This file covers the cross-cutting concerns.

---

## Commands

### Firmware (`firmware/`)

```bash
# Run all native unit tests (no ESP32 required)
cd firmware
pio test -e native

# Run a single test suite
pio test -e native -f test_mqtt --verbose
pio test -e native -f test_thermocouple --verbose
pio test -e native -f test_pid_slow_pwm --verbose

# Verify firmware still compiles for ESP32 (no upload)
pio run -e esp32dev
```

`pio` requires PlatformIO: `pip install platformio`

### Frontend (`smoker-monitor/`)

```bash
cd smoker-monitor
npm install
npm run dev      # dev server (localhost:3000)
npm run build    # production build
npm run lint     # ESLint
```

**Mock mode**: `NEXT_PUBLIC_MOCK_MODE=true` in `.env.local` replaces the MQTT hook with a simulator — no broker or hardware needed for UI development.

---

## System architecture

```
MAX31855 (×2) ──SPI──► ESP32 ──TCP/TLS 8883──► HiveMQ Cloud ◄──WSS 8884── Browser (Next.js)
                         │                                                         │
                         │◄──────────── smoker/target/temperature ◄───────────────┤
                         │◄──────────── smoker/power ◄────────────────────────────┘
```

The ESP32 is the only publisher of sensor data. The browser is the only publisher of commands. HiveMQ Cloud is the shared broker — nothing talks to anything else directly.

---

## MQTT topic schema

| Topic | Publisher | Payload | Purpose |
|-------|-----------|---------|---------|
| `smoker/chamber/temperature` | ESP32 | JSON `{chamber, meat, target, ssr}` | Combined sensor snapshot |
| `smoker/ssr/status` | ESP32 | `"ON"` / `"OFF"` | SSR state for relay-only consumers |
| `smoker/target/temperature` | Browser | plain float string e.g. `"250.0"` | Set PID setpoint |
| `smoker/power` | Browser | `"on"` / `"off"` | Enable/disable SSR via `smokerEnabled` flag |

The browser connects over WebSocket (port 8884); the ESP32 connects over TCP/TLS (port 8883). Both ports talk to the same HiveMQ broker.

---

## Firmware architecture

All state shared across modules lives in `config.h` as plain globals (`targetTemp`, `smokerEnabled`). The modules read and write these directly — there is no explicit message passing between firmware modules.

**Slow-PWM pattern** (`pid_controller.cpp`): the SSR cannot be analogWrite'd because it switches mains AC. Instead a rolling `WINDOW_SIZE`-ms window maps PID output (0–255) to an on-time fraction. `computePID()` must be called every loop iteration (not just every 2 s) so window transitions fire at the correct millisecond.

**Fault-hold pattern** (`main.ino`): when a thermocouple returns −1 the last known-good value is held and fed to the PID. The bad value is never passed to `computePID()`.

**Unit test infrastructure** (`firmware/test/`): native PlatformIO tests compile the production `.cpp` files directly into the test binary using mock headers in `test/mocks/`. Three production-code accommodations enable this:
- `tc1`/`tc2` in `thermocouple.cpp` are non-static so tests can set `tc1._returnNan = true`
- `mqttClient` in `mqtt_client.cpp` is non-static so `getMQTTClient()` exposes the mock's `published` vector and `simulateReceive()`
- `_test_forcePIDOutput(double)` is compiled in under `#ifdef UNIT_TEST` to drive `pidOutput` without going through the PID algorithm

---

## Frontend architecture

`page.tsx` is a single-page client component. All MQTT logic is encapsulated in one hook (`useMqtt` or `useMockMqtt`) that returns the same `SmokerState` interface. Swapping between real and mock is controlled by `NEXT_PUBLIC_MOCK_MODE`.

**Refs vs state in hooks**: `isRunningRef`, `startTimeRef`, and `cookTimerRef` are `useRef` (not state) so the stopwatch `setInterval` closure always reads current values without re-registering the interval.

The `useMqtt` hook parses both the combined JSON payload (`smoker/chamber/temperature` contains all four fields) and individual-field payloads for forward compatibility.

**`lib/mqttConfig.ts`** is the single source of topic names for the frontend — do not hardcode topic strings in components or hooks.

---

## Next.js version note

The `smoker-monitor` app uses **Next.js 16** (not Next.js 14/15). APIs, conventions, and file-structure conventions may differ from training data. Check `node_modules/next/dist/docs/` before writing Next.js-specific code.
