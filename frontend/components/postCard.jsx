import { Heart, MessageCircle, Trash2, UserRound } from "lucide-react";
import { IconHeartFilled } from "@tabler/icons-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLikePostMutation, useDeleteLikeMutation, useDeletePostMutation } from "../features/post/postApi";
import { useState, useEffect } from "react";
import { useToast } from "../components/Toast";

export default function PostCard({ data }) {

  // Router navigate
  const navigate = useNavigate();

  // Destructure post data props from API
  const { _id, author, profileimg, like, isliked, title, content, comment, createdAt } = data;

  // Logged in user id
  const currentUserId = useSelector((state) => state.auth.user?._id);

  // Whether rendered inside profile section page
  const isProfileSection = data?.profileSection || false;

  const authorId = author?._id;
  const isAuthor = currentUserId === authorId;

  // RTK Query mutation hooks
  const [likePost] = useLikePostMutation();
  const [deleteLike] = useDeleteLikeMutation();
  const [deletePost] = useDeletePostMutation();

  // Local UI states (sync with backend values initially)
  const [totalLikes, setTotalLikes] = useState(like);
  const [liked, setLiked] = useState(isliked);
  const [commentCount, setCommentCount] = useState(comment);

  const { showError, showMessage } = useToast();

  // Sync UI states when API values change (like refetch etc.)
  useEffect(() => {
    setTotalLikes(like);
    setLiked(isliked);
    setCommentCount(comment);
  }, [like, isliked, comment]);


  // Like / Unlike handler
  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const postid = _id;

      if (!liked) {
        // UI Update -> optimistic
        setTotalLikes(prev => prev + 1);
        setLiked(true);

        await likePost({ authorId, postid }).unwrap();
        showMessage("Post liked!");
      } else {
        setTotalLikes(prev => prev - 1);
        setLiked(false);

        await deleteLike({ authorId, postid }).unwrap();
        showError("Like removed!");
      }
    }
    catch (err) {
      console.log(err);
      showError("An error occurred. Please try again.");
    }
  };


  // Normalize empty image to null
  let { img } = data;
  if (img === "") img = null;


  // Limits text preview characters - works with HTML content
  const truncateHtml = (html, limit) => {
    if (!html) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    
    if (text.length <= limit) return html;
    
    // If truncated, strip HTML and add ellipsis
    return text.slice(0, limit) + "...";
  };


  // Redirect to author's profile (click on avatar/name)
  const handleRedirect = (e) => {
    e.stopPropagation();
    navigate(`/user/${author._id}`);
  };


  // Delete post handler (author only)
  const deletePostHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await deletePost({ authorId, postid: _id }).unwrap();
      showError("Post deleted successfully");
    }
    catch (err) {
      console.log(err);
      showError("Failed to delete post. Please try again.");
    }
  };


  return (
    <>
      <div
        className="relative flex flex-col items-center sm:flex-row border rounded-lg shadow-md p-3 sm:p-4 gap-3 sm:gap-4 w-full sm:max-w-3xl sm:mx-auto py-4 sm:py-8 bg-white z-10 cursor-pointer"
        onClick={() => navigate(`/post/${_id}`)}
      >

        {/* Delete button visible only if profile section AND user is author */}
        {isProfileSection && isAuthor && (
          <button
            onClick={deletePostHandler}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-black transition-colors duration-200 z-50"
            aria-label="Delete post"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Main Post Content - constrained with min-width: 0 to prevent overflow */}
        <div className="flex-1 flex flex-col gap-2 min-w-0 w-full">

          {/* Author Info */}
          <div className="flex justify-between items-start sm:items-center gap-2 pr-8 sm:pr-0">
            <div
              className="flex items-center gap-2 hover:underline cursor-pointer min-w-0"
              onClick={handleRedirect}
            >
              {author?.profileimg ? (
                <img
                  src={author?.profileimg}
                  alt={author?.username}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <UserRound className="w-8 h-8 sm:w-10 sm:h-10 text-gray flex-shrink-0" />
              )}
              <h4 className="font-semibold text-sm sm:text-base truncate">{author?.username}</h4>
            </div>

            <span className="text-gray-500 text-xs sm:text-sm whitespace-nowrap">
              {new Date(createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Image — mobile only */}
          {img && (
            <div className="flex-shrink-0 sm:hidden w-full">
              <img src={img} alt={title} className="rounded-md w-full min:h-48 max-h-54 object-cover" />
            </div>
          )}

          {/* Title + Desc */}
          <div className="min-w-0 w-full">
            <h2 className="font-bold text-base sm:text-lg break-words">{title}</h2>
            <div 
              className="text-gray-700 text-xs sm:text-sm mt-1 break-words overflow-hidden line-clamp-3"
              dangerouslySetInnerHTML={{ __html: truncateHtml(content, 150) }}
            />
          </div>

          {/* Like + Comment Buttons */}
          <div className="flex items-center gap-4 pt-2">
            <button className="flex items-center gap-1 cursor-pointer" onClick={handleLike}>
              {liked
                ? <IconHeartFilled className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                : <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />}
              <span className="text-sm sm:text-base">{totalLikes}</span>
            </button>

            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              <span className="text-sm sm:text-base">{commentCount}</span>
            </div>
          </div>
        </div>

        {/* Image — Desktop only (right side) - with fixed width */}
        {img && (
          <div className="hidden sm:block flex-shrink-0 w-48">
            <img src={img} alt={title} className="rounded-md w-full h-40 object-cover" />
          </div>
        )}
      </div>
    </>
  );
}