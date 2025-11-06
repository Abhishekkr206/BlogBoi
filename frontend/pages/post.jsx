import { useState, useEffect } from "react";
import { Heart, Share2, UserPlus, UserMinus, UserRound } from "lucide-react";
import { IconHeartFilled } from "@tabler/icons-react";
import { LoaderOne as Spinner } from "../components/spinner";
import { LoaderTwo } from "../components/spinner";
import CommentCard from "../components/comment";
import { useGetPostByIdQuery, useLikePostMutation, useDeleteLikeMutation } from "../features/post/postApi";
import { Link, useParams } from "react-router-dom";
import { useGetCommentsQuery, useAddCommentMutation } from "../features/comment/commentApi";
import { useFollowUserMutation, useUnfollowUserMutation } from "../features/user/userApi";
import { useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import { useToast } from "../components/Toast";

export default function PostSection() {
  const { postid } = useParams();
  
  // ALL HOOKS AT THE TOP
  const [addComment] = useAddCommentMutation();
  const [likePost] = useLikePostMutation();
  const [deleteLike] = useDeleteLikeMutation();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const { showError, showMessage } = useToast();

  // Pagination states for comments
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allComments, setAllComments] = useState([]);

  // Form and UI states
  const [formData, setFormData] = useState({
    postid,
    content: "",
  });

  const [totalLikes, setTotalLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);

  // API queries
  const { data, isLoading, isError } = useGetPostByIdQuery(postid);
  const { data: commentData, isLoading: commentIsLoading } = useGetCommentsQuery({ postId: postid, page });

  const post = data?.message;
  const currentUserId = useSelector((state) => state.auth.user?._id);

  // Reset comments when postid changes
  useEffect(() => {
    setPage(1);
    setAllComments([]);
    setHasMore(true);
  }, [postid]);
  
  // Load comments when data changes
  useEffect(() => {
    if (commentData?.message) {
      if (page === 1) {
        setAllComments(commentData.message);
      } else {
        setAllComments((prev) => {
          const newComments = commentData.message.filter(
            (comment) => !prev.some((c) => c._id === comment._id)
          );
          return [...prev, ...newComments];
        });
      }
      setHasMore(commentData.hasMore !== undefined ? commentData.hasMore : false);
    }
  }, [commentData, page]);

  useEffect(() => {
    if (post) {
      if (post.isliked !== undefined) {
        setLiked(post.isliked);
      }
      setTotalLikes((prev) => (prev === 0 ? post.like : prev));
      if (post.isfollowing !== undefined) {
        setFollowing(post.isfollowing);
      }
    }
  }, [post]);

  const fetchMore = () => {
    setPage((prev) => prev + 1);
  };

  if (isLoading || (commentIsLoading && page === 1)) {
    return <Spinner />;
  }

  if (isError) {
    return <div className="text-center mt-10 text-red-500">Failed to load post.</div>;
  }

  if (!post) {
    return <div className="text-center mt-10">Post not found.</div>;
  }

  if (!post.author) {
    return <div className="text-center mt-10 text-red-500">Author data missing.</div>;
  }

  const { _id, author, img, title, content, createdAt } = post;
  const authorId = author._id;
  
  if (!author._id) {
    console.error("Author ID is missing:", author);
    return <div className="text-center mt-10 text-red-500">Invalid author data.</div>;
  }

  const handleChanges = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await addComment({
        authorId,
        postId: formData.postid,
        body: { content: formData.content },
      }).unwrap();

      console.log("Comment added:", res);
      setFormData({ ...formData, content: "" });
      showMessage("Comment added successfully!");
    } catch (err) {
      console.error("Comment failed:", err);
      showError("Failed to add comment. Please try again.");
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    try {
      if (liked) {
        setTotalLikes(prev => prev - 1);
        setLiked(false);
        await deleteLike({ authorId, postid }).unwrap();
        showError("Post disliked successfully!");
      } else {
        setTotalLikes(prev => prev + 1);
        setLiked(true);
        await likePost({ authorId, postid }).unwrap();
        showMessage("Post liked successfully!");
      }
    } catch (err) {
      console.error("Like action failed:", err);
    }
  };

  const handleFollow = async () => {
    if (!author?._id) {
      console.error("Cannot follow: Author ID is undefined");
      return;
    }
    try {
      if (following) {
        await unfollowUser({ userid: authorId, currentUserId }).unwrap();
        setFollowing(false);
        showError("Unfollowed successfully");
      } else {
        await followUser({ userid: authorId, currentUserId }).unwrap();
        setFollowing(true);
        showMessage("Followed successfully");
      }
    } catch (err) {
      console.error("Follow action failed:", err);
      showError("Action failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 pb-20 lg:pb-30">
      {/* Left Side - Post */}
      <div className="w-full lg:flex-1 lg:basis-7/10 border rounded-lg shadow-md p-4 sm:p-6 flex flex-col gap-4 bg-white lg:self-start lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)]">
        {/* User Info + Follow */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Link to={`/user/${author._id}`}>
              <div className="flex items-center gap-2 sm:gap-3 hover:underline">
                {author.profileimg ? (
                  <img
                    src={author.profileimg}
                    alt={author.username}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                  />
                ) : (
                  <UserRound className="w-10 h-10 sm:w-12 sm:h-12 text-gray-700 border rounded-full p-0.5" />
                )}
                <h4 className="font-bold text-sm sm:text-base">{author.username}</h4>
              </div>
            </Link>
            <span className="text-gray-500 text-xs sm:text-sm">
              {new Date(createdAt).toLocaleString()}
            </span>
          </div>
          
          {currentUserId && author._id && currentUserId !== author._id && (
            <button
              onClick={handleFollow}
              className={`flex items-center justify-center gap-1 px-3 sm:px-4 py-2 rounded-xl transition text-sm sm:text-base whitespace-nowrap ${
                following
                  ? "bg-gray-200 text-black hover:bg-gray-300"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {following ? (
                <>
                  <UserMinus className="w-4 h-4" /> Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Follow
                </>
              )}
            </button>
          )}
        </div>

        {/* Like & Share Buttons */}
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition text-sm sm:text-base ${
              liked ? "text-red-500" : "text-gray-700 hover:text-red-500"
            }`}
          >
            {liked ? (
              <IconHeartFilled className="w-5 h-5" />
            ) : (
              <Heart className="w-5 h-5" />
            )}
            <span>{totalLikes}</span>
          </button>
          <button className="flex items-center gap-1 text-gray-700 hover:text-blue-500 transition text-sm sm:text-base">
            <Share2 className="w-5 h-5" /> Share
          </button>
        </div>

        {/* Title + Image + Content */}
        <div className="flex flex-col gap-3 mt-2 lg:overflow-y-auto lg:flex-1 lg:min-h-0">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold break-words">{title}</h2>
          {img && <img src={img} alt={title} className="w-full h-auto rounded-lg" />}
          <div 
            className="text-gray-700 prose prose-sm sm:prose-base lg:prose-lg max-w-none break-words" 
            dangerouslySetInnerHTML={{ __html: content }}
          />        
        </div>
      </div>

      {/* Right Side - Comments */}
      <div className="w-full lg:w-auto lg:basis-3/10 flex flex-col gap-4">
        <h3 className="text-xl sm:text-2xl font-semibold">Comments</h3>

        {/* Comment input */}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <textarea
              onChange={handleChanges}
              name="content"
              value={formData.content}
              placeholder="Write a comment..."
              className="border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:border-black bg-white/80 text-sm sm:text-base"
              rows={4}
            />
            <button
              className="px-3 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition"
              type="submit"
            >
              Comment
            </button>
          </div>
        </form>

        {/* Comments list with Infinite Scroll */}
        <InfiniteScroll
          dataLength={allComments.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={<h4 className="text-center py-4"><LoaderTwo/></h4>}
          endMessage={
            <p className="text-center py-4 text-gray-500 text-sm">
              No more comments 
            </p>
          }
        >
          <div className="flex flex-col gap-4">
            {allComments.map((c) => (
              <CommentCard key={c._id} comments={c} />
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
}