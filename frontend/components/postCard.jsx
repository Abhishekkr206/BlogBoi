import { Heart, MessageCircle, Trash2 } from "lucide-react";
import {IconHeartFilled} from "@tabler/icons-react"
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLikePostMutation, useDeleteLikeMutation, useDeletePostMutation} from "../features/post/postApi";
import { useState, useEffect } from "react";

export default function PostCard({data}) {

  const navigate = useNavigate()
  const {_id, author, profileimg, like, isliked, title, content,comment, createdAt } = data;
  
  const currentUserId = useSelector((state) => state.auth.user?._id);
  const isProfileSection = data?.profileSection || false;
  
  const authorId = author?._id;
  const isAuthor = currentUserId === authorId;

  // 🔍 DEBUG - Remove these after fixing
  // console.log("=== POST CARD DEBUG ===");
  console.log("Full data:", data);
  // console.log("Current User ID:", currentUserId);
  // console.log("Author object:", author);
  // console.log("Author ID:", authorId);
  // console.log("isProfileSection:", isProfileSection);
  // console.log("isAuthor:", isAuthor);
  // console.log("Should show delete?", isProfileSection && isAuthor);
  // console.log("======================");

  const [likePost] = useLikePostMutation()
  const [deleteLike] = useDeleteLikeMutation()
  const [deletePost] = useDeletePostMutation()
  
  const [totalLikes, setTotalLikes] = useState(like)
  const [liked, setLiked] = useState(isliked);
  const [commentCount, setCommentCount] = useState(comment);

  useEffect(() => {
    setTotalLikes(like);
    setLiked(isliked);
    setCommentCount(comment);
  }, [like, isliked, comment]);

  const handleLike = async (e)=>{
    e.preventDefault()
    e.stopPropagation();
    try{
      const postid = _id
      if (!liked) {
        setTotalLikes(prev => prev + 1);
        setLiked(true);

        await likePost({authorId, postid}).unwrap()
      } else {
        setTotalLikes(prev => prev - 1);
        setLiked(false);

        await deleteLike({authorId, postid}).unwrap()
      }
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

  const stripHtml = (html) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
  };
  const handleRedirect = (e)=>{
    e.stopPropagation();
    navigate(`/user/${author._id}`)
  }

  const deletePostHandler = async (e)=>{
    e.preventDefault();
    e.stopPropagation();
    console.log("🗑️ Delete button clicked!");
    try{
      await deletePost({authorId, postid:_id}).unwrap()
      console.log("✅ Post deleted successfully");
    }
    catch(err){
      console.log("❌ Delete error:", err)
    }
  }

  return (
    <>
        <div 
          className="relative flex border rounded-lg shadow-md p-3 gap-4 items-center max-w-3xl min-w-3xl min-h-[210px] bg-white z-10 cursor-pointer"
          onClick={()=> navigate(`/post/${_id}`)}
          >
          
          {/* Delete Button - Show only if in profile section AND user is the author */}
          {isProfileSection && isAuthor && (
            <button
              onClick={deletePostHandler}
              className="absolute top-0.5 right-3 p-2 rounded-full text-gray-400 hover:text-black transition-colors duration-200 z-50"
              aria-label="Delete post"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}

          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div 
                className="flex items-center gap-2 hover:underline cursor-pointer"
                onClick={handleRedirect}
              >
                <img src={author.profileimg || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"}
                     alt={author.username}
                     className="w-10 h-10 rounded-full object-cover" />
                <h4 className="font-semibold">{author.username}</h4>
              </div>
              <span className="text-gray-500 text-sm">{new Date(createdAt).toLocaleString()}</span>
            </div>
              
            <div>
              <h2 className="font-bold text-lg">{title}</h2>
              <p className="text-gray-700 text-sm">
                {truncate(stripHtml(content), 200)}
              </p>            
            </div>
              
            <div className="flex items-center gap-4 pt-2">
              <button className="flex items-center gap-1 cursor-pointer" onClick={handleLike}>
                {liked?<IconHeartFilled  className="w-5 h-5 text-red-500 " /> :<Heart className="w-5 h-5 text-red-500 " />}
                <span>{totalLikes}</span>
              </button>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <span>{commentCount}</span>
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