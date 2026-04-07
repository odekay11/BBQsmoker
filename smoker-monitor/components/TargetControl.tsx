'use client'

import { useState } from 'react'

interface TargetControlProps {
  targetTemp: number
  onSetTarget: (temp: number) => void
}

const MIN_TEMP = 150
const MAX_TEMP = 350

export default function TargetControl({ targetTemp, onSetTarget }: TargetControlProps) {
  const [inputValue, setInputValue] = useState<number>(targetTemp)

  const clamp = (val: number) => Math.min(MAX_TEMP, Math.max(MIN_TEMP, val))

  const handleDecrement = () => setInputValue(prev => clamp(prev - 5))
  const handleIncrement = () => setInputValue(prev => clamp(prev + 5))
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val)) setInputValue(clamp(val))
  }
  const handleSet = () => onSetTarget(inputValue)

  return (
    <div className="bg-gray-800 rounded-2xl p-4">
      <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-3">Target Temperature</p>
      <p className="text-gray-300 text-sm mb-3">Current: <span className="text-white font-semibold">{targetTemp}°F</span></p>
      <div className="flex items-center gap-3">
        <button
          onClick={handleDecrement}
          className="w-12 h-12 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white text-2xl font-bold rounded-xl transition-colors"
          aria-label="Decrease by 5"
        >
          −
        </button>
        <input
          type="number"
          value={inputValue}
          onChange={handleChange}
          min={MIN_TEMP}
          max={MAX_TEMP}
          className="w-24 h-12 bg-gray-700 text-white text-center text-xl font-semibold rounded-xl border border-gray-600 focus:outline-none focus:border-orange-400"
        />
        <button
          onClick={handleIncrement}
          className="w-12 h-12 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white text-2xl font-bold rounded-xl transition-colors"
          aria-label="Increase by 5"
        >
          +
        </button>
        <button
          onClick={handleSet}
          className="flex-1 h-12 bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
        >
          Set
        </button>
      </div>
    </div>
  )
}
