"use client"

import { useState } from "react"
import { Search } from "lucide-react"

const exercises = [
  { id: 1, name: "Push-ups", category: "Strength", equipment: "Bodyweight", difficulty: "Beginner" },
  { id: 2, name: "Squats", category: "Strength", equipment: "Bodyweight", difficulty: "Beginner" },
  { id: 3, name: "Plank", category: "Core", equipment: "Bodyweight", difficulty: "Intermediate" },
  { id: 4, name: "Lunges", category: "Strength", equipment: "Bodyweight", difficulty: "Beginner" },
  { id: 5, name: "Burpees", category: "Cardio", equipment: "Bodyweight", difficulty: "Advanced" },
]

export default function Exercises() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "All" || exercise.category === selectedCategory),
  )

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Exercise Library</h1>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search exercises..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <select
          className="w-full sm:w-48 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Strength">Strength</option>
          <option value="Cardio">Cardio</option>
          <option value="Core">Core</option>
        </select>
      </div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredExercises.map((exercise) => (
            <li key={exercise.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-indigo-600 truncate">{exercise.name}</h3>
                  <div className="ml-2 flex-shrink-0 flex">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        exercise.difficulty === "Beginner"
                          ? "bg-green-100 text-green-800"
                          : exercise.difficulty === "Intermediate"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {exercise.difficulty}
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">Category: {exercise.category}</p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      Equipment: {exercise.equipment}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

