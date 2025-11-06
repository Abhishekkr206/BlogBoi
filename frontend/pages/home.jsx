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
        setAllPosts(data.message);
      } else {
        setAllPosts((prev) => {
          const newPosts = data.message.filter(
            (post) => !prev.some((p) => p._id === post._id)
          );
          return [...prev, ...newPosts];
        });
      }
      setHasMore(data.hasMore);
    }
  }, [data, page]);

  if (isLoading && page === 1) return <Spinner />;

  const fetchMore = () => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="w-full min-h-screen">
      <InfiniteScroll
        dataLength={allPosts.length}
        next={fetchMore}
        hasMore={hasMore}
        loader={
          <div className="text-center py-4">
            <LoaderTwo/>
          </div>
        }
        endMessage={
          <p className="text-center py-4 text-gray-500 font-medium mb-20">
            No more posts to show 
          </p>
        }
      >
        <div className="flex flex-col justify-start items-center gap-5 py-5 px-1 w-full">
          {allPosts.map((post) => (
            <PostCard key={post._id} data={post} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}