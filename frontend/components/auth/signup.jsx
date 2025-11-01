import { useState } from "react";
import { useSignupMutation, useGoogleMutation, useValidateOtpMutation } from "../../features/auth/authApi";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';

export default function SignupForm() {
  const [signup] = useSignupMutation();
  const [google] = useGoogleMutation();
  const [validateOtp] = useValidateOtpMutation();
  const navigate = useNavigate();

  const [showOtp, setShowOtp] = useState(false);
  const [isGoogleSignup, setIsGoogleSignup] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    profileimg: "",
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    otp: ""
  });

  const handleChanges = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await google({ token: credentialResponse.credential }).unwrap();
      
      // Existing user - login directly
      if (res.user && res.user._id) {
        localStorage.setItem("user", JSON.stringify(res.user));
        navigate("/");
      } else {
        // New user - just need username
        setFormData(prev => ({
          ...prev,
          email: res.user.email,
          firstName: res.user.name.split(' ')[0] || '',
          lastName: res.user.name.split(' ').slice(1).join(' ') || '',
          password: '' ,// No password needed for Google
          profileimg: res.user.picture || null
        }));
        setIsGoogleSignup(true);
      }
    } catch (err) {
      setError("Google authentication failed");
    }
  };

  const handleDone = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await signup({
        profileimg: formData.profileimg,
        username: formData.username,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password || null,
        google: isGoogleSignup
      }).unwrap();

      // Google signup - direct login, no OTP
      if (isGoogleSignup && res.user && res.user._id) {
        localStorage.setItem("user", JSON.stringify(res.user));
        navigate("/");
      } 
      // Regular signup - show OTP screen
      else if (!isGoogleSignup) {
        setShowOtp(true);
      }
    } catch (err) {
      setError(err?.data?.message || "Signup failed");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await validateOtp({
        email: formData.email,
        otp: formData.otp,
        username: formData.username,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        password: formData.password
      }).unwrap();

      localStorage.setItem("user", JSON.stringify(res.user));
      navigate("/");
    } catch (err) {
      setError(err?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-white to-white/20 relative">
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
      
      <div className="flex items-center justify-center min-h-[82vh] px-4">
        <div className="w-full max-w-md border rounded-lg shadow p-6 bg-white z-10">
          <h2 className="text-3xl font-bold text-black mb-6 text-center">
            {showOtp ? "Verify OTP" : "Sign Up"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {!showOtp ? (
            <>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google authentication failed")}
                  text="signup_with"
                  size="large"
                  width="400"
                  shape="pill"
                />
              </div>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-sm text-gray-500">OR</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              <form className="flex flex-col gap-4" onSubmit={handleDone}>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChanges}
                    placeholder="Enter username"
                    required
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChanges}
                    placeholder="Enter email"
                    required
                    disabled={isGoogleSignup}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-black disabled:bg-gray-100 disabled:text-gray-600"
                  />
                </div>

                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-[120px] flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChanges}
                      placeholder="First Name"
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex-1 min-w-[120px] flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChanges}
                      placeholder="Last Name"
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChanges}
                    placeholder="Enter password"
                    required={!isGoogleSignup}
                    disabled={isGoogleSignup}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-black disabled:bg-gray-100"
                  />
                  {isGoogleSignup && (
                    <p className="text-xs text-gray-500 mt-1">No password needed for Google signup</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full bg-black text-white py-2 rounded-md font-semibold hover:bg-gray-800 transition"
                >
                  Done
                </button>
              </form>

            </>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleVerifyOtp}>
              <p className="text-sm text-gray-600 text-center mb-2">
                Enter the OTP sent to {formData.email}
              </p>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">OTP Code</label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChanges}
                  placeholder="Enter OTP"
                  required
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-black text-center text-xl tracking-wider"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full bg-black text-white py-2 rounded-md font-semibold hover:bg-gray-800 transition"
              >
                Verify
              </button>

              <button
                type="button"
                onClick={() => setShowOtp(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}