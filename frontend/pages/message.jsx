import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetMessagesQuery } from "../features/message/messageApi";
import { socket } from "../features/message/socketSlice";
import { CheckCheck, ArrowLeft } from "lucide-react";

const ChatPage = () => {
  const { receiverId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const receiver = location.state || {};
  const [text, setText] = useState("");
  const scrollRef = useRef();
  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?._id || currentUser?.id;

  const { data, isLoading } = useGetMessagesQuery(receiverId, {
    skip: !receiverId || receiverId === "undefined",
  });

  useEffect(() => {
    const handleActiveChatReceive = (newMessage) => {
      if (newMessage.senderId === receiverId) {
        socket.emit("mark_read", { senderId: receiverId });
      }
    };
    socket.on("receive_message", handleActiveChatReceive);
    return () => socket.off("receive_message", handleActiveChatReceive);
  }, [receiverId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.message]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !receiverId) return;
    socket.emit("send_message", { receiverId, text });
    setText("");
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">

      {/* Mobile-only header */}
      <div className="flex items-center justify-between gap-3 p-3 bg-white border-b md:hidden shrink-0">
        <div
          className="flex items-center gap-2 min-w-0"
          onClick={() => navigate(`/user/${receiverId}`)}
        >
          <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
            {receiver.profileimg ? (
              <img src={receiver.profileimg} alt="profile" className="w-full h-full object-cover" />
            ) : (
              receiver.username?.charAt(0).toUpperCase() || "U"
            )}
          </div>
          <span className="font-semibold text-gray-900 truncate">
            {receiver.username || "Unknown User"}
          </span>
        </div>
        <button
          onClick={() => navigate("/chat")}
          className="flex items-center gap-1 text-blue-600 font-medium shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Messages - only this scrolls */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {data?.message?.map((msg, i) => {
          const isMe = msg.senderId?.toString() === currentUserId?.toString();
          return (
            <div key={msg._id || i} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`p-3 min-w-[80px] flex flex-col rounded-2xl max-w-sm break-words whitespace-pre-wrap ${
                  isMe
                    ? "bg-gray-600 text-white rounded-br-none"
                    : "bg-white border text-gray-800 rounded-bl-none"
                }`}
              >
                <span>{msg.text}</span>
                <div className={`flex items-center gap-1 ${isMe ? "justify-end" : "justify-start"}`}>
                  {isMe && (
                    <CheckCheck
                      className={`w-4 h-4 mt-1 self-end transition-colors ${
                        msg.isRead ? "text-blue-400" : "text-white"
                      }`}
                    />
                  )}
                  <span className="text-xs text-gray-300 mt-1 self-end">
                    {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2 shrink-0 overflow-hidden w-full">
        <input
          className="flex-1 min-w-0 border border-gray-300 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-blue-200"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit" className="bg-gray-600 text-white px-4 py-2 rounded-full hover:bg-gray-700 shrink-0">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPage;