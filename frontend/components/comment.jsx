export default function CommentCard({comments}) {
  // demo data
  const data = comments
  // {
  //   profilePic: "https://randomuser.me/api/portraits/men/12.jpg",
  //   username: "alex_09",
  //   comment: "This is such a great post! Really enjoyed reading it 👏",
  //   time: "30m ago",
  // };

  const { author, content, createdAt } = data;

  return (
    <div className="flex flex-col border rounded-lg p-3 shadow-sm bg-white max-w-md">
      {/* top part - user info */}
      <div className="flex items-center gap-3">
        <img
          src={author.profileimg}
          alt={author.username}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h4 className="font-semibold text-gray-800">{author.username}</h4>
          <span className="text-xs text-gray-500">
            {new Date(createdAt).toLocaleString()} {/* show readable date */}
          </span>        
          </div>
      </div>

      {/* comment text */}
      <div className="mt-2">
        <h3 className="text-gray-700 text-sm">{content}</h3>
      </div>

      {/* reply button */}
      <div className="mt-2">
        <button className="text-blue-600 text-sm font-medium hover:underline">
          Reply
        </button>
      </div>
    </div>
  );
}
