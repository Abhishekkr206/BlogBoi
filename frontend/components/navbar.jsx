import { Bell, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full sticky top-0 z-50 bg-white/95 border-b-[1px] border-b-black/10 ">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-3">
        {/* Left side - Logo */}
        <Link to="/">
          <h1 className="text-4xl font-semibold text-black tracking-wide cursor-pointer hover:text-gray-700 transition" >
            BlogBo!
          </h1>
        </Link>

        {/* Right side - Icons */}
        <div className="flex items-center gap-5">
          <Bell className="w-6 h-6 text-black cursor-pointer hover:text-gray-700 transition" />
          <MessageCircle className="w-6 h-6 text-black cursor-pointer hover:text-gray-700 transition" />
        </div>
      </div>
    </nav>
  );
}
