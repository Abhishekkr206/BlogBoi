import { Heart, MessageCircle } from "lucide-react";
import { useGetUserDataQuery } from "../features/user/userApi";
import { useParams } from "react-router-dom";
import {LoaderOne as Spinner} from "../components/spinner"
import PostCard from "../components/postCard"

export default function UserProfile() {

  const {userid} = useParams()

  const {data, isLoading } =  useGetUserDataQuery(userid)

  if(isLoading) return <Spinner/>
  console.log(data)
  const user = data.response
  console.log(user)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <div className="flex justify-between items-center border-b pb-4">
        {/* Left: Profile Pic + Username + Counts */}
        <div className="flex items-center gap-4">
          <img
            src={user.profileimg || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"}
            alt={user.username}
            className="w-24 h-24 rounded-full"
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <div className="flex items-start justify-start flex-col">
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <h3 className="text-md">{user.name}</h3>
              </div>
              <div className="flex gap-4 text-gray-700 text-md ">
                <div className="hover:underline">
                  <span className="font-semibold">{user.followerCount}</span> Followers
                </div>
                <div className="hover:underline">
                  <span className="font-semibold">{user.followingCount}</span> Following
                </div>
              </div>
            </div>
            <p className="text-gray-600">{user.firstName} {user.lastName}</p>
          </div>
        </div>

        {/* Right: Follow Button */}
        <button className="px-4 py-1 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition">
          Follow
        </button>
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
