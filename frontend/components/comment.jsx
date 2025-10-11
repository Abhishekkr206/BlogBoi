import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteCommentMutation, useGetRepliesQuery, useAddReplyMutation, useDeleteReplyMutation } from "../features/comment/commentApi";
import { Trash2 } from "lucide-react";
import { useSelector } from "react-redux";

export default function CommentCard({comments}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");

  const { data: replyData, isLoading } = useGetRepliesQuery(comments._id, {
    skip: !showReplies
  });
  const [addReply] = useAddReplyMutation();
  const [deleteReply] = useDeleteReplyMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const navigate = useNavigate();
  
  const {_id, author, content, createdAt, post } = comments;
  const {user} = useSelector((state)=>state.auth);

  const handleRedirect = (e)=>{
    e.stopPropagation();
    navigate(`/user/${author._id}`);
  }

  const handleDelete = async (e)=>{
    e.stopPropagation();
    if(user?._id !== author?._id) return;
    try{
      await deleteComment({authorId: author._id, postId: post, commentId: _id}).unwrap();
    }
    catch(err){
      console.log(err);
    }
  }

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if(!replyText.trim()) return;
    
    try {
      await addReply({
        commentId: _id,
        content: replyText,
      }).unwrap();
      setReplyText("");
    } catch(err) {
      console.log(err);
    }
  }

  const handleDeleteReply = async (replyId) => {
    try {
      await deleteReply({
        commentId: _id,
        replyId,
        postId: post
      }).unwrap();
    } catch(err) {
      console.log(err);
    }
  }

  return (
    <div className="relative flex flex-col border border-gray-100 rounded-2xl p-5 shadow-sm bg-white hover:shadow-md transition-all duration-200 max-w-md">
      {user?._id === author?._id && (
        <button
          onClick={handleDelete}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-black transition-colors duration-200"
          aria-label="Delete comment"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* User info */}
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

      {/* Comment text */}
      <div className="mt-3">
        <h3 className="text-gray-700 text-sm leading-relaxed">{content}</h3>
      </div>

      {/* Reply button */}
      <div className="mt-3">
        <button 
          onClick={() => setShowReplies(!showReplies)}
          className="text-gray-900 text-sm font-semibold hover:text-gray-700 transition-colors"
        >
          {showReplies ? "Hide Replies" : "Reply"}
        </button>
      </div>

      {/* Reply section */}
      {showReplies && (
        <div className="mt-4 space-y-3">
          {/* Reply input */}
          <form onSubmit={handleReplySubmit} className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>

          {/* Replies list */}
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading replies...</div>
          ) : (
            <div className="space-y-2 pl-4 border-l-2 border-gray-100">
              {replyData?.map((reply) => (
                <div key={reply._id} className="flex items-start gap-2 group">
                  <img
                    src={reply.author.profileimg}
                    alt={reply.author.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {reply.author.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{reply.content}</p>
                  </div>
                  {user?._id === reply.author._id && (
                    <button
                      onClick={() => handleDeleteReply(reply._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}