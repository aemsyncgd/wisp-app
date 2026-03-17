"use client"

import { useState } from "react"
import { Dumbbell, ChevronRight } from "lucide-react"

const recommendations = [
  {
    id: 1,
    name: "High-Intensity Interval Training",
    description: "Boost your metabolism and burn fat with this HIIT workout.",
  },
  {
    id: 2,
    name: "Strength Training for Beginners",
    description: "Build muscle and improve overall strength with this beginner-friendly routine.",
  },
  {
    id: 3,
    name: "Yoga for Flexibility",
    description: "Increase your flexibility and reduce stress with this calming yoga session.",
  },
]

export default function AIRecommendations() {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">AI-Powered Workout Recommendations</h2>
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="border rounded-lg overflow-hidden">
            <button
              className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none"
              onClick={() => toggleExpand(rec.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Dumbbell className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="font-medium">{rec.name}</span>
                </div>
                <ChevronRight
                  className={`h-5 w-5 text-gray-400 transform transition-transform ${expandedId === rec.id ? "rotate-90" : ""}`}
                />
              </div>
            </button>
            {expandedId === rec.id && (
              <div className="px-4 py-2">
                <p className="text-gray-600">{rec.description}</p>
                <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-800">Start Workout</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

