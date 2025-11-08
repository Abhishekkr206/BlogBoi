import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar, Sidebar } from "../components/navbar";
import BottomNavbar from "../components/bottomNav/bottomNavbar";
import Home from "../pages/home";
import PostSection from "../pages/post";
import UserProfile from "../pages/user";
import ProfileEdit from "../pages/profileEdit";
import CreatePost from "../pages/createPost";
import SignupForm from "../components/auth/signup";
import LoginForm from "../components/auth/login";
import FollowingPage from "../pages/following";
import FollowerPage from "../pages/follower";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../features/auth/authSlicer";

export default function App() {

  // Controls sidebar expanded/collapsed state
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const dispatch = useDispatch();

  // Logged-in user id from Redux
  const user = useSelector((state) => state.auth.user?._id);

  // ✅ Load user from localStorage on page refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      dispatch(setUser(JSON.parse(savedUser)));
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>

        {/* ────────────────────────────────────────────────
            🔐 AUTH ROUTES (Navbar only, no Sidebar)
        ──────────────────────────────────────────────── */}
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

        {/* ────────────────────────────────────────────────
            🌐 MAIN APP ROUTES (Navbar + Sidebar)
        ──────────────────────────────────────────────── */}
        <Route
          path="/*"
          element={
            <div className="flex h-screen">

              {/* Sidebar always exists but can shrink/expand */}
              <Sidebar
                isExpanded={isSidebarExpanded}
                setIsExpanded={setIsSidebarExpanded}
              />

              {/* Main layout content wrapper */}
              <div
                className={`flex-1 flex flex-col transition-all duration-300 ${
                  user
                    ? isSidebarExpanded
                      ? "md:ml-64" // full sidebar width
                      : "md:ml-16" // collapsed sidebar width
                    : "ml-0" // no sidebar shifting if not logged in
                }`}
              >
                <Navbar />

                {/* Nested Routes inside layout */}
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/post/:postid" element={<PostSection />} />
                  <Route path="/creat" element={<CreatePost />} />
                  <Route path="/user/:userid" element={<UserProfile />} />
                  <Route path="/user/:userid/following" element={<FollowingPage />} />
                  <Route path="/user/:userid/follower" element={<FollowerPage />} />
                  <Route path="/user/edit" element={<ProfileEdit />} />
                </Routes>

                {/* Optional: Mobile bottom navigation */}
                {/* <BottomNavbar /> */}
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
