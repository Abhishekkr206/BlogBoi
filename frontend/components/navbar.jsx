import { Bell, MessageCircle, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full top-0 z-50 bg-white border-b border-gray-200 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center py-4">
        {/* Left side - Logo */}
        <Link to="/">
          <h1 className="text-3xl font-bold text-gray-900 transition-all">
            BlogBo!
          </h1>
        </Link>

        {/* Right side - Actions */}
        <div className="flex items-center gap-6">

          {/* Notification Bell */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all relative">
            <Bell className="w-6 h-6 text-gray-700" />
          </button>

          {/* Messages */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
            <MessageCircle className="w-6 h-6 text-gray-700" />
          </button>

          {/* Profile */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <User className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
    </nav>
  );
}