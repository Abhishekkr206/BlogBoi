import React from 'react';
import { useGetFollowerDataQuery } from '../features/user/userApi';
import { useParams } from 'react-router-dom';
import FollowCard from '../components/followCard';
import {LoaderOne as Spinner} from "../components/spinner"

export default function FollowerPage() {
    const { userid } = useParams();
    const { data, error, isLoading } = useGetFollowerDataQuery(userid)
    
    const followerData = data?.message || [];
    console.log("Follower Data:", followerData);
    
    if (isLoading) {
        return <Spinner />
    }
    if (error) {
        return <div>Error loading followers.</div>
    }

    return(
        <>
            <div className="flex flex-col items-center justify-center h-[80vh]">
              {followerData.length > 0 ? (
                followerData.map((follower) => (
                  <FollowCard key={follower._id} data={follower} />
                ))
              ) : (
                <p>No followers yet.</p>
              )}
            </div>
        </>
    )
}