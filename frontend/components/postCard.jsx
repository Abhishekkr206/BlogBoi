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


  // Limits text preview characters
  const truncate = (text, limit) => {
    if (!text) return "";
    return text.length > limit ? text.slice(0, limit) + "..." : text;
  };

  // Remove HTML tags from content
  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
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
        className="relative flex flex-col sm:flex-row border rounded-lg shadow-md p-3 sm:p-4 gap-3 sm:gap-4 items-start sm:items-center w-full max-w-md sm:max-w-3xl mx-auto py-4 sm:py-8 bg-white z-10 cursor-pointer"
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

        {/* Main Post Content */}
        <div className="flex-1 flex flex-col gap-2 w-full">

          {/* Author Info */}
          <div className="flex justify-between items-start sm:items-center gap-2 pr-8 sm:pr-0">
            <div
              className="flex items-center gap-2 hover:underline cursor-pointer"
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
              <h4 className="font-semibold text-sm sm:text-base">{author?.username}</h4>
            </div>

            <span className="text-gray-500 text-xs sm:text-sm whitespace-nowrap">
              {new Date(createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Image — mobile only */}
          {img && (
            <div className="flex-shrink-0 sm:hidden w-full">
              <img src={img} alt={title} className="rounded-md w-full h-48 object-cover" />
            </div>
          )}

          {/* Title + Desc */}
          <div>
            <h2 className="font-bold text-base sm:text-lg">{title}</h2>
            <p className="text-gray-700 text-xs sm:text-sm mt-1">
              {truncate(stripHtml(content), 200)}
            </p>
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

        {/* Image — Desktop only (right side) */}
        {img && (
          <div className="hidden sm:flex flex-shrink-0">
            <img src={img} alt={title} className="rounded-md w-48 h-36 object-cover" />
          </div>
        )}
      </div>
    </>
  );
}
