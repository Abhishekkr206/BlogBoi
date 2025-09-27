import { FloatingDock } from "./floatingDock"
import { Home, Search, Edit2, User, Bell } from "lucide-react"

export default function FloatingDockDemo() {
  const links = [
    {
      title: "Post",
      icon: <Edit2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "Search",
      icon: <Search className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "Home",
      icon: <Home className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "Notification",
      icon: <Bell className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "User",
      icon: <User className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
  ]
  return (
    <div className="flex items-center justify-center pb-10">
      <FloatingDock
        items={links.slice(0, 5)}
      />
    </div>
  )
}
