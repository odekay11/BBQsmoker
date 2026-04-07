'use client'

import { useEffect, useRef, useState } from 'react'

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

export function useMockMqtt(): SmokerState {
  const [chamberTemp, setChamberTemp] = useState<number>(70)
  const [meatTemp, setMeatTemp] = useState<number>(40)
  const [targetTemp, setTargetTempState] = useState<number>(225)
  const [ssrStatus, setSsrStatus] = useState<boolean>(true)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const chamberRef = useRef(70)
  const meatRef = useRef(40)
  const targetRef = useRef(225)

  useEffect(() => {
    const interval = setInterval(() => {
      const target = targetRef.current

      // Chamber rises toward target at ~2°F per reading
      const chamberDelta = chamberRef.current < target ? Math.min(2, target - chamberRef.current) : 0
      chamberRef.current = Math.round((chamberRef.current + chamberDelta) * 10) / 10

      // Meat rises toward 145°F at ~0.5°F per reading
      const meatDelta = meatRef.current < 145 ? 0.5 : 0
      meatRef.current = Math.round((meatRef.current + meatDelta) * 10) / 10

      const newChamber = chamberRef.current
      const newMeat = meatRef.current

      setChamberTemp(newChamber)
      setMeatTemp(newMeat)
      setSsrStatus(newChamber < target - 5)

      const now = new Date()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      setHistory(prev => {
        const entry: HistoryEntry = { time: timeStr, chamber: newChamber, meat: newMeat }
        const next = [...prev, entry]
        return next.length > 60 ? next.slice(next.length - 60) : next
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const setTargetTemp = (temp: number) => {
    targetRef.current = temp
    setTargetTempState(temp)
  }

  return {
    chamberTemp,
    meatTemp,
    targetTemp,
    ssrStatus,
    connected: true,
    history,
    setTargetTemp,
  }
}
