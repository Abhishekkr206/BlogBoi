import { useState, useEffect } from "react";
import { useEditUserMutation } from "../features/user/userApi";
import { useSelector } from "react-redux";
import { useToast } from "../components/Toast";
import { useNavigate } from "react-router-dom";
import { LoaderOne as Spinner } from "../components/spinner";

export default function ProfileEdit() {
  // ALL HOOKS MUST COME FIRST - before any conditional returns
  const [editPost] = useEditUserMutation();
  const { showError, showMessage } = useToast();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    profileimg: null,
    name: "",
    bio: "",
  });

  const [loading, setLoading] = useState(false);

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        profileimg: user.profileimg || null,
        name: user.name || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  // NOW we can do conditional rendering after all hooks are called
  if (!user) {
    return <Spinner />;
  }

  const userid = user._id;

  // Handle form input change (text or file)
  const handleChanges = (e) => {
    if (e.target.type === "file") {
      const file = e.target.files[0];

      // File size validation: max 5MB
      if (file && file.size > 5 * 1024 * 1024) {
        showError("File size must be under 5MB");
        return;
      }

      setFormData({ ...formData, profileimg: file });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  // Submit profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const body = new FormData();
      body.append("name", formData.name);
      body.append("bio", formData.bio);

      if (formData.profileimg) {
        body.append("profileimg", formData.profileimg);
      }

      await editPost({ userid, body }).unwrap();

      setFormData({ profileimg: null, name: "", bio: "" });
      showMessage("Profile updated successfully");
      navigate(`/user/${userid}`);
    } catch (err) {
      showError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely get image URL
  const getProfileImageUrl = () => {
    if (formData.profileimg instanceof File) {
      return URL.createObjectURL(formData.profileimg);
    }
    return formData.profileimg || "/default-avatar.svg";
  };

  return (
    <div className="min-h-screen bg-white/10 text-black px-8 py-5">
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Edit Profile</h2>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            
            {/* Profile image preview + upload button */}
            <div className="flex flex-col gap-1 items-center">
              <div className="relative">
                <img
                  src={getProfileImageUrl()}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border border-black p-1"
                />

                <label
                  htmlFor="profileimg"
                  className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </label>

                <input
                  id="profileimg"
                  type="file"
                  name="profileimg"
                  accept="image/*"
                  onChange={handleChanges}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-600">Max file size: 5MB</p>
            </div>

            {/* Name field */}
            <div className="flex flex-col gap-1">
              <label className="font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChanges}
                className="w-full p-3 rounded-xl border border-black/20 bg-white outline-none"
                placeholder="Enter your name"
              />
            </div>

            {/* Bio field */}
            <div className="flex flex-col gap-1">
              <label className="font-medium">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChanges}
                className="w-full p-3 rounded-xl border border-black/20 bg-white outline-none resize-none"
                rows={4}
                placeholder="Tell us about yourself"
              ></textarea>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="self-start px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-60"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}