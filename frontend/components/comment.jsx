import { useNavigate } from "react-router-dom";
import { useDeleteCommentMutation } from "../features/comment/commentApi";
import { Trash2 } from "lucide-react";
import { useSelector } from "react-redux";

export default function CommentCard({comments}) {

  const [deleteComment] = useDeleteCommentMutation()
  const navigate = useNavigate()
  const data = comments

  const {_id, author, content, createdAt } = data;
  console.log("ye dekh comment info: ", data.post)

  const {user} = useSelector((state)=>state.auth)
  console.log("ye dekh user info: ", user)

  const authorId = author?._id;
  const postId = data?.post;

  const handleRedirect = (e)=>{
    e.stopPropagation();
    navigate(`/user/${author._id}`)
  }

  const handleDelete = async (e)=>{
    e.stopPropagation();
    if(user?._id !== authorId) return ;
    try{
      await deleteComment({authorId, postId ,commentId:_id}).unwrap()
    }
    catch(err){
      console.log(err)
    }
  }

  return (
    <div className="relative flex flex-col border border-gray-100 rounded-2xl p-5 shadow-sm bg-white hover:shadow-md transition-all duration-200 max-w-md">
      {/* Delete Button - Top Right */}
      {user?._id === authorId && (
      <button
        onClick={handleDelete}
        className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-black  transition-colors duration-200"
        aria-label="Delete comment"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      )}

      {/* top part - user info */}
      <div className="flex items-center gap-3 pr-8">
        <img
          src={author.profileimg}
          alt={author.username}
          className="w-11 h-11 rounded-full ring-2 ring-gray-50 object-cover"
        />
        <div>
          <div onClick={handleRedirect}>
            <h4 className="font-semibold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors">
              {author.username}
            </h4>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(createdAt).toLocaleString()}
          </span>        
        </div>
      </div>

      {/* comment text */}
      <div className="mt-3">
        <h3 className="text-gray-700 text-sm leading-relaxed">{content}</h3>
      </div>

      {/* reply button */}
      <div className="mt-3">
        <button className="text-gray-900 text-sm font-semibold hover:text-gray-700 transition-colors">
          Reply
        </button>
      </div>
    </div>
  );
}