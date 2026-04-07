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
  setTargetTemp: (temp: number) => void
}

export function useMqtt(): SmokerState {
  const [chamberTemp, setChamberTemp] = useState<number | null>(null)
  const [meatTemp, setMeatTemp] = useState<number | null>(null)
  const [targetTemp, setTargetTempState] = useState<number>(225)
  const [ssrStatus, setSsrStatus] = useState<boolean>(false)
  const [connected, setConnected] = useState<boolean>(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const clientRef = useRef<mqtt.MqttClient | null>(null)

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

    return () => {
      client.end()
    }
  }, [])

  const setTargetTemp = (temp: number) => {
    setTargetTempState(temp)
    if (clientRef.current?.connected) {
      clientRef.current.publish(mqttConfig.topics.target, String(temp))
    }
  }

  return { chamberTemp, meatTemp, targetTemp, ssrStatus, connected, history, setTargetTemp }
}
