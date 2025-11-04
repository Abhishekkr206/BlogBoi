import { useState, useEffect } from 'react'; // ADD useEffect
import { User } from 'lucide-react';
import { useFollowUserMutation, useUnfollowUserMutation } from '../features/user/userApi'; 
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function FollowCard({ data }) {
    const [followUser] = useFollowUserMutation()
    const [unfollowUser] = useUnfollowUserMutation()
    const [isfollowingState, setIsfollowingState] = useState(data?.isfollowing || false);

    const navigate = useNavigate()
    const currentUserId  = useSelector((state) => state.auth.user?._id)
    const person = data;

    // ADD THIS - Sync local state with prop changes
    useEffect(() => {
        setIsfollowingState(data?.isfollowing || false);
    }, [data?.isfollowing]);

    const handleFollow = async () => {
        try {
            const userid = person._id;
            if (!isfollowingState) {
                await followUser({userid, currentUserId}).unwrap();
                setIsfollowingState(true);
            } else {
                await unfollowUser({userid, currentUserId}).unwrap();
                setIsfollowingState(false);
            }
        }
        catch (err) {
            console.error("Follow/Unfollow failed:", err);
        }
    }

    const handleRedirect = ()=>{
        navigate(`/user/${person._id}/`)
    }

    return (
        <div className="w-full">
            <div className="space-y-3">
                <div
                    key={person?._id}
                    className="flex items-center gap-5 p-5 bg-white rounded-2xl border hover:shadow-md transition-all duration-200"
                >
                    {/* Profile Image */}
                    <div className="flex-shrink-0">
                        {person?.profileimg ? (
                            <img
                                src={person?.profileimg}
                                alt={person?.name || person?.username}
                                className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-50 border"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border">
                                <User className="w-7 h-7 text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 hover:underline truncate cursor-pointer hover:text-gray-700 transition-colors inline text-base" onClick={handleRedirect}>
                            {person?.name || 'Unknown User'}
                        </h3>
                        {person?.username && (
                            <p className="text-sm text-gray-500 truncate mt-0.5">
                                @{person.username}
                            </p>
                        )}
                    </div>

                    {/* Follow Button */}
                    {isfollowingState !== undefined && (
                        <button
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                isfollowingState
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'
                            }`}
                            onClick={handleFollow}
                        >
                            {isfollowingState ? 'Following' : 'Follow'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}