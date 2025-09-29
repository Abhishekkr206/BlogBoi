export default function SignupForm() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="w-full max-w-md border rounded-lg shadow p-6">
        <h2 className="text-3xl font-bold text-black mb-6 text-center">
          Sign Up
        </h2>

        <form className="flex flex-col gap-4">
          {/* Username */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              placeholder="Enter username"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-black"
            />
          </div>

          {/* First Name & Last Name side by side */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[120px] flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                placeholder="First Name"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-black"
              />
            </div>
            <div className="flex-1 min-w-[120px] flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
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
              placeholder="Enter password"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-black"
            />
          </div>

          {/* Re-enter Password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Re-enter Password
            </label>
            <input
              type="password"
              placeholder="Re-enter password"
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
  );
}
