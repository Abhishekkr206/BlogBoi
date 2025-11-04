import { useState, useEffect } from "react";
import PostCard from "../components/postCard";
import { LoaderOne as Spinner } from "../components/spinner";
import { LoaderTwo } from "../components/spinner";
import InfiniteScroll from "react-infinite-scroll-component";

import { useGetPostsQuery } from "../features/post/postApi";

export default function Home() {
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, isFetching } = useGetPostsQuery({ page });

  // Load posts when data changes
  useEffect(() => {
    if (data?.message) {
      if (page === 1) {
        // First page: replace all posts
        setAllPosts(data.message);
      } else {
        // Subsequent pages: append new posts
        setAllPosts((prev) => {
          const newPosts = data.message.filter(
            (post) => !prev.some((p) => p._id === post._id)
          );
          return [...prev, ...newPosts];
        });
      }

      // Check if there are more posts
        setHasMore(data.hasMore);
    }
  }, [data, page]);

  if (isLoading && page === 1) return <Spinner />;

  const fetchMore = () => {
      setPage((prev) => prev + 1);
  };

  return (
    <>
      <div className="min-h-screen w-full flex flex-col justify-start items-center gap-5 py-5">
        <InfiniteScroll
          dataLength={allPosts.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={<h4 className="text-center py-4"><LoaderTwo/></h4>}
          endMessage={
            <p className="text-center py-4 text-gray-500">
              No more posts to show 
            </p>
          }
        >
          <div className="flex flex-col gap-5 items-center">
            {allPosts.map((post) => (
              <PostCard key={post._id} data={post} />
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </>
  );
}