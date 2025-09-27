import { Heart, MessageCircle } from "lucide-react"

export default function PostCard(data){
    const {profilePic,username,like,title,content,img,time} = data
    return(
        <>
            <div>
                {/* upper part of the post */}
                <div>
                    <div>
                        <img src={profilePic} alt={username} />
                        <h4>{username}</h4>
                    </div>
                    <h4>{time}</h4>
                </div>

                {/* main conent */}
                <div>
                    <div>
                        <h2>{title}</h2>
                        <p>{content}</p>
                    </div>
                    <div>
                        <img src={img} alt={title} />
                    </div>
                </div>

                {/* bottom part like and comment */}
                <div> 
                    <div>
                        <h4>{like}</h4>
                        <img src={Heart} alt="like" />
                    </div>
                    <img src={MessageCircle} alt="comment" />
                </div>
            </div>
        </>
    )
}