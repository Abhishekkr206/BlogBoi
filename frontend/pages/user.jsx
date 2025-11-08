import { useState, useEffect } from "react";
import { useFollowUserMutation, useUnfollowUserMutation, useGetUserDataQuery } from "../features/user/userApi";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import { LoaderOne as Spinner } from "../components/spinner";
import { LoaderTwo } from "../components/spinner";
import PostCard from "../components/postCard";
import { useToast } from "../components/Toast";
import { UserRound, UserPlus, UserMinus ,Pencil } from "lucide-react";

export default function UserProfile() {

  // Get user id from URL
  const { userid } = useParams();

  // Pagination states
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  // API: fetch profile + posts (paginated)
  const { data, isLoading, isFetching } = useGetUserDataQuery({ userid, page });

  // API: follow/unfollow actions
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  // Profile UI states
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const { showError, showMessage } = useToast();
  const navigate = useNavigate();

  // Logged-in user id
  const currentUserId = useSelector((state) => state.auth.user?._id);

  // When API returns data, update posts list
  useEffect(() => {
    if (data?.response?.blogs) {
      if (page === 1) {
        // First page → replace list
        setAllPosts(data.response.blogs);
      } else {
        // Next pages → append new posts without duplicates
        setAllPosts((prev) => {
          const newPosts = data.response.blogs.filter(
            (blog) => !prev.some((p) => p._id === blog._id)
          );
          return [...prev, ...newPosts];
        });
      }
      setHasMore(data.response.hasMore);
    }
  }, [data, page]);

  // Update UI states when profile data loads
  useEffect(() => {
    if (data?.response) {
      setIsFollowing(data.response.isfollowing || false);
      setFollowerCount(data.response.followerCount || 0);
      setFollowingCount(data.response.followingCount || 0);
    }
  }, [data]);

  // Show loading only at first page
  if (isLoading && page === 1) return <Spinner />;

  const user = data?.response;
  if (!user) return <p className="text-center">User not found</p>;

  const { username, name, profileimg, bio } = user;

  // Follow / Unfollow logic
  const handleFollow = async () => {
    try {
      if (!isFollowing) {
        await followUser({ userid, currentUserId }).unwrap();
        setIsFollowing(true);
        showMessage("Followed successfully");
      } else {
        await unfollowUser({ userid, currentUserId }).unwrap();
        setIsFollowing(false);
        showMessage("Unfollowed successfully");
      }
    } catch (err) {
      console.error("Follow/Unfollow failed:", err);
      showError("Action failed. Please try again.");
    }
  };

  // Load next page of posts
  const fetchMore = () => setPage((prev) => prev + 1);

  // Check if viewing own profile
  const isOwnProfile = currentUserId === userid;


  return (
    <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">

      {/* ---------- Profile Header ---------- */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-4 gap-4 sm:gap-0">
        
        {/* Profile Image + Basic info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {profileimg ? (
            <img
              src={profileimg}
              alt={username}
              className="w-24 h-24 sm:w-30 sm:h-30 rounded-full object-cover mx-auto sm:mx-0"
            />
          ) : (
            <UserRound className="w-24 h-24 sm:w-30 sm:h-30 text-gray mx-auto sm:mx-0" />
          )}

          <div className="flex flex-col gap-2 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-start sm:gap-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">{username}</h2>
                <h3 className="text-sm sm:text-md">{name}</h3>
              </div>

              {/* Followers / Following Count */}
              <div className="flex justify-center sm:justify-start gap-6 text-gray-600 text-sm sm:text-base mt-2 sm:mt-0">
                <button
                  onClick={() => navigate(`/user/${userid}/follower`)}
                  className="flex items-center gap-1 hover:text-black hover:underline transition "
                >
                  <span className="font-semibold text-black">{followerCount}</span>
                  <span>Followers</span>
                </button>

                <button
                  onClick={() => navigate(`/user/${userid}/following`)}
                  className="flex items-center gap-1 hover:text-black hover:underline transition"
                >
                  <span className="font-semibold text-black">{followingCount}</span>
                  <span>Following</span>
                </button>
              </div>
            </div>

            {bio && (
              <p className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2 max-w-xs sm:max-w-md mx-auto sm:mx-0">
                {bio}
              </p>
            )}
          </div>
        </div>

        {/* ---------- Follow / Edit Button ---------- */}
        {isOwnProfile ? (
          <button
            onClick={() => navigate("/user/edit")}
            className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition flex items-center justify-center"
            title="Edit Profile"
          >
            <Pencil className="w-5 h-5 text-gray-700" />
          </button>
        ) : (
          <button
            onClick={handleFollow}
            className={`flex items-center gap-2 justify-center px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 w-full sm:w-auto
              ${
                isFollowing
                  ? "bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 hover:border-gray-400"
                  : "bg-gray-900/95 text-white hover:bg-gray-900"
              }
            `}
          >
            {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      {/* ---------- Posts Section (Infinite Scroll) ---------- */}
      <InfiniteScroll
        dataLength={allPosts.length}
        next={fetchMore}
        hasMore={hasMore}
        loader={<h4 className="py-4"><LoaderTwo /></h4>}
        endMessage={<p className="text-center mb-20 sm:mb-4 text-gray-800 font-semibold">No more posts</p>}
      >
        <div className="flex flex-col gap-2 items-center w-full mb-5 sm:mb-10">
          {allPosts.map((post) => (
            <PostCard key={post._id} data={post} />
          ))}
        </div>
      </InfiniteScroll>

    </div>
  );
}
