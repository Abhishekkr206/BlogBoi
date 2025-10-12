import { useState } from "react"
import { useEditUserMutation } from "../features/user/userApi"
import { useSelector } from "react-redux"

export default function ProfileEdit() {
    const [editPost] = useEditUserMutation()

    const user = useSelector((state) => state.auth.user);
    const userid = user?._id;
    console.log(user)
    
    const [formData, setFormData] = useState({
        profileimg: null,
        name: "",
        bio: "",
    })
    
    const handleChanges = (e) => {
        if (e.target.type === "file") {
            setFormData({ ...formData, profileimg: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const body = new FormData()
            body.append("name", formData.name)
            body.append("bio", formData.bio)

            if (formData.profileimg) {
                body.append("profileimg", formData.profileimg)
            }
            await editPost({userid, body}).unwrap()

            console.log("Profile updated successfully")
            setFormData({ profileimg: null, name: "", bio: "" })
        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        <>
            <div className="min-h-screen bg-white/10 text-black px-8 py-5">
                <div className="max-w-xl mx-auto">
                    <h2 className="text-2xl font-semibold mb-6">Edit Profile</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1 items-center">
                                <div className="relative">
                                    <img 
                                        src={formData.profileimg ? URL.createObjectURL(formData.profileimg) : user?.profileimg || "/default-avatar.png"} 
                                        alt="Profile" 
                                        className="w-32 h-32 rounded-full object-cover border-4 border-black/10"
                                    />
                                    <label 
                                        htmlFor="profileimg" 
                                        className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
                            </div>
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
                            <button 
                                type="submit" 
                                className="self-start px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}