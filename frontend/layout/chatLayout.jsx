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

      <div className="flex h-full overflow-hidden w-full">
        <div
          className={`h-full sm:min-w-[350px] ${
            receiverId ? "hidden md:block md:w-auto" : "w-full md:w-auto"
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