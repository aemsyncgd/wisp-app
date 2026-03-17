import { Calendar } from "lucide-react"

const workouts = [
  { id: 1, name: "Full Body Workout", date: "2023-06-01", duration: "45 min" },
  { id: 2, name: "Upper Body Strength", date: "2023-05-30", duration: "60 min" },
  { id: 3, name: "HIIT Cardio", date: "2023-05-28", duration: "30 min" },
  { id: 4, name: "Leg Day", date: "2023-05-26", duration: "50 min" },
]

export default function RecentWorkouts() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Recent Workouts</h2>
      <div className="flow-root">
        <ul className="-my-5 divide-y divide-gray-200">
          {workouts.map((workout) => (
            <li key={workout.id} className="py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{workout.name}</p>
                  <p className="text-sm text-gray-500">{workout.date}</p>
                </div>
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {workout.duration}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <a
          href="#"
          className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          View all workouts
        </a>
      </div>
    </div>
  )
}

