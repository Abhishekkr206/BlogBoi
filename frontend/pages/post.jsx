import { useState, useEffect } from "react";
import { Heart, Share2, UserPlus, UserMinus } from "lucide-react";
import { IconHeartFilled } from "@tabler/icons-react";
import { LoaderOne as Spinner } from "../components/spinner";
import CommentCard from "../components/comment";
import { useGetPostByIdQuery, useLikePostMutation, useDeleteLikeMutation } from "../features/post/postApi";
import { Link, useParams } from "react-router-dom";
import { useGetCommentsQuery, useAddCommentMutation } from "../features/comment/commentApi";
import { useFollowUserMutation, useUnfollowUserMutation } from "../features/user/userApi";
import { useSelector } from "react-redux";

export default function PostSection() {
  const { postid } = useParams();
  
  // ALL HOOKS AT THE TOP
  const [addComment] = useAddCommentMutation();
  const [likePost] = useLikePostMutation();
  const [deleteLike] = useDeleteLikeMutation();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const [formData, setFormData] = useState({
    postid,
    content: "",
  });

  const [totalLikes, setTotalLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);

  const { data, isLoading, isError } = useGetPostByIdQuery(postid);
  const { data: commentData, isLoading: commentIsLoading } = useGetCommentsQuery(postid);

  const post = data?.message;
  const comment = commentData?.message || [];
  const currentUserId = useSelector((state) => state.auth.user?._id);
  
  // DEBUG: Console logs
  console.log("Full Data:", data);
  console.log("Post:", post);
  console.log("Author:", post?.author);
  console.log("Current User ID:", currentUserId);

  // useEffect - Post data se state update karo
  useEffect(() => {
    if (post) {
      if (post.isliked !== undefined) {
        setLiked(post.isliked);
      }
      if (post.like !== undefined) {
        setTotalLikes(Array.isArray(post.like) ? post.like.length : post.like);
      }
      if (post.isfollowing !== undefined) {
        setFollowing(post.isfollowing);
      }
    }
  }, [post]);

  // NOW EARLY RETURNS ARE SAFE
  if (isLoading || commentIsLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <div className="text-center mt-10 text-red-500">Failed to load post.</div>;
  }

  if (!post) {
    return <div className="text-center mt-10">Post not found.</div>;
  }

  // Check if author exists before destructuring
  if (!post.author) {
    return <div className="text-center mt-10 text-red-500">Author data missing.</div>;
  }

  // Destructure safely
  const { _id, author, img, like, isliked, title, content, isfollowing, createdAt } = post;
  
  const authorId = author._id;
  // Extra safety check
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
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  const handleLike = async () => {
    try {
      if (liked) {
        await deleteLike({authorId, postid}).unwrap();
        setLiked(false);
        setTotalLikes((prev) => prev - 1);
      } else {
        await likePost({authorId, postid}).unwrap();
        setLiked(true);
        setTotalLikes((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Like action failed:", err);
    }
  };

  const handleFollow = async () => {
    // Safety check
    if (!author?._id) {
      console.error("Cannot follow: Author ID is undefined");
      return;
    }
    try {
      console.log("Following user ID:", authorId); // Debug log
      
      if (following) {
        await unfollowUser({userid:authorId,currentUserId}).unwrap();
        setFollowing(false);
      } else {
        await followUser({userid:authorId,currentUserId}).unwrap();
        setFollowing(true);
      }
    } catch (err) {
      console.error("Follow action failed:", err);
    }
  };

  return (
    <div className="flex gap-4 max-w-6xl mx-auto p-6 pb-20">
      {/* Left Side - Post 70% */}
      <div className="flex-1 basis-7/10 border rounded-lg shadow-md p-4 flex flex-col gap-4 bg-white pb-20">
        {/* User Info + Follow */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/user/${author._id}`}>
              <div className="flex items-center justify-center gap-3 hover:underline">
                <img
                  src={author.profileimg || "https://randomuser.me/api/portraits/men/65.jpg"}
                  alt={author.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <h4 className="font-bold">{author.username}</h4>
              </div>
            </Link>
            <span className="text-gray-500 text-sm">
              {new Date(createdAt).toLocaleString()}
            </span>
          </div>
          {/* Show follow button only if not viewing own post */}
          {currentUserId && author._id && currentUserId !== author._id && (
            <button
              onClick={handleFollow}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl transition ${
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

        {/* Like & Share Buttons ABOVE */}
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition ${
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
          <button className="flex items-center gap-1 text-gray-700 hover:text-blue-500 transition">
            <Share2 className="w-5 h-5" /> Share
          </button>
        </div>

        {/* Title + Image + Content */}
        <div className="flex flex-col gap-3 mt-2">
          <h2 className="text-4xl font-semibold">{title}</h2>
          {img && <img src={img} alt={title} className="w-full h-fit" />}
          <div 
            className="text-gray-700 prose prose-lg max-w-none text-lg" 
            dangerouslySetInnerHTML={{ __html: content }}
          />        
          </div>
      </div>

      {/* Right Side - Comments 30% */}
      <div className="flex flex-col basis-3/10 gap-4">
        <h3 className="text-2xl font-semibold">Comments</h3>

        {/* Comment input */}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <textarea
              onChange={handleChanges}
              name="content"
              value={formData.content}
              placeholder="Write a comment..."
              className="border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:border-black bg-white/80"
              rows={4}
            />
            <button
              className="px-3 py-1 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition"
              type="submit"
            >
              Comment
            </button>
          </div>
        </form>

        {/* Comments list */}
        {comment.map((c) => (
          <CommentCard key={c._id} comments={c} />
        ))}
      </div>
    </div>
  );
}