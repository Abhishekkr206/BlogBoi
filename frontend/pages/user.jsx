import { useState, useEffect } from "react";
import { useFollowUserMutation, useUnfollowUserMutation, useGetUserDataQuery } from "../features/user/userApi";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import InfiniteScroll from "react-infinite-scroll-component";
import { LoaderOne as Spinner } from "../components/spinner";
import { LoaderTwo } from "../components/spinner";
import PostCard from "../components/postCard";
import { useToast } from "../components/Toast";
import { UserRound, Pencil } from "lucide-react";

export default function UserProfile() {
  const { userid } = useParams();
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, isFetching } = useGetUserDataQuery({ userid, page });
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const { showError, showMessage } = useToast();

  const navigate = useNavigate();
  const currentUserId = useSelector((state) => state.auth.user?._id);

  // Load posts when data changes
  useEffect(() => {
    if (data?.response?.blogs) {
      if (page === 1) {
        // First page: replace all posts
        setAllPosts(data.response.blogs);
      } else {
        // Subsequent pages: append new posts
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

  useEffect(() => {
    if (data?.response) {
      setIsFollowing(data.response.isfollowing || false);
      setFollowerCount(data.response.followerCount || 0);
      setFollowingCount(data.response.followingCount || 0);
    }
  }, [data]);

  if (isLoading && page === 1) return <Spinner />;

  const user = data?.response;
  if (!user) return <p>User not found</p>;

  const { username, name, profileimg, bio } = user;

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


  const fetchMore = () => setPage((prev) => prev + 1);

  const isOwnProfile = currentUserId === userid;

return (
  <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
    {/* Profile Header */}
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-4 gap-4 sm:gap-0">
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

            <div className="flex justify-center sm:justify-start gap-4 text-gray-700 text-sm sm:text-md mt-2 sm:mt-0">
              <div
                className="hover:underline cursor-pointer"
                onClick={() => navigate(`/user/${userid}/follower`)}
              >
                <span className="font-semibold">{followerCount}</span> Followers
              </div>
              <div
                className="hover:underline cursor-pointer"
                onClick={() => navigate(`/user/${userid}/following`)}
              >
                <span className="font-semibold">{followingCount}</span> Following
              </div>
            </div>
          </div>

          {bio && (
            <p className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2 max-w-xs sm:max-w-md mx-auto sm:mx-0">
              {bio}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      {isOwnProfile ? (
        <button
          className="p-2 hover:bg-gray-100 rounded-full transition self-center sm:self-auto"
          onClick={() => navigate("/user/edit")}
        >
          <Pencil className="w-5 h-5 text-gray-700" />
        </button>
      ) : (
        <button
          className="px-4 py-2 text-sm sm:text-lg bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition w-full sm:w-auto"
          onClick={handleFollow}
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}
    </div>

    {/* Posts */}
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