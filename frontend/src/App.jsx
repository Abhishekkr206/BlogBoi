import { useEffect } from "react"
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Navbar from "../components/navbar"
import BottomNavbar from "../components/bottomNav/bottomNavbar"
import Home from "../pages/home"
import PostSection from "../pages/post"
import UserProfile from "../pages/user"
import CreatePost from "../pages/createPost"
import SignupForm from "../components/auth/signup"
import { useDispatch } from "react-redux"
import { setUser } from "../features/auth/authSlicer"

export default function App(){
    const dispatch = useDispatch();

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          dispatch(setUser(JSON.parse(savedUser)));
        }
    }, [dispatch]);

    return(
        <BrowserRouter>
            <Navbar/>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/post/:postid" element={<PostSection/>} />
                <Route path="/creat" element={<CreatePost/>} />
                <Route path="/user/:userid" element={<UserProfile/>} />
                <Route path="/register/details" element={<SignupForm/>} />
            </Routes>
            <BottomNavbar/>
        </BrowserRouter>
    )
}