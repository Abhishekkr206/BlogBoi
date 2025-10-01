import { useState } from "react";
import { useLoginMutation } from "../../features/auth/authApi";
import { useNavigate  } from "react-router-dom";

export default function LoginForm() {

  const [login] = useLoginMutation()
  const navigate = useNavigate(); 
  
  const [formData, setFormData] = useState({
    user:"",
    password:""
  })

  const handleChanges = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e)=>{
    e.preventDefault()

    try {
      const res = await login({
        user: formData.user,
        password: formData.password,
      }).unwrap();

      localStorage.setItem("user", JSON.stringify(res.user));

      console.log("Login successful:", res);
      
      navigate("/")

    } catch (err) {
      console.error("Login failed:", err);
    }
  }

  return (
    <>
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
        <div className="flex items-center justify-center min-h-[82vh] ">
          <div className="flex flex-col justify-center w-full max-w-[340px] min-h-[400px] border rounded-lg shadow p-6 bg-white z-10">
            <h2 className="text-3xl font-bold text-black mb-6 text-center">
              Login
            </h2>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {/* Email or Username */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700" >
                  Email or Username
                </label>
                <input
                  type="text"
                  name="user"
                  value= {formData.user}
                  onChange={handleChanges}
                  placeholder="Enter email or username"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>

              {/* Password */}
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
          </div>
        </div>
      </div>
    </>
  );
}
