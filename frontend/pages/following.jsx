import React from 'react';
import { useGetFollowingDataQuery } from '../features/user/userApi';
import { useParams } from 'react-router-dom';
import FollowCard from '../components/followCard';
import {LoaderOne as Spinner} from "../components/spinner"

export default function FollowingPage() {
    const { userid } = useParams();
    const { data, error, isLoading } = useGetFollowingDataQuery(userid)

    const followingData = data?.message || [];

    console.log("Follower Data:", followingData);

    if (isLoading) {
        return <Spinner />
    }
    if (error) {
        return <div>Error loading followers.</div>
    }

    return(
        <>
        <div className='h-screen flex justify-center items-start bg-gray-50/50'>
            <div className="h-[80vh] w-[70vw] flex flex-col items-center justify-start py-5 space-y-2">
                  {followingData.length > 0 ? (
                    followingData.map((following) => (
                      <FollowCard key={following._id} data={following} />
                    ))
                  ) : (
                    <p>No followers yet.</p>
                  )}
                </div>
            </div>
        </>
    )
    }