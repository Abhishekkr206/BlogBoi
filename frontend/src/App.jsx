import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Navbar, Sidebar } from "../components/navbar";
import Home from "../pages/home";
import PostSection from "../pages/post";
import UserProfile from "../pages/user";
import ProfileEdit from "../pages/profileEdit";
import CreatePost from "../pages/createPost";
import SignupForm from "../components/auth/signup";
import LoginForm from "../components/auth/login";
import FollowingPage from "../pages/following";
import FollowerPage from "../pages/follower";
import ChatPage from "../pages/message";
import ChatLayout from "../layout/chatLayout";
import EmptyState from "../pages/emptyState";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../features/auth/authSlicer";

function AppLayout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user?._id);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      dispatch(setUser(JSON.parse(savedUser)));
    }
  }, [dispatch]);

  const isChat = location.pathname.startsWith("/chat");

useEffect(() => {
  if (isChat) {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }
  return () => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  };
}, [isChat]);

  return (
    <Routes>
      <Route
        path="/register/details"
        element={
          <div className="flex flex-col h-screen">
            <Navbar />
            <SignupForm />
          </div>
        }
      />

      <Route
        path="/login"
        element={
          <div className="flex flex-col h-screen">
            <Navbar />
            <LoginForm />
          </div>
        }
      />

      <Route
        path="/*"
        element={
          <div className="flex h-screen">
            <div className="app-sidebar">
              <Sidebar
                isExpanded={isSidebarExpanded}
                setIsExpanded={setIsSidebarExpanded}
              />
            </div>

            <div
              className={`flex-1 flex flex-col transition-all duration-300 min-h-0 ${
                user
                  ? isSidebarExpanded
                    ? "md:ml-64"
                    : "md:ml-16"
                  : "ml-0"
              }`}
            >
              {!isChat && <Navbar />}

              <div className={`flex-1 min-h-0 ${isChat ? "overflow-hidden" : ""}`}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/post/:postid" element={<PostSection />} />
                  <Route path="/creat" element={<CreatePost />} />
                  <Route path="/user/:userid" element={<UserProfile />} />
                  <Route path="/user/:userid/following" element={<FollowingPage />} />
                  <Route path="/user/:userid/follower" element={<FollowerPage />} />
                  <Route path="/user/edit" element={<ProfileEdit />} />

                  <Route path="/chat" element={<ChatLayout />}>
                    <Route index element={<EmptyState />} />
                    <Route path=":receiverId" element={<ChatPage />} />
                  </Route>
                </Routes>
              </div>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}