import Link from "next/link"
import { Home, Dumbbell, Calendar, Users, Award, Settings } from "lucide-react"

const menuItems = [
  { icon: Home, text: "Dashboard", href: "/" },
  { icon: Dumbbell, text: "Exercises", href: "/exercises" },
  { icon: Calendar, text: "Workouts", href: "/workouts" },
  { icon: Users, text: "Community", href: "/community" },
  { icon: Award, text: "Achievements", href: "/achievements" },
  { icon: Settings, text: "Settings", href: "/settings" },
]

export default function Sidebar() {
  return (
    <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <Link href="/" className="text-white flex items-center space-x-2 px-4">
        <Dumbbell className="w-8 h-8" />
        <span className="text-2xl font-extrabold">FitTrack Pro</span>
      </Link>
      <nav>
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 hover:text-white"
          >
            <item.icon className="inline-block w-6 h-6 mr-2 -mt-1" />
            {item.text}
          </Link>
        ))}
      </nav>
    </div>
  )
}

