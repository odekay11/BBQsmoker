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

export function useMockMqtt(): SmokerState {
  const [chamberTemp, setChamberTemp] = useState<number>(70)
  const [meatTemp, setMeatTemp] = useState<number>(40)
  const [targetTemp, setTargetTempState] = useState<number>(225)
  const [targetMeatTemp, setTargetMeatTempState] = useState<number>(165)
  const [ssrStatus, setSsrStatus] = useState<boolean>(true)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [cookTimerMinutes, setCookTimerMinutesState] = useState<number | null>(null)

  const chamberRef = useRef(70)
  const meatRef = useRef(40)
  const targetRef     = useRef(225)
  const meatTargetRef = useRef(165)
  const isRunningRef = useRef(false)
  const startTimeRef = useRef<number | null>(null)
  const cookTimerRef = useRef<number | null>(null)
  const lastHistoryTimeRef = useRef<number>(0)

  useEffect(() => {
    const dataInterval = setInterval(() => {
      const target = targetRef.current

      // Chamber rises toward target at ~2°F per reading
      const chamberDelta = chamberRef.current < target ? Math.min(2, target - chamberRef.current) : 0
      chamberRef.current = Math.round((chamberRef.current + chamberDelta) * 10) / 10

      // Meat rises toward meatTarget at ~0.5°F per reading
      const meatDelta = meatRef.current < meatTargetRef.current ? 0.5 : 0
      meatRef.current = Math.round((meatRef.current + meatDelta) * 10) / 10

      const newChamber = chamberRef.current
      const newMeat = meatRef.current

      setChamberTemp(newChamber)
      setMeatTemp(newMeat)
      setSsrStatus(newChamber < target - 5)

      const nowMs = Date.now()
      if (nowMs - lastHistoryTimeRef.current >= 5 * 60 * 1000) {
        lastHistoryTimeRef.current = nowMs
        const timeStr = new Date(nowMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        setHistory(prev => [...prev, { time: timeStr, chamber: newChamber, meat: newMeat }])
      }
    }, 2000)

    // Stopwatch interval — uses refs to avoid stale closures
    const ticker = setInterval(() => {
      if (!isRunningRef.current || startTimeRef.current === null) return
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setElapsedSeconds(elapsed)

      if (cookTimerRef.current !== null && elapsed >= cookTimerRef.current * 60) {
        isRunningRef.current = false
        startTimeRef.current = null
        setIsRunning(false)
      }
    }, 1000)

    return () => {
      clearInterval(dataInterval)
      clearInterval(ticker)
    }
  }, [])

  const setTargetTemp = (temp: number) => {
    targetRef.current = temp
    setTargetTempState(temp)
  }

  const setTargetMeatTemp = (temp: number) => {
    meatTargetRef.current = temp
    setTargetMeatTempState(temp)
  }

  const startSmoker = () => {
    startTimeRef.current = Date.now()
    isRunningRef.current = true
    setIsRunning(true)
    setElapsedSeconds(0)
  }

  const stopSmoker = () => {
    isRunningRef.current = false
    startTimeRef.current = null
    setIsRunning(false)
    setElapsedSeconds(0)
  }

  const setCookTimer = (minutes: number | null) => {
    cookTimerRef.current = minutes
    setCookTimerMinutesState(minutes)
  }

  return {
    chamberTemp,
    meatTemp,
    targetTemp,
    targetMeatTemp,
    ssrStatus,
    connected: true,
    history,
    isRunning,
    elapsedSeconds,
    cookTimerMinutes,
    setTargetTemp,
    setTargetMeatTemp,
    startSmoker,
    stopSmoker,
    setCookTimer,
  }
}
