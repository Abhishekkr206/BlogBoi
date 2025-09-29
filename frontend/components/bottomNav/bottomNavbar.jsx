import { FloatingDock } from "./floatingDock";
import { Home, Search, Edit2, User, Sun } from "lucide-react";

export default function FloatingDockDemo() {
  const links = [
    {
      title: "Post",
      icon: <Edit2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/creat",
    },
    {
      title: "Search",
      icon: <Search className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/post",
    },
    {
      title: "Home",
      icon: <Home className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/",
    },
    {
      title: "Light",
      icon: <Sun className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
    {
      title: "User",
      icon: <User className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/user",
    },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <FloatingDock items={links.slice(0, 5)} />
    </div>
  );
}
