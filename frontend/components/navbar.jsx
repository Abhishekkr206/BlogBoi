import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Home, User, PlusCircle, Bell, UserRound, LogOut } from "lucide-react";
import { useSelector } from "react-redux";
import { useLogoutMutation } from "../features/auth/authApi";

// Sidebar Component
export function Sidebar({ isExpanded, setIsExpanded }) {
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user?._id);

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    // { icon: Bell, label: "Notification", path: "/notifications" },
    { icon: User, label: "Profile", path: `/user/${user}` },
    { icon: PlusCircle, label: "New Post", path: "/creat" },
  ];

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate("/login"); 
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Don't show sidebar if user is not logged in
  if (!user) return null;

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div
        className={`${
          isExpanded ? "w-64" : "w-16"
        } bg-white border-r border-gray transition-all duration-300 flex-col h-screen fixed z-40 hidden md:flex`}
      >
        {/* Menu Button */}
        <div className="p-3 border-b border-gray-200">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg transition-all w-full flex items-center justify-start"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-3 py-5 p-3 rounded-lg transition-all w-full ${
                  isActive
                    ? "bg-blue-50 text-gray-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-gray-600" : ""}`} />
                {isExpanded && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all w-full justify-center"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Visible only on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-black z-40 safe-area-bottom mx-0.5 border-t border-l border-r rounded-t-xl">
        <nav className="flex justify-around items-center px-2 py-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? "text-blue-600" : ""}`} />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-xs">Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
}

// Navbar Component
export function Navbar() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user?._id);
  const profileimg = useSelector((state) => state.auth.user?.profileimg);

  return (
    <nav className="w-full bg-white border-b border-gray shadow-sm sticky top-0 z-30">
      <div className="px-4 md:px-6 flex justify-between items-center py-2">
        <Link to="/">
          <h1 className="text-3xl md:text-4xl text-gray-900 font-oswald cursor-pointer">BlogBo!</h1>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <button 
              onClick={() => navigate(`/user/${user}`)}
              className="p-2 hover:bg-gray-100 rounded-full transition-all"
            >
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center border cursor-pointer">
                {profileimg ? (
                  <img
                    src={profileimg}
                    alt='User Profile'
                    className="rounded-full w-9 h-9 object-cover"
                  />
                ) : (
                  <UserRound className="text-black" />
                )}
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => navigate("/login")}
                className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register/details")}
                className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium bg-black text-white hover:bg-gray-800 rounded-md transition"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}