import { Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function PostCard({data}) {
  // const data = {
  //   profilePic: "https://randomuser.me/api/portraits/women/45.jpg",
  //   username: "sarah_01",
  //   like: 89,
  //   title: "Evening Walk 🌆",
  //   content:
  //     "Captured this beautiful sunset on my evening walk. Nature never disappoints!  The colors were absolutely stunning and calming after The colors were  The colors were absolutely stunning and calming after The colors were  The colors were absolutely stunning and calming after The colors were absolutely stunning and calming after a long day. 🌅✨",
  //   img: "https://picsum.photos/200/150?random=4",
  //   time: "1h ago",
  // };

  const navigate = useNavigate()
  const {_id, author, like, title, content, createdAt } = data;
  
  let {img} = data
  if(img == "") img = null

  // limit function
  const truncate = (text, limit) => {
    if (!text) return "";
    return text.length > limit ? text.slice(0, limit) + "..." : text;
  };

  const handleRedirect = (e)=>{
    e.stopPropagation();
    navigate(`/user/${author._id}`)
  }

  console.log(data)
  return (
    <>
        <div 
          className="flex border rounded-lg shadow-md p-3 gap-4 items-center max-w-3xl min-w-3xl min-h-[210px] bg-white z-10"
          onClick={()=> navigate(`/post/${_id}`)}
          >
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-center ">
              <div 
                className="flex items-center gap-2 hover:underline cursor-pointer"
                onClick={handleRedirect}
              >
                <img src={author.profileimg || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"}
                     alt={author.username}
                     className="w-10 h-10 rounded-full" />
                <h4 className="font-semibold">{author.username}</h4>
              </div>
              <span className="text-gray-500 text-sm">{new Date(createdAt).toLocaleString()}</span>
            </div>
              
            <div>
              <h2 className="font-bold text-lg">{title}</h2>
              <p className="text-gray-700 text-sm">{truncate(content, 200)}</p>
            </div>
              
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1">
                <Heart className="w-5 h-5 text-red-500" />
                <span>{like}</span>
              </div>
              <MessageCircle className="w-5 h-5 text-gray-600" />
            </div>
          </div>
              
          {img && (
            <div className="flex-shrink-0">
              <img src={img} alt={title} className="rounded-md w-48 h-36 object-cover" />
            </div>
          )}
        </div>
    </>
  );
}
