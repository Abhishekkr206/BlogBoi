import { useState, useEffect } from "react";
import PostCard from "../components/postCard";
import { LoaderOne as Spinner } from "../components/spinner";
import { LoaderTwo } from "../components/spinner";
import InfiniteScroll from "react-infinite-scroll-component";
import { useGetPostsQuery } from "../features/post/postApi";

export default function Home() {
  // Current page number for pagination
  const [page, setPage] = useState(1);

  // Stores all loaded posts
  const [allPosts, setAllPosts] = useState([]);

  // Tracks if more posts are available to fetch
  const [hasMore, setHasMore] = useState(true);

  // Fetch posts using RTK Query, based on page
  const { data, isLoading, isFetching } = useGetPostsQuery({ page });

  // Update UI when new data arrives
  useEffect(() => {
    if (data?.message) {
      // If first page → replace all posts
      if (page === 1) {
        setAllPosts(data.message);
      } else {
        // For next pages → append only unique posts (avoid duplicates)
        setAllPosts((prev) => {
          const newPosts = data.message.filter(
            (post) => !prev.some((p) => p._id === post._id)
          );
          return [...prev, ...newPosts];
        });
      }

      // Update if more posts are available
      setHasMore(data.hasMore);
    }
  }, [data, page]);

  // Show full-screen loader only on initial load
  if (isLoading && page === 1) return <Spinner />;

  // Load next page when user scrolls down
  const fetchMore = () => {
    // Prevent extra calls while loading + stop if no more posts
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="w-full min-h-screen">
      <InfiniteScroll
        dataLength={allPosts.length} // Tells component how many items are rendered
        next={fetchMore} // Function to load more data
        hasMore={hasMore} // Controls whether InfiniteScroll should continue
        loader={
          <div className="text-center py-4">
            <LoaderTwo />
          </div>
        }
        endMessage={
          <p className="text-center py-4 text-gray-500 font-medium mb-20">
            No more posts to show
          </p>
        }
      >
        {/* Render all post cards */}
        <div className="flex flex-col justify-start items-center gap-5 py-5 px-2.5 w-full">
          {allPosts.map((post) => (
            <PostCard key={post._id} data={post} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}
