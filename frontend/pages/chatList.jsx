import React from "react";
import { useGetChatListQuery } from "../features/message/messageApi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ChatList = () => {
  const navigate = useNavigate();
  
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?._id || currentUser?.id;

  const { data, isLoading, isError } = useGetChatListQuery(undefined, {
    skip: !currentUserId,
  });

  if (isLoading) return <div className="p-5 text-center font-medium">Loading chats...</div>;
  if (isError) return <div className="p-5 text-center text-red-500">Error loading chat list.</div>;

  const chats = data?.message || []; 

  return (
    <div className="w-full h-full max-w-md mx-auto bg-white shadow-md overflow-auto border pb-20 sm:pb-0">
      <div className="divide-y divide-gray-200">
        {chats.length > 0 ? (
          chats.map((user) => (
            <div
              key={user._id}
              onClick={() =>
                navigate(`/chat/${user._id}`, {
                  state: {
                    userid: user._id,
                    username: user.username,
                    profileimg: user.profileimg,
                  },
                })
              }
              className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition duration-150"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg" >
                {user.profileimg ? (
                  <img src={user.profileimg} alt="Profile Pic" className="w-12 h-12 rounded-full object-cover"   
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/user/${user._id}`);
                    }} 
                  />
                ) : (
                  user.username?.charAt(0).toUpperCase() || "U"
                )}
              </div>

              <div className="ml-4 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="text-gray-900 font-semibold">{user.username || "Unknown User"}</h3>
                </div>
                <p className="text-sm text-gray-500 truncate">Click to send a message</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-gray-500 italic">
            No chats found. Start a conversation!
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;