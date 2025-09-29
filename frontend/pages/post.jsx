import { Heart, Share2, UserPlus } from "lucide-react";

export default function PostSection({ postData }) {
  const post = postData || {
    user: {
      profilePic: "https://randomuser.me/api/portraits/men/65.jpg",
      username: "john_doe",
    },
    title: "My Weekend Trip 🌄",
    content:
      "Just came back from the mountains! Amazing view and refreshing experience. Just came back from the mountains! Amazing view and refreshing experience.",
    img: "https://picsum.photos/400/300?random=1",
    time: "2h ago",
  };

  const comments = [
    {
      profilePic: "https://randomuser.me/api/portraits/women/65.jpg",
      username: "alice_09",
      comment: "Wow! Looks amazing!",
      time: "1h ago",
    },
    {
      profilePic: "https://randomuser.me/api/portraits/men/12.jpg",
      username: "bob_77",
      comment: "I want to go there too!",
      time: "30m ago",
    },
  ];

  return (
    <div className="flex gap-4 max-w-6xl mx-auto p-6">
      {/* Left Side - Post 70% */}
      <div className="flex-1 basis-7/10 border rounded-lg shadow-md p-4 flex flex-col gap-4 bg-white">
        {/* User Info + Follow */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={post.user.profilePic}
              alt={post.user.username}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex flex-col">
              <h4 className="font-bold">{post.user.username}</h4>
              <span className="text-gray-500 text-sm">{post.time}</span>
            </div>
          </div>
            <button className="flex items-center gap-1 px-4 py-2 bg-black text-white rounded-xl">
              <UserPlus className="w-4 h-4" /> Follow
            </button>
        </div>

        {/* Like & Share Buttons ABOVE */}
        <div className="flex items-center gap-4 mt-2">
          <button className="flex items-center gap-1 text-gray-700 hover:text-red-500 transition">
            <Heart className="w-5 h-5" /> Like
          </button>
          <button className="flex items-center gap-1 text-gray-700 hover:text-blue-500 transition">
            <Share2 className="w-5 h-5" /> Share
          </button>
        </div>

        {/* Title + Image + Content */}
        <div className="flex flex-col gap-3 mt-2">
          <h2 className="text-4xl font-semibold">{post.title}</h2>
          {post.img && (
            <img
              src={post.img}
              alt={post.title}
              className="w-full h-64 object-cover rounded-md"
            />
          )}
          <p className="text-gray-700">{post.content}</p>
        </div>
      </div>

      {/* Right Side - Comments 30% */}
      <div className="flex flex-col basis-3/10 gap-4">
        <h3 className="text-2xl font-semibold">Comments</h3>

        {/* Comment input */}
        <div className="flex flex-col gap-2">
          <textarea
            placeholder="Write a comment..."
            className="border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:border-black bg-white/80"
            rows={4}
          />
          <button className="px-3 py-1 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition">
            Comment
          </button>
        </div>

        {/* Comments list */}
        <div className="flex flex-col gap-3 mt-2">
          {comments.map((c, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <img
                  src={c.profilePic}
                  alt={c.username}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex flex-col">
                  <h4 className="font-semibold text-sm">{c.username}</h4>
                  <span className="text-gray-500 text-xs">{c.time}</span>
                </div>
              </div>
              <p className="text-gray-700 text-sm">{c.comment}</p>
              <div className="border-t border-black mt-1"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
