import { Bell, MessageCircle } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full sticky top-0 z-50  ">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-3">
        {/* Left side - Logo */}
        <h1 className="text-4xl font-semibold text-black tracking-wide cursor-pointer hover:text-gray-700 transition">
          BlogBo!
        </h1>

        {/* Right side - Icons */}
        <div className="flex items-center gap-5">
          <Bell className="w-6 h-6 text-black cursor-pointer hover:text-gray-700 transition" />
          <MessageCircle className="w-6 h-6 text-black cursor-pointer hover:text-gray-700 transition" />
        </div>
      </div>
    </nav>
  );
}
