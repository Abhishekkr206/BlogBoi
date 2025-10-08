import { Heart, MessageCircle } from "lucide-react";
import {IconHeartFilled} from "@tabler/icons-react"
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLikePostMutation, useDeleteLikeMutation} from "../features/post/postApi";
import { useState } from "react";

export default function PostCard({data}) {

  const navigate = useNavigate()
  const {_id, author, like, isliked, title, content,comment, createdAt } = data;
  console.log("ye dekh: ", isliked)

  const [likePost] = useLikePostMutation()
  const [deleteLike] = useDeleteLikeMutation()
  
  const [totalLikes, setTotalLikes] = useState(like.length)
  const [liked, setLiked] = useState(isliked);

  const handleSubmit = async (e)=>{
    e.preventDefault()
    e.stopPropagation();
    try{
      const postid = _id
      if (!liked) {
        setTotalLikes(prev => prev + 1);
        setLiked(true);

        await likePost(postid).unwrap()
      } else {
        setTotalLikes(prev => prev - 1);
        setLiked(false);

        await deleteLike(postid).unwrap()
      }
      // Reset 
    }
    catch(err){
      console.log(err)
    }
  } 
  
  
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
          className="flex border rounded-lg shadow-md p-3 gap-4 items-center max-w-3xl min-w-3xl min-h-[210px] bg-white z-10 cursor-pointer"
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
              <button className="flex items-center gap-1 cursor-pointer" onClick={handleSubmit}>
                {liked?<IconHeartFilled  className="w-5 h-5 text-red-500 " /> :<Heart className="w-5 h-5 text-red-500 " />}
                <span>{totalLikes}</span>
              </button>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <span>{comment}</span>
              </div>
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
