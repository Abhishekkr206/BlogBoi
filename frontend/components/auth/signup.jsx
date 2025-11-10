import { useState } from "react";
import {
  useSignupMutation,
  useGoogleMutation,
  useValidateOtpMutation,
} from "../../features/auth/authApi";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { LoaderOne as Spinner } from "../spinner";
import { useToast } from "../Toast";

export default function SignupForm() {
  // RTK Query mutations
  const [signup] = useSignupMutation();
  const [google] = useGoogleMutation();
  const [validateOtp] = useValidateOtpMutation();

  const { showMessage } = useToast();
  const navigate = useNavigate();

  // UI states
  const [showOtp, setShowOtp] = useState(false); // switch between signup form & OTP screen
  const [isGoogleSignup, setIsGoogleSignup] = useState(false); // true when user signs up using Google
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form input states
  const [formData, setFormData] = useState({
    profileimg: "",
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    otp: "",
  });

  // Handle input value change
  const handleChanges = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // clear errors while typing
  };

  // Google auth success handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await google({ token: credentialResponse.credential }).unwrap();

      // If user already exists → login directly
      if (res.user && res.user._id) {
        localStorage.setItem("user", JSON.stringify(res.user));
        navigate("/");
      } else {
        // New Google user → auto-fill form & skip password
        setFormData((prev) => ({
          ...prev,
          email: res.user.email,
          firstName: res.user.name.split(" ")[0] || "",
          lastName: res.user.name.split(" ").slice(1).join(" ") || "",
          password: "",
          profileimg: res.user.picture || null,
        }));
        setIsGoogleSignup(true);
      }
    } catch (err) {
      setError("Google authentication failed");
    }
  };

  // Loading UI while signup request is happening
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gray-50/20">
        <Spinner />
      </div>
    );
  }

  // Normal or Google signup (without OTP yet)
  const handleDone = async (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    let newValue = value;

    if (name === "email") {
      newValue = newValue.replace(/\s/g, ""); // remove spaces
      newValue = newValue.toLowerCase();     // convert to lowercase
    }

    setError("");

    try {
      setIsLoading(true);

      const res = await signup({
        profileimg: formData.profileimg,
        username: formData.username,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password || null,
        google: isGoogleSignup,
      }).unwrap();

      // Google signup: login instantly (no OTP)
      if (isGoogleSignup && res.user && res.user._id) {
        localStorage.setItem("user", JSON.stringify(res.user));
        navigate("/");
      }
      // Normal signup: move to OTP screen
      else if (!isGoogleSignup) {
        setShowOtp(true);
      }
    } catch (err) {
      setError(err?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP verification handler
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await validateOtp({
        email: formData.email,
        otp: formData.otp,
        username: formData.username,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        password: formData.password,
      }).unwrap();

      localStorage.setItem("user", JSON.stringify(res.user));
      navigate("/");
      showMessage("OTP verified successfully");
    } catch (err) {
      setError(err?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-white to-white/20 relative">
      {/* Subtle grid BG with radial fade */}
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

      <div className="flex items-center justify-center min-h-[82vh] px-4 sm:mx-0">
        <div className="max-w-md border rounded-lg shadow p-2 sm:p-6 bg-white z-10 mt-5 mx-4 sm:mx-0 w-full">
          <h2 className="text-3xl font-bold text-black mb-6 text-center">
            {showOtp ? "Verify OTP" : "Sign Up"}
          </h2>

          {/* Error message UI */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* ---------------- SIGNUP FORM ---------------- */}
          {!showOtp ? (
            <>
              {/* Google signup btn */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google authentication failed")}
                  text="signup_with"
                  size="large"
                  width="300"
                  shape="pill"
                />
              </div>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-sm text-gray-500">OR</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* Manual signup form */}
              <form className="flex flex-col gap-4" onSubmit={handleDone}>
                {/* Username */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    name="username"
                    onKeyDown={(e) => e.key === " " && e.preventDefault()}
                    value={formData.username}
                    onChange={handleChanges}
                    placeholder="Enter username"
                    required
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-black"
                  />
                </div>

                {/* Email */}
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

                {/* First / Last name */}
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

                {/* Password (skipped for Google signup) */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    minLength={8}
                    value={formData.password}
                    onChange={handleChanges}
                    placeholder="Enter password"
                    required={!isGoogleSignup}
                    disabled={isGoogleSignup}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-black disabled:bg-gray-100"
                  />
                  {isGoogleSignup && (
                    <p className="text-xs text-gray-500 mt-1">
                      No password needed for Google signup
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full bg-black text-white py-2 rounded-md font-semibold hover:bg-gray-800 transition"
                >
                  Done
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-black font-semibold hover:underline"
                  >
                    Login
                  </button>
                </p>
              </div>
            </>
          ) : (
            /* ---------------- OTP SCREEN ---------------- */
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
