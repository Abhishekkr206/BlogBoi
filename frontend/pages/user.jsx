import { useState, useEffect } from "react";
import {useFollowUserMutation, useUnfollowUserMutation} from "../features/user/userApi"
import { Heart, MessageCircle } from "lucide-react";
import { useGetUserDataQuery } from "../features/user/userApi";
import { useParams } from "react-router-dom";
import {LoaderOne as Spinner} from "../components/spinner"
import PostCard from "../components/postCard"
import LogoutButton from "../components/auth/logout";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {

  const {userid} = useParams()
  const {data, isLoading } = useGetUserDataQuery(userid)
  const [followUser] = useFollowUserMutation()
  const [unfollowUser] = useUnfollowUserMutation()
  const [isfollowingState, setIsfollowingState] = useState(false);
  const [followerCountState, setFollowerCountState] = useState(0);
  
  const navigate = useNavigate()
  const currentUserId  = useSelector((state) => state.auth.user?._id)
  console.log("Current User ID:", currentUserId);
  // Move useEffect BEFORE the conditional return
  useEffect(() => {
    if (data?.response?.isfollowing !== undefined) {
      setIsfollowingState(data.response.isfollowing);
    }
    if (data?.response?.followerCount !== undefined) {
      setFollowerCountState(data.response.followerCount);
    }
  }, [data]);

  // NOW the conditional return
  if(isLoading) return <Spinner/>

  const user = data?.response
  const {_id, username, name, profileimg, followingCount, isfollowing, bio } = user

const userdata = user
console.log("User Data asdad:", userdata);


console.log("Mitter Data:", bio);

  const handleFollow = async () => {
    try {
      if (!isfollowingState) {
        await followUser({userid, currentUserId}).unwrap();
        setIsfollowingState(true);
        setFollowerCountState(prev => prev + 1); // Increment
      } else {
        await unfollowUser({userid, currentUserId}).unwrap();
        setIsfollowingState(false);
        setFollowerCountState(prev => prev - 1); // Decrement
      }
    }
    catch (err) {
      console.error("Follow/Unfollow failed:", err);
    }
  }
  const showfollowers = ()=>{
    navigate(`/user/${userid}/follower`)
  }
  const showfollowing = ()=>{
    navigate(`/user/${userid}/following`)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <div className="flex justify-between items-center border-b pb-4">
        {/* Left: Profile Pic + Username + Counts */}
        <div className="flex items-center gap-4">
          <img
            src={profileimg || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"}
            alt={username}
            className="w-30 h-30 rounded-full object-cover"
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-start gap-4">
              <div className="flex items-start justify-start flex-col">
                <h2 className="text-2xl font-bold">{username}</h2>
                <h3 className="text-md">{name} boi</h3>
              </div>
              <div className="flex gap-4 text-gray-700 text-md ">
                <div className="hover:underline cursor-pointer" onClick={showfollowers}>
                  <span className="font-semibold">{followerCountState}</span> Followers
                </div>
                <div className="hover:underline cursor-pointer" onClick={showfollowing}> 
                  <span className="font-semibold">{followingCount}</span> Following
                </div>
              </div>
            </div>
            {bio && (
              <p className="text-gray-600 text-sm mt-2 max-w-md">{bio}</p>
            )}
          </div>
        </div>

        {/* Right: Follow Button */}
        <button 
          className="px-4 py-1 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition" 
          onClick={handleFollow}
        >
          {isfollowingState ? "Unfollow" : "Follow"}
        </button>
        <LogoutButton/>
      </div>

      {/* Posts Section */}
      <div className="flex flex-col gap-2 items-center">
        {user.blogs.map((post) => (
            <PostCard key={post._id} data={post} />
        ))}
      </div>
    </div>
  );
}