import { useEffect, useState } from "react"

export default function ProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate backend fetch delay
    setTimeout(() => {
      setProgress(42) // Replace with real fetch later
    }, 500)
  }, [])

  return (
    <div className="w-full max-w-lg">
      <div className="w-full bg-gray-200 h-4 rounded-full">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm mt-2 text-center">{progress}% complete</p>
    </div>
  )
}
