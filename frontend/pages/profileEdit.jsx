export default function ProfileEdit() {
    return(
        <>
            <div className="min-h-screen bg-white/10 text-black px-8 py-5">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-semibold mb-6">Edit Profile</h2>
                    <form>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="font-medium">Username</label>
                                <input type="text" className="w-full p-3 rounded-xl border border-black/20 bg-white outline-none" placeholder="Enter your username" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="font-medium">Bio</label>
                                <textarea className="w-full p-3 rounded-xl border border-black/20 bg-white outline-none resize-none" rows={4} placeholder="Tell us about yourself"></textarea>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="font-medium">Profile Picture</label>
                                <input type="file" accept="image/*" className="w-full" />
                            </div>
                            <button type="submit" className="self-start px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition">Save Changes</button>
                        </div>
                    </form>
                </div>
                
            </div>
        </>
    )
}