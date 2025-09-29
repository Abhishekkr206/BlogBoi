import {BrowserRouter, Routes, Route} from "react-router-dom"
import Navbar from "../components/navbar"
import BottomNavbar from "../components/bottomNav/bottomNavbar"
import Home from "../pages/home"
import PostSection from "../pages/post"
import UserProfile from "../pages/user"
import CreatePost from "../pages/createPost"

export default function App(){
    return(
        <BrowserRouter>
            <Navbar/>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/post" element={<PostSection/>} />
                <Route path="/creat" element={<CreatePost/>} />
                <Route path="/user" element={<UserProfile/>} />
            </Routes>
            <BottomNavbar/>
        </BrowserRouter>
    )
}