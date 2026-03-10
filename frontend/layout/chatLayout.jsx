import { Outlet, useParams } from "react-router-dom";
import ChatList from "../pages/chatList";

export default function ChatLayout() {
  const { receiverId } = useParams();

  return (
    <>
      {receiverId && (
        <style>{`
          @media (max-width: 767px) {
            .app-sidebar { display: none !important; }
          }
        `}</style>
      )}

      <div className="flex h-full w-full overflow-hidden">
        <div
          className={`h-full shrink-0 sm:w-[350px] ${
            receiverId ? "hidden md:block" : "w-full md:w-[350px]"
          }`}
        >
          <ChatList />
        </div>

        <div
          className={`h-full flex-1 min-w-0 ${
            receiverId ? "block" : "hidden md:block"
          }`}
        >
          <Outlet />
        </div>
      </div>
    </>
  );
}