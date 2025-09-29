import Home from "../pages/home"
import Navbar from "../components/navbar"
import PostCard from "../components/postCard"
import BottomNavbar from "../components/bottomNav/bottomNavbar"
import {LoaderOne as Spinner} from "../components/spinner"
import CommentCard from "../components/comment"
import LoginForm from "../components/auth/login"
import SignupForm from "../components/auth/signup"
import UserProfile from "../pages/user"
import PostSection from "../pages/post"
import CreatePost from "../pages/createPost"

export default function App(){
    return(
        <>
            <Navbar/>
            <CreatePost/>
            <PostSection/>
            {/* <UserProfile/>
            <BottomNavbar/>
            <SignupForm/>
            <LoginForm/>
            <div className="h-[90vh] w-full flex justify-center items-center flex-col gap-2 ">
                <PostCard/>
                <PostCard/>
                <CommentCard/>
            </div> */}
        </>
    )
}