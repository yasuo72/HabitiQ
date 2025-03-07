'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getConsistentISOString, formatDate } from '../src/utils/dateUtils'

// Utility function to extract health metrics from text
function extractHealthMetrics(text) {
  // Simple implementation - you can enhance this based on your needs
  return {
    sleep: null,
    exercise: null,
    symptoms: [],
    energy: null
  }
}

// Utility function to generate a stable ID
function generateStableId() {
  return Math.random().toString(36).substring(2, 15)
}

export default function JournalSection({ onMetricsUpdate }) {
  const [entries, setEntries] = useState([])
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleNewEntry = (text) => {
    const metrics = extractHealthMetrics(text)
    const timestamp = getConsistentISOString()
    const newEntry = {
      id: generateStableId(),
      text,
      timestamp,
      metrics
    }

    setEntries(prev => [newEntry, ...prev])
    onMetricsUpdate(prev => ({
      sleep: [...prev.sleep, { date: timestamp, value: metrics.sleep }].filter(x => x.value),
      exercise: [...prev.exercise, { date: timestamp, value: metrics.exercise }].filter(x => x.value),
      symptoms: [...prev.symptoms, { date: timestamp, value: metrics.symptoms }].filter(x => x.value?.length),
      energy: [...prev.energy, { date: timestamp, value: metrics.energy }].filter(x => x.value)
    }))
  }

  // Only render dynamic content after component mounts
  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Daily Check-in</h2>
          <div className="animate-pulse">
            <div className="h-[150px] bg-gray-200 rounded mb-4" />
            <div className="h-10 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 className="text-xl font-semibold mb-4">Daily Check-in</h2>
        <form onSubmit={(e) => {
          e.preventDefault()
          handleNewEntry(e.target.entry.value)
          e.target.reset()
        }}>
          <textarea
            name="entry"
            className="input min-h-[150px] mb-4"
            placeholder="How are you feeling today? Tell me about your sleep, exercise, symptoms..."
          />
          <button type="submit" className="btn-primary">
            Save Entry
          </button>
        </form>
      </motion.div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
        {entries.length === 0 ? (
          <p className="text-gray-500">Start your health journey by adding your first entry!</p>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
              >
                <p className="text-gray-800">{entry.text}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {formatDate(entry.timestamp, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}