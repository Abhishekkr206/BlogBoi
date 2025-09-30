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

import { useGetPostsQuery } from "../features/post/postApi"

export default function Home(){
    const {data, isloading } = useGetPostsQuery()    

    // console.log(data.message)
    
    if(isloading) return <Spinner/>
    const posts = data?.message || [];
    
    return(
        <>
            <div className="min-h-screen w-full flex flex-col justify-start items-center gap-5 py-5">
                {
                    posts.map((post)=>(
                        <PostCard key={post._id} data={post} />
                    ))
                }
            </div>
        </>
    )
}