/**
 * Automated PID Step Response Test
 * Enables the smoker, collects data, auto-stops when stable or on timeout,
 * then prints a full analysis of the PID response.
 */

const mqtt = require('./smoker-monitor/node_modules/mqtt');
const fs   = require('fs');

// ── Config ───────────────────────────────────────────────────────────────────
const BROKER   = 'mqtts://c3d71cf3320e46e4b3d517dd60f64fb4.s1.eu.hivemq.cloud:8883';
const USER     = 'smokerV1';
const PASSWORD = 'SCUsmoker12!';
const TARGET   = 210.0;

// Stop when stable: last STABLE_WINDOW readings all within STABLE_BAND of target
const STABLE_BAND   = 2.0;  // °F
const STABLE_WINDOW = 30;   // readings (~60 seconds at 2s interval)
const MAX_RUNTIME   = 40 * 60 * 1000; // 40 minutes hard timeout

const TOPIC_CHAMBER = 'smoker/chamber/temperature';
const TOPIC_POWER   = 'smoker/power';
const TOPIC_TARGET  = 'smoker/target/temperature';

const LOG_FILE  = `pid_log_${Date.now()}.csv`;
const logStream = fs.createWriteStream(LOG_FILE);
logStream.write('elapsed_s,chamber_f,meat_f,ssr\n');

// ── State ─────────────────────────────────────────────────────────────────────
let startTime    = null;
let readings     = [];   // { elapsed, chamber, meat, ssr }
let stopped      = false;

// ── MQTT ──────────────────────────────────────────────────────────────────────
const client = mqtt.connect(BROKER, {
    username:           USER,
    password:           PASSWORD,
    clientId:           'PIDTester_' + Math.random().toString(16).slice(2, 8),
    rejectUnauthorized: false,
});

client.on('connect', () => {
    console.log('[MQTT] Connected');
    client.subscribe(TOPIC_CHAMBER);
    client.publish(TOPIC_TARGET, String(TARGET));
    client.publish(TOPIC_POWER,  'on');
    startTime = Date.now();
    console.log(`[TEST] Smoker ON — target ${TARGET}°F — logging to ${LOG_FILE}`);
    console.log('Elapsed    Chamber    Meat    SSR');
    console.log('-------    -------    ----    ---');

    // Hard timeout
    setTimeout(() => shutdown('timeout'), MAX_RUNTIME);
});

client.on('message', (topic, raw) => {
    if (stopped || topic !== TOPIC_CHAMBER) return;

    let data;
    try { data = JSON.parse(raw.toString()); }
    catch (e) { return; }

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const { chamber, meat, ssr } = data;

    readings.push({ elapsed, chamber, meat, ssr });
    logStream.write(`${elapsed},${chamber},${meat},${ssr ? 1 : 0}\n`);

    const ssrStr = ssr ? 'ON ' : 'OFF';
    const tempStatus = chamber >= TARGET + STABLE_BAND ? ' ▲ OVER'
                     : chamber >= TARGET - STABLE_BAND ? ' ✓ AT TARGET'
                     : '';
    console.log(`${String(elapsed).padStart(6)}s    ${chamber.toFixed(1).padStart(6)}°F    ${meat.toFixed(1).padStart(5)}°F    ${ssrStr}${tempStatus}`);

    // Check stability: last STABLE_WINDOW readings all within ±STABLE_BAND of target
    if (readings.length >= STABLE_WINDOW) {
        const recent = readings.slice(-STABLE_WINDOW);
        const allStable = recent.every(r => Math.abs(r.chamber - TARGET) <= STABLE_BAND);
        if (allStable) shutdown('stable');
    }
});

client.on('error', err => console.error('[MQTT] Error:', err.message));

// ── Shutdown & Analysis ───────────────────────────────────────────────────────
function shutdown(reason) {
    if (stopped) return;
    stopped = true;

    client.publish(TOPIC_POWER, 'off');
    console.log(`\n[TEST] Stopped (${reason}) — SSR OFF`);

    setTimeout(() => {
        logStream.end();
        client.end();
        analyze();
    }, 500);
}

