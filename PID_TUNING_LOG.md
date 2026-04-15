# PID Tuning Log

## Session: 2026-04-14

### Hardware
- ESP32 Dev Module on COM3
- Two MAX31855 thermocouples (chamber TC1 on GPIO5, meat TC2 on GPIO25)
- SSR on GPIO26 with 10-second slow PWM window
- Target temperature: **210°F**
- Cold start: ~72°F ambient

### Fixes applied this session
- **Meat probe offset**: probe reads 10°F low — added `MEAT_TEMP_OFFSET = 10.0f` in `config.h`, applied in `readMeatTemp()` in `thermocouple.cpp`
- **Default target**: changed from 225.0 to 210.0 in `config.cpp`

---

## Test 1 — Baseline (cold start)
**PID values:** Kp=5.0, Ki=0.05, Kd=15.0 (original)

| Metric | Result |
|--------|--------|
| Start temp | 72°F |
| First crossing 210°F | 784s (13 min) |
| Peak overshoot | +6.5°F → 216.5°F |
| Trough undershoot | −19.6°F → 190.4°F |
| Oscillation period | ~504s |
| Steady-state avg (last 60 readings) | 203.1°F (**−6.9°F bias**) |
| Steady-state std dev | 1.8°F |

**Assessment:** Large asymmetric oscillation. Integral windup during the long cold rise caused the system to overshoot by 6.5°F, then the wound-down integral caused a deep 19.6°F undershoot. Never reliably held 210°F — settled ~7°F low. Ki=0.05 accumulates too aggressively; Kd=15.0 not damping enough.

**Log file:** `pid_log_1776207467468.csv`

---

## Test 2 — Reduced Ki, increased Kd (warm start ~194°F)
**PID values:** Kp=3.0, Ki=0.01, Kd=30.0

| Metric | Result |
|--------|--------|
| Start temp | ~194°F (warm from test 1) |
| Behavior | Temperature declined from 194°F to ~191°F |
| Duration | ~10 min before aborted |

**Assessment:** Ki=0.01 is too low. The integral builds too slowly (~40 min) to overcome heat loss at 194°F. With Kp=3.0, error of 16°F only produces 18% SSR duty — insufficient to maintain temperature. The system needs ~90% duty to hold 210°F, and the integral can't build fast enough with Ki=0.01. Aborted early.

**Log file:** `pid_log_1776207467468.csv` (same session, second portion)

---

## Test 3 — Planned (not yet run)
**PID values:** Kp=3.0, Ki=0.03, Kd=30.0 ← **currently flashed**

**Rationale:**
- Kp reduced 5.0→3.0: less aggressive proportional response, smaller oscillations
- Ki increased 0.01→0.03: fast enough for integral to build in ~15 min vs 40 min; slow enough to reduce windup vs original 0.05
- Kd doubled 15.0→30.0: stronger derivative damping of thermal inertia

**Goal:** Cold start from ambient, run until stable within ±2°F of 210°F for 60 seconds. Script auto-stops and prints summary.

**To run:**
```bash
cd C:\Projects\smoker
node pid_test.js
```

**What to look for:**
- Overshoot < 5°F (vs 6.5°F in test 1)
- No deep undershoot (vs −19.6°F in test 1)
- Steady-state average within ±3°F of 210°F
- If still oscillating: reduce Kp further or increase Kd
- If slow to rise / hangs below target: increase Ki slightly

---

## Notes
- **Do not open serial monitor while a test is running** — it toggles DTR/RTS and resets the ESP32, killing the MQTT session
- The test script (`pid_test.js`) disables the SSR on exit — always let it exit cleanly or Ctrl+C before reflashing
- Kill stale `pio`/`python` processes before flashing if COM3 is busy: `powershell -Command "Stop-Process -Name python,pio -Force -ErrorAction SilentlyContinue"`
- MQTT test script connects over WSS 8883 using credentials from `config.h`
