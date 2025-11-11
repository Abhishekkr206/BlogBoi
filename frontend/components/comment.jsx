import { useState, useEffect, } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteCommentMutation, useGetRepliesQuery, useAddReplyMutation, useDeleteReplyMutation } from "../features/comment/commentApi";
import { Trash2, UserRound } from "lucide-react";
import { useSelector } from "react-redux";
import { useToast } from "../components/Toast";

export default function CommentCard({ comments }) {
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [page, setPage] = useState(1);
  const [allReplies, setAllReplies] = useState([]);
  const [totalReplies, setTotalReplies] = useState(0);
  const { showError, showMessage } = useToast();

  const { data: replyData, isLoading } = useGetRepliesQuery(
    { commentId: comments._id, page },
    { skip: !showReplies }
  );
  console.log(comments)
  
  const [addReply] = useAddReplyMutation();
  const [deleteReply] = useDeleteReplyMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const navigate = useNavigate();

  const { _id, author, content, createdAt, post } = comments;
  const { user } = useSelector((state) => state.auth);

  const hasMore = replyData?.hasMore || false;

  // Reset replies when comment changes
  useEffect(() => {
    setPage(1);
    setAllReplies([]);
    setTotalReplies(comments.reply.length);
  }, [_id]);
  
  // Accumulate replies when data changes
  useEffect(() => {
    if (replyData?.message) {
      if (page === 1) {
        // First page: replace all replies
        setAllReplies(replyData.message);
      } else {
        // Subsequent pages: append new replies
        setAllReplies((prev) => {
          const newReplies = replyData.message.filter(
            (reply) => !prev.some((r) => r._id === reply._id)
          );
          return [...prev, ...newReplies];
        });
      }
    }
  }, [replyData, page]);

  const handleRedirect = (e) => {
    e.stopPropagation();
    navigate(`/user/${author._id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (user?._id !== author?._id) return;
    try {
      await deleteComment({ authorId: author._id, postId: post, commentId: _id }).unwrap();
      showError("Comment deleted successfully");
    } catch (err) {
      console.error("Delete comment failed:", err);
      showError("Failed to delete comment. Please try again.");
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await addReply({
        commentid: _id,
        content: replyText,
        postid: post,
      }).unwrap();
      setReplyText("");
      setPage(1); // Reset to first page to see new reply
      setTotalReplies((prev) => prev + 1);
      showMessage("Reply added successfully");
    } catch (err) {
      console.error("Add reply failed:", err);
      showError("Failed to add reply. Please try again.");
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      await deleteReply({
        commentId: _id,
        replyId,
        postId: post,
      }).unwrap();
      setTotalReplies((prev) => prev - 1);
      showError("Reply deleted successfully");
    } catch (err) {
      console.error("Delete reply failed:", err);
      showError("Failed to delete reply. Please try again.");
    }
  };

  const loadMoreReplies = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="relative flex flex-col border rounded-2xl p-2.5 sm:p-5 shadow-sm bg-white hover:shadow-md transition-all duration-200 max-w-md w-full overflow-hidden">
      {user?._id === author?._id && (
        <button
          onClick={handleDelete}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-red-500 transition-colors duration-200"
          aria-label="Delete comment"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* User info */}
      <div className="flex items-center gap-3 pr-8">
        {author.profileimg ? (
        <img
          src={author.profileimg }
          alt={author.username}
          className="w-11 h-11 rounded-full ring-2 ring-gray-50 object-cover border cursor-pointer flex-shrink-0"
        />
        ) :(
          <UserRound className="w-11 h-11 text-gray-700 border rounded-full p-0.5 space-y-1 font-medium flex-shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div onClick={handleRedirect}>
            <h4 className="font-semibold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors hover:underline truncate">
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
        <p className="text-gray-700 text-sm leading-relaxed break-words">{content}</p>
      </div>

      {/* Reply button */}
      <div className="mt-3 flex">
        <button
          onClick={() => {
            setShowReplies(!showReplies);
            if (!showReplies) setPage(1); // Reset page when opening
          }}
          className="text-gray-900 text-sm font-semibold hover:text-gray-700 transition-colors"
        >
          {showReplies ? "Hide Replies " : "Reply"}
        </button>
        <p className="text-sm">({totalReplies})</p>
      </div>

      {/* Reply section */}
      {showReplies && (
        <div className="mt-4 space-y-3">
          {/* Reply input */}
          <form onSubmit={handleReplySubmit} className="flex justify-center items-center gap-2 mx-1">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 min-w-0 px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              Send
            </button>
          </form>

          {/* Replies list */}
          {isLoading && page === 1 ? (
            <div className="text-sm text-gray-500 text-center py-2">Loading replies...</div>
          ) : allReplies.length > 0 ? (
            <div className="space-y-3 pl-4 border-l-2 border-gray-100">
              {allReplies.map((reply) => (
                <div key={reply._id} className="flex items-start gap-2 group min-w-0">
                  {reply.author?.profileimg ? (
                  <img
                    src={reply.author?.profileimg }
                    alt={reply.author?.username}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  ) : (
                    <UserRound className="w-8 h-8 text-gray flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {reply.author?.username}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 break-words">{reply.content}</p>
                  </div>
                  {user?._id === reply.author?._id && (
                    <button
                      onClick={() => handleDeleteReply(reply._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                      aria-label="Delete reply"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <button
                  onClick={loadMoreReplies}
                  disabled={isLoading}
                  className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Loading..." : "Load more replies"}
                </button>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-2">No replies yet</div>
          )}
        </div>
      )}
    </div>
  );
}