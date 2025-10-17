import { useState } from "react";
import { useSignupMutation } from "../../features/auth/authApi";
import { useNavigate  } from "react-router-dom";

export default function SignupForm() {
  const [signup] = useSignupMutation();
  const navigate = useNavigate(); 

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });

  // handle input changes
  const handleChanges = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await signup({
        username: formData.username,
        name: formData.firstName,
        email: formData.email,
        password: formData.password,
      }).unwrap();

      localStorage.setItem("user", JSON.stringify(res.user));

      console.log("Signup successful:", res);
      
      navigate("/")

    } catch (err) {
      console.error("Signup failed:", err);
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
            Sign Up
          </h2>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* Username */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChanges}
                placeholder="Enter username"
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
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-black"
              />
            </div>

            {/* First Name & Last Name side by side */}
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

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChanges}
                placeholder="Enter password"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-black"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-2 w-full bg-black text-white py-2 rounded-md font-semibold hover:bg-gray-800 transition"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
