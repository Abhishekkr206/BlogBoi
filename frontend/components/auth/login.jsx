import { useState } from "react";
import { useLoginMutation, useGoogleMutation } from "../../features/auth/authApi";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { useToast } from "../Toast";

export default function LoginForm() {
  // RTK Query mutations for login and Google login
  const [login] = useLoginMutation();
  const [google] = useGoogleMutation();

  const navigate = useNavigate();
  const { showMessage } = useToast();

  // Local error state for UI error message
  const [error, setError] = useState("");

  // Local form input state
  const [formData, setFormData] = useState({
    user: "",
    password: ""
  });

  // Handle text input changes
  const handleChanges = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user starts typing
  };

  // Handle Google Login response
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await google({ token: credentialResponse.credential }).unwrap();
      
      // If backend says user exists → login success
      if (res.user && res.user._id) {
        localStorage.setItem("user", JSON.stringify(res.user));
        navigate("/");
        showMessage("Logged in with Google successfully");
      } 
      else {
        // If new Google user → go to signup page
        navigate("/register/details");
      }

    } catch (err) {
      setError("Google authentication failed");
    }
  };

  // Handle normal email/username + password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    try {
      const res = await login({
        user: formData.user,
        password: formData.password,
      }).unwrap();

      // Store user info locally
      localStorage.setItem("user", JSON.stringify(res.user));

      navigate("/");
      showMessage("Logged in successfully");
    } catch (err) {
      // Show error returned from backend or default msg
      setError(err?.data?.message || "Login failed");
    }
  };

  return (
    <>
      <div className="min-h-full bg-gradient-to-b from-white to-white/20 relative mx-3 sm:mx-0">

        {/* Subtle background grid effect */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e2e8f0 1px, transparent 1px),
              linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
            `,
            backgroundSize: "20px 30px",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)",
          }}
        />

        <div className="flex items-center justify-center min-h-[82vh]">

          {/* Login Card */}
          <div className="flex flex-col justify-center w-full max-w-[400px] border rounded-lg shadow p-6 bg-white z-10">
            <h2 className="text-3xl font-bold text-black mb-6 text-center">
              Login
            </h2>

            {/* Error Box */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Google Login Button */}
            <div className="flex justify-center mb-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google authentication failed")}
                text="signin_with"
                size="large"
                width="300"
                shape="pill"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Login Form */}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              
              {/* Email / Username Field */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Email or Username
                </label>
                <input
                  type="text"
                  name="user"
                  value={formData.user}
                  onChange={handleChanges}
                  placeholder="Enter email or username"
                  required
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChanges}
                  placeholder="Enter password"
                  required
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="mt-2 w-full bg-black text-white py-2 rounded-md font-semibold hover:bg-gray-800 transition"
              >
                Login
              </button>
            </form>

            {/* Redirect to Signup */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/register/details")}
                  className="text-black font-semibold hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
