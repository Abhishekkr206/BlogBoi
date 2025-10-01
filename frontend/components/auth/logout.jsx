import React from "react";
import { useLogoutMutation } from "../../features/auth/authApi"; 
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const [logout, { isLoading }] = useLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate("/login"); 
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-white 
        ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-gray-600 hover:bg-blue-700"} 
        transition disabled:opacity-75`}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
      ) : (
        "Logout"
      )}
    </button>
  );
};

export default LogoutButton;