function analyze() {
    if (readings.length === 0) {
        console.log('No data collected.'); process.exit(1);
    }

    const startTemp = readings[0].chamber;
    const totalRise = TARGET - startTemp;

    // Rise time: first reading at ≥ TARGET
    const firstHit = readings.find(r => r.chamber >= TARGET);
    const riseTime = firstHit ? firstHit.elapsed : null;

    // Peak overshoot
    const peakTemp = Math.max(...readings.map(r => r.chamber));
    const overshoot = Math.max(0, peakTemp - TARGET);

    // Settling time: first reading after which ALL subsequent readings stay within ±STABLE_BAND
    let settleTime = null;
    if (firstHit) {
        const afterCross = readings.filter(r => r.elapsed >= firstHit.elapsed);
        for (let i = 0; i < afterCross.length - STABLE_WINDOW; i++) {
            const window = afterCross.slice(i, i + STABLE_WINDOW);
            if (window.every(r => Math.abs(r.chamber - TARGET) <= STABLE_BAND)) {
                settleTime = afterCross[i].elapsed;
                break;
            }
        }
    }

    // Steady-state error: average deviation over last 20 readings
    const tail = readings.slice(-20);
    const ssError = tail.reduce((s, r) => s + (r.chamber - TARGET), 0) / tail.length;
    const ssStd = Math.sqrt(tail.reduce((s, r) => s + Math.pow(r.chamber - TARGET - ssError, 2), 0) / tail.length);

    // Oscillation check: count zero-crossings of (chamber - target) in last 60 readings
    const last60 = readings.slice(-60);
    let zeroCrossings = 0;
    for (let i = 1; i < last60.length; i++) {
        const prev = last60[i-1].chamber - TARGET;
        const curr = last60[i].chamber   - TARGET;
        if (prev * curr < 0) zeroCrossings++;
    }

    console.log('\n╔══════════════════════════════════════╗');
    console.log('║       STEP RESPONSE ANALYSIS         ║');
    console.log('╚══════════════════════════════════════╝');
    console.log(`  Start temp      : ${startTemp.toFixed(1)}°F`);
    console.log(`  Target          : ${TARGET}°F`);
    console.log(`  Total rise      : ${totalRise.toFixed(1)}°F`);
    console.log(`  Rise time       : ${riseTime !== null ? riseTime + 's' : 'not reached'}`);
    console.log(`  Peak temp       : ${peakTemp.toFixed(1)}°F`);
    console.log(`  Overshoot       : ${overshoot.toFixed(1)}°F`);
    console.log(`  Settle time     : ${settleTime !== null ? settleTime + 's' : 'not reached'}`);
    console.log(`  Steady-state Δ  : ${ssError > 0 ? '+' : ''}${ssError.toFixed(1)}°F (σ=${ssStd.toFixed(1)}°F)`);
    console.log(`  Oscillations    : ${zeroCrossings} zero-crossings (last 60 readings)`);
    console.log(`  Total readings  : ${readings.length}`);
    console.log(`  Log file        : ${LOG_FILE}`);
    console.log('');

    // Tuning recommendation
    console.log('── TUNING ASSESSMENT ────────────────────');
    if (riseTime === null) {
        console.log('  ⚠ Never reached target — increase Kp');
    } else {
        if (overshoot > 10) console.log('  ⚠ Large overshoot — reduce Kp or increase Kd');
        else if (overshoot > 5) console.log('  ! Moderate overshoot — slight Kd increase may help');
        else console.log('  ✓ Overshoot acceptable');

        if (zeroCrossings > 8) console.log('  ⚠ Oscillating — reduce Kp and Ki');
        else if (zeroCrossings > 4) console.log('  ! Mild oscillation — small Kp/Ki reduction');
        else console.log('  ✓ No significant oscillation');

        if (Math.abs(ssError) > 3) console.log(`  ⚠ Steady-state error ${ssError.toFixed(1)}°F — increase Ki`);
        else console.log('  ✓ Steady-state error acceptable');

        if (ssStd > 3) console.log(`  ⚠ High variance (σ=${ssStd.toFixed(1)}°F) — increase Kd`);
        else console.log('  ✓ Variance acceptable');
    }
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
}

process.on('SIGINT', () => shutdown('user interrupt'));
