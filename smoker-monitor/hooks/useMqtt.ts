'use client'

import { useEffect, useRef, useState } from 'react'
import mqtt from 'mqtt'
import { mqttConfig } from '@/lib/mqttConfig'

interface HistoryEntry {
  time: string
  chamber: number
  meat: number
}

interface SmokerState {
  chamberTemp: number | null
  meatTemp: number | null
  targetTemp: number
  ssrStatus: boolean
  connected: boolean
  history: HistoryEntry[]
  isRunning: boolean
  elapsedSeconds: number
  cookTimerMinutes: number | null
  setTargetTemp: (temp: number) => void
  startSmoker: () => void
  stopSmoker: () => void
  setCookTimer: (minutes: number | null) => void
}

export function useMqtt(): SmokerState {
  const [chamberTemp, setChamberTemp] = useState<number | null>(null)
  const [meatTemp, setMeatTemp] = useState<number | null>(null)
  const [targetTemp, setTargetTempState] = useState<number>(225)
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
      try {
        const data = JSON.parse(payload.toString())

        if (topic === mqttConfig.topics.chamber && data.chamber !== undefined) {
          setChamberTemp(data.chamber)
        }
        if (topic === mqttConfig.topics.meat && data.meat !== undefined) {
          setMeatTemp(data.meat)
        }
        if (topic === mqttConfig.topics.target && data.target !== undefined) {
          setTargetTempState(data.target)
        }
        if (topic === mqttConfig.topics.ssr && data.ssr !== undefined) {
          setSsrStatus(data.ssr)
        }

        // Handle combined payload
        if (data.chamber !== undefined && data.meat !== undefined) {
          setChamberTemp(data.chamber)
          setMeatTemp(data.meat)
          if (data.target !== undefined) setTargetTempState(data.target)
          if (data.ssr !== undefined) setSsrStatus(data.ssr)

          const now = new Date()
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          setHistory(prev => {
            const entry: HistoryEntry = { time: timeStr, chamber: data.chamber, meat: data.meat }
            const next = [...prev, entry]
            return next.length > 60 ? next.slice(next.length - 60) : next
          })
        }
      } catch {
        // ignore malformed messages
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
      clientRef.current.publish(mqttConfig.topics.target, String(temp))
    }
  }

  const startSmoker = () => {
    startTimeRef.current = Date.now()
    isRunningRef.current = true
    setIsRunning(true)
    setElapsedSeconds(0)
    if (clientRef.current?.connected) {
      clientRef.current.publish(mqttConfig.topics.power, 'on')
    }
  }

  const stopSmoker = () => {
    isRunningRef.current = false
    startTimeRef.current = null
    setIsRunning(false)
    setElapsedSeconds(0)
    if (clientRef.current?.connected) {
      clientRef.current.publish(mqttConfig.topics.power, 'off')
    }
  }

  const setCookTimer = (minutes: number | null) => {
    cookTimerRef.current = minutes
    setCookTimerMinutesState(minutes)
  }

  return {
    chamberTemp, meatTemp, targetTemp, ssrStatus, connected, history,
    isRunning, elapsedSeconds, cookTimerMinutes,
    setTargetTemp, startSmoker, stopSmoker, setCookTimer,
  }
}
