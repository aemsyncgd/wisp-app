"use client"

import { useState } from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Weekly Workout Progress",
    },
  },
}

const labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function WorkoutProgress() {
  const [data] = useState({
    labels,
    datasets: [
      {
        label: "Workout Duration (minutes)",
        data: labels.map(() => Math.floor(Math.random() * 60) + 30),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  })

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Workout Progress</h2>
      <Bar options={options} data={data} />
    </div>
  )
}

