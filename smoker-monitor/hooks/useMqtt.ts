'use client'

import { useEffect, useRef, useState } from 'react'
import mqtt from 'mqtt'
import { mqttConfig } from '@/lib/mqttConfig'

interface HistoryEntry {
  ts: number
  time: string
  chamber: number
  meat: number
}

interface SmokerState {
  chamberTemp: number | null
  meatTemp: number | null
  targetTemp: number
  targetMeatTemp: number
  ssrStatus: boolean
  connected: boolean
  history: HistoryEntry[]
  isRunning: boolean
  elapsedSeconds: number
  cookTimerMinutes: number | null
  setTargetTemp: (temp: number) => void
  setTargetMeatTemp: (temp: number) => void
  startSmoker: () => void
  stopSmoker: () => void
  setCookTimer: (minutes: number | null) => void
}

export function useMqtt(): SmokerState {
  const [chamberTemp, setChamberTemp] = useState<number | null>(null)
  const [meatTemp, setMeatTemp] = useState<number | null>(null)
  const [targetTemp, setTargetTempState] = useState<number>(225)
  const [targetMeatTemp, setTargetMeatTempState] = useState<number>(165)
  const [ssrStatus, setSsrStatus] = useState<boolean>(false)
  const [connected, setConnected] = useState<boolean>(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [cookTimerMinutes, setCookTimerMinutesState] = useState<number | null>(null)

  const clientRef = useRef<mqtt.MqttClient | null>(null)
  const isRunningRef = useRef(false)
  const startTimeRef = useRef<number | null>(null)
  const cookTimerRef = useRef<number | null>(null)
  const lastHistoryTimeRef = useRef<number>(0)
  const historyRef = useRef<HistoryEntry[]>([])

  useEffect(() => {
    const client = mqtt.connect(mqttConfig.url, mqttConfig.options)
    clientRef.current = client

    client.on('connect', () => {
      setConnected(true)
      Object.values(mqttConfig.topics).forEach(topic => {
        client.subscribe(topic)
      })
    })

    client.on('disconnect', () => setConnected(false))
    client.on('error', () => setConnected(false))
    client.on('offline', () => setConnected(false))

    client.on('message', (topic, payload) => {
      const raw = payload.toString()

      // Target temperatures are published as plain floats by the browser.
      // Handle them here (outside the JSON block) so retained messages sync
      // correctly on reconnect. Do NOT read these from the ESP32's combined
      // payload — the browser is the authoritative source, and letting the
      // ESP32 echo overwrite the local state causes the target to snap back
      // to the old value after every PID publish.
      if (topic === mqttConfig.topics.target) {
        const t = parseFloat(raw)
        if (!isNaN(t)) setTargetTempState(t)
      }
      if (topic === mqttConfig.topics.meatTarget) {
        const t = parseFloat(raw)
        if (!isNaN(t)) setTargetMeatTempState(t)
      }

      try {
        const data = JSON.parse(raw)

        if (topic === mqttConfig.topics.chamber && data.chamber !== undefined) {
          setChamberTemp(data.chamber)
        }
        if (topic === mqttConfig.topics.meat && data.meat !== undefined) {
          setMeatTemp(data.meat)
        }
        if (topic === mqttConfig.topics.ssr && data.ssr !== undefined) {
          setSsrStatus(data.ssr)
        }

        // Handle combined payload — note: target/meatTarget are intentionally
        // excluded here; see comment above.
        if (data.chamber !== undefined && data.meat !== undefined) {
          setChamberTemp(data.chamber)
          setMeatTemp(data.meat)
          if (data.ssr !== undefined) setSsrStatus(data.ssr)

          const nowMs = Date.now()
          if (isRunningRef.current && nowMs - lastHistoryTimeRef.current >= 5 * 60 * 1000) {
            lastHistoryTimeRef.current = nowMs
            const timeStr = new Date(nowMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
            const newEntry: HistoryEntry = { ts: nowMs, time: timeStr, chamber: data.chamber, meat: data.meat }
            const newHistory = [...historyRef.current, newEntry]
            historyRef.current = newHistory
            setHistory(newHistory)
            if (client.connected) {
              client.publish(mqttConfig.topics.sessionHistory, JSON.stringify(newHistory), { retain: true })
            }
          }
        }
      } catch {
        // ignore malformed messages
      }

      // Session state — plain string payloads, retained so late-joining browsers sync up
      if (topic === mqttConfig.topics.sessionStart) {
        if (raw) {
          const ts = Number(raw)
          if (!isNaN(ts)) {
            startTimeRef.current = ts
            isRunningRef.current = true
            setIsRunning(true)
          }
        } else {
          startTimeRef.current = null
          isRunningRef.current = false
          setIsRunning(false)
          setElapsedSeconds(0)
        }
      }

      if (topic === mqttConfig.topics.sessionCookTimer) {
        if (raw) {
          const mins = Number(raw)
          if (!isNaN(mins)) {
            cookTimerRef.current = mins
            setCookTimerMinutesState(mins)
          }
        } else {
          cookTimerRef.current = null
          setCookTimerMinutesState(null)
        }
      }

      if (topic === mqttConfig.topics.sessionHistory) {
        try {
          const parsed = JSON.parse(raw) as HistoryEntry[]
          if (Array.isArray(parsed)) {
            historyRef.current = parsed
            setHistory(parsed)
            if (parsed.length > 0) {
              lastHistoryTimeRef.current = parsed[parsed.length - 1].ts
            }
          }
        } catch { /* ignore malformed */ }
      }
    })

    // Stopwatch interval — uses refs to avoid stale closures
    const ticker = setInterval(() => {
      if (!isRunningRef.current || startTimeRef.current === null) return
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setElapsedSeconds(elapsed)

      if (cookTimerRef.current !== null && elapsed >= cookTimerRef.current * 60) {
        isRunningRef.current = false
        startTimeRef.current = null
        setIsRunning(false)
        if (client.connected) {
          client.publish(mqttConfig.topics.power, 'off')
          client.publish(mqttConfig.topics.sessionStart, '', { retain: true })
          client.publish(mqttConfig.topics.sessionCookTimer, '', { retain: true })
          client.publish(mqttConfig.topics.sessionHistory, '', { retain: true })
        }
      }
    }, 1000)

    return () => {
      client.end()
      clearInterval(ticker)
    }
  }, [])

  const setTargetTemp = (temp: number) => {
    setTargetTempState(temp)
    if (clientRef.current?.connected) {
      clientRef.current.publish(mqttConfig.topics.target, String(temp), { retain: true })
    }
  }

  const setTargetMeatTemp = (temp: number) => {
    setTargetMeatTempState(temp)
    if (clientRef.current?.connected) {
      clientRef.current.publish(mqttConfig.topics.meatTarget, String(temp), { retain: true })
    }
  }

  const startSmoker = () => {
    const now = Date.now()
    startTimeRef.current = now
    isRunningRef.current = true
    historyRef.current = []
    lastHistoryTimeRef.current = 0
    setIsRunning(true)
    setElapsedSeconds(0)
    setHistory([])
    if (clientRef.current?.connected) {
      clientRef.current.publish(mqttConfig.topics.power, 'on')
      clientRef.current.publish(mqttConfig.topics.sessionStart, String(now), { retain: true })
      clientRef.current.publish(mqttConfig.topics.sessionHistory, '[]', { retain: true })
    }
  }

  const stopSmoker = () => {
    isRunningRef.current = false
    startTimeRef.current = null
    setIsRunning(false)
    setElapsedSeconds(0)
    if (clientRef.current?.connected) {
      clientRef.current.publish(mqttConfig.topics.power, 'off')
      clientRef.current.publish(mqttConfig.topics.sessionStart, '', { retain: true })
      clientRef.current.publish(mqttConfig.topics.sessionCookTimer, '', { retain: true })
      clientRef.current.publish(mqttConfig.topics.sessionHistory, '', { retain: true })
    }
  }

  const setCookTimer = (minutes: number | null) => {
    cookTimerRef.current = minutes
    setCookTimerMinutesState(minutes)
    if (clientRef.current?.connected) {
      clientRef.current.publish(
        mqttConfig.topics.sessionCookTimer,
        minutes !== null ? String(minutes) : '',
        { retain: true }
      )
    }
  }

  return {
    chamberTemp, meatTemp, targetTemp, targetMeatTemp, ssrStatus, connected, history,
    isRunning, elapsedSeconds, cookTimerMinutes,
    setTargetTemp, setTargetMeatTemp, startSmoker, stopSmoker, setCookTimer,
  }
}
