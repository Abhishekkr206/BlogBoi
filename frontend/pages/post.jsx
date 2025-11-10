import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Heart, Share2, UserPlus, UserMinus, UserRound } from "lucide-react";
import { IconHeartFilled } from "@tabler/icons-react";
import { LoaderOne as Spinner } from "../components/spinner";
import { LoaderTwo } from "../components/spinner";
import CommentCard from "../components/comment";
import {
  useGetPostByIdQuery,
  useLikePostMutation,
  useDeleteLikeMutation,
} from "../features/post/postApi";
import { Link, useParams } from "react-router-dom";
import {
  useGetCommentsQuery,
  useAddCommentMutation,
} from "../features/comment/commentApi";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../features/user/userApi";
import { useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import { useToast } from "../components/Toast";

export default function PostSection() {
  const { postid } = useParams();

  // refs + measured height
  const leftRef = useRef(null);
  const [commentsHeight, setCommentsHeight] = useState(null); // number | null

  // API hooks
  const [addComment] = useAddCommentMutation();
  const [likePost] = useLikePostMutation();
  const [deleteLike] = useDeleteLikeMutation();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const { showError, showMessage } = useToast();

  // pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allComments, setAllComments] = useState([]);

  // form + ui states
  const [formData, setFormData] = useState({ postid, content: "" });
  const [totalLikes, setTotalLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);

  // queries
  const { data, isLoading, isError } = useGetPostByIdQuery(postid);
  const { data: commentData, isLoading: commentIsLoading } =
    useGetCommentsQuery({ postId: postid, page });

  const post = data?.message;
  const currentUserId = useSelector((state) => state.auth.user?._id);

  // measure left column height on desktop; clear on mobile/tablet
  const measure = () => {
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024; // Tailwind lg
    if (!isDesktop) {
      setCommentsHeight(null);
      return;
    }
    const h = leftRef.current?.offsetHeight ?? null;
    setCommentsHeight(h);
  };

  useLayoutEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("load", measure);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", measure);
    };
  }, []);

  // re-measure when content changes
  useEffect(() => {
    measure();
  }, [post, commentIsLoading, allComments.length]);

  // reset pagination on new post
  useEffect(() => {
    setPage(1);
    setAllComments([]);
    setHasMore(true);
  }, [postid]);

  // append comments
  useEffect(() => {
    if (commentData?.message) {
      setAllComments((prev) =>
        page === 1
          ? commentData.message
          : [
              ...prev,
              ...commentData.message.filter(
                (c) => !prev.some((p) => p._id === c._id)
              ),
            ]
      );
      setHasMore(commentData.hasMore ?? false);
    }
  }, [commentData, page]);

  // sync like/follow from post
  useEffect(() => {
    if (post) {
      setLiked(post.isliked ?? false);
      setFollowing(post.isfollowing ?? false);
      setTotalLikes((prev) => (prev === 0 ? post.like : prev));
    }
  }, [post]);

  const fetchMore = () => setPage((prev) => prev + 1);

  // loading / errors
  if (isLoading || (commentIsLoading && page === 1)) return <Spinner />;
  if (isError) return <div className="text-center mt-10 text-red-500">Failed to load post.</div>;
  if (!post) return <div className="text-center mt-10">Post not found.</div>;
  if (!post.author) return <div className="text-center mt-10 text-red-500">Author data missing.</div>;

  const { author, img, title, content, createdAt } = post;
  const authorId = author._id;

  const handleChanges = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addComment({
        authorId,
        postId: formData.postid,
        body: { content: formData.content },
      }).unwrap();
      setFormData({ ...formData, content: "" });
      showMessage("Comment added successfully!");
    } catch {
      showError("Failed to add comment. Please try again.");
    }
  };

  const handleLike = async () => {
    try {
      if (liked) {
        setTotalLikes((prev) => prev - 1);
        setLiked(false);
        await deleteLike({ authorId, postid }).unwrap();
        showError("Post disliked");
      } else {
        setTotalLikes((prev) => prev + 1);
        setLiked(true);
        await likePost({ authorId, postid }).unwrap();
        showMessage("Post liked");
      }
    } catch {}
  };

  const handleFollow = async () => {
    try {
      if (following) {
        await unfollowUser({ userid: authorId, currentUserId }).unwrap();
        setFollowing(false);
        showError("Unfollowed");
      } else {
        await followUser({ userid: authorId, currentUserId }).unwrap();
        setFollowing(true);
        showMessage("Followed");
      }
    } catch {
      showError("Action failed. Try again.");
    }
  };

  function sharePost() {
    const postUrl = window.location.href;
    navigator.clipboard.writeText(postUrl);
    showMessage("Copied to clipboard!");
  }

  // comments panel style (desktop = fixed height + scroll; mobile/tablet = natural)
  const commentsPanelStyle = commentsHeight
    ? {
        height: Math.max(commentsHeight, 600), // 👈 ensures at least 600px tall
        overflowY: "auto",
      }
    : { minHeight: 600 }; // 👈 fallback for mobile/tablet (no fixed height)

  // only set scrollableTarget when we actually have a scrollable container
  const scrollableProps = commentsHeight
    ? { scrollableTarget: "commentsScroll" }
    : {}; // window scroll on mobile/tablet

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 pb-32">

      {/* LEFT: POST (natural height) */}
      <div
        ref={leftRef}
        className="w-full lg:flex-1 lg:basis-7/10 border rounded-lg shadow-md p-4 sm:p-6 flex flex-col gap-4 bg-white"
      >
        {/* Author + Follow */}
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

          {currentUserId && currentUserId !== author._id && (
            <button
              onClick={handleFollow}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200
                ${following
                  ? "bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 hover:border-gray-400"
                  : "bg-black text-white hover:bg-gray-900"
                }`}
            >
              {following ? (
                <>
                  <UserMinus className="w-4 h-4" />
                  <span>Unfollow</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Like + Share */}
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition text-sm sm:text-base ${
              liked ? "text-red-500" : "text-gray-700 hover:text-red-500"
            }`}
          >
            {liked ? <IconHeartFilled className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
            <span>{totalLikes}</span>
          </button>

          <button
            className="flex items-center gap-1 text-gray-700 hover:text-blue-500 transition text-sm sm:text-base"
            onClick={sharePost}
          >
            <Share2 className="w-5 h-5" /> Share
          </button>
        </div>

        {/* Title + Image + Content */}
        <div className="flex flex-col gap-4 mt-2">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold break-words">{title}</h2>

          {img && (
            <img
              src={img}
              alt={title}
              className="w-full h-auto rounded-lg"
              onLoad={measure}
            />
          )}

          <div
            className="text-gray-700 prose prose-sm sm:prose-base lg:prose-lg max-w-none break-words"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>

      {/* RIGHT: COMMENTS (matches left height on desktop; scrolls if needed) */}
      <div
        id="commentsScroll"
        className="w-full lg:w-auto lg:basis-3/10 flex flex-col gap-4"
        style={commentsPanelStyle}
      >
        <h3 className="text-xl sm:text-2xl font-semibold">Comments</h3>

        {/* Comment input box */}
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
              type="submit"
              className="px-3 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition"
            >
              Comment
            </button>
          </div>
        </form>

        <InfiniteScroll
          dataLength={allComments.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={<h4 className="text-center py-4"><LoaderTwo /></h4>}
          endMessage={<p className="text-center py-4 text-gray-500 text-sm">No more comments</p>}
          style={{ overflow: "visible" }}
          {...scrollableProps} // only adds scrollableTarget on desktop
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
