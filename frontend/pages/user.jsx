import { Heart, MessageCircle } from "lucide-react";

export default function UserProfile() {
  const user = {
    profilePic: "https://randomuser.me/api/portraits/men/71.jpg",
    username: "john_doe",
    firstName: "John",
    lastName: "Doe",
    followers: 120,
    following: 80,
    posts: [
      {
        title: "My Weekend Trip 🌄",
        content: "Just came back from the mountains! Amazing view and refreshing experience.",
        img: "https://picsum.photos/300/200?random=1",
        like: 45,
        time: "2h ago",
      },
      {
        title: "Evening Walk 🌆",
        content: "Beautiful sunset captured on my evening walk. Nature is soothing!",
        img: "https://picsum.photos/300/200?random=2",
        like: 30,
        time: "5h ago",
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <div className="flex justify-between items-center border-b pb-4">
        {/* Left: Profile Pic + Username + Counts */}
        <div className="flex items-center gap-4">
          <img
            src={user.profilePic}
            alt={user.username}
            className="w-24 h-24 rounded-full"
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">{user.username}</h2>
              <div className="flex gap-4 text-gray-700 text-md ">
                <div className="hover:underline">
                  <span className="font-semibold">{user.followers}</span> Followers
                </div>
                <div className="hover:underline">
                  <span className="font-semibold">{user.following}</span> Following
                </div>
              </div>
            </div>
            <p className="text-gray-600">{user.firstName} {user.lastName}</p>
          </div>
        </div>

        {/* Right: Follow Button */}
        <button className="px-4 py-1 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition">
          Follow
        </button>
      </div>

      {/* Posts Section */}
      <div className="space-y-4">
        {user.posts.map((post, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row border rounded-lg shadow-md p-4 gap-4 max-w-2xl mx-auto bg-white"
          >
            {/* Left: Post content */}
            <div className="flex-1 flex flex-col gap-2">
              <h3 className="font-bold text-lg">{post.title}</h3>
              <p className="text-gray-700">{post.content}</p>

              {/* Likes + Comment */}
              <div className="flex items-center gap-4 pt-2 text-gray-600 text-sm">
                <div className="flex items-center gap-1">
                  <Heart className="w-5 h-5 text-red-500" />
                  {post.like}
                </div>
                <MessageCircle className="w-5 h-5" />
                <span>{post.time}</span>
              </div>
            </div>

            {/* Right: Post image */}
            {post.img && (
              <img
                src={post.img}
                alt={post.title}
                className="w-48 h-36 object-cover rounded-md flex-shrink-0"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
