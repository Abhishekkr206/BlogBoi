export default function LoginForm() {
  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="w-full max-w-sm border rounded-lg shadow p-6 bg-white">
        <h2 className="text-3xl font-bold text-black mb-6 text-center">
          Login
        </h2>

        <form className="flex flex-col gap-4">
          {/* Email or Username */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Email or Username
            </label>
            <input
              type="text"
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
  );
}
