import { Loader2, Search } from "lucide-react";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useSearchPosts } from "../hooks/useQueries";
import { FeedSkeleton } from "./FeedSkeleton";
import { PostCard } from "./PostCard";

interface PostResultsProps {
  query: string;
}

export function PostResults({ query }: PostResultsProps) {
  const {
    data: postsData,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSearchPosts(query);

  const posts = postsData?.pages.flatMap((page) => page.posts) ?? [];

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  if (isLoading) return <FeedSkeleton />;

  if (isError) {
    return (
      <p className="p-4 text-center text-destructive">
        Failed to search posts.
      </p>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center px-8 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Search className="h-8 w-8 text-primary" />
        </div>
        <p className="text-lg font-semibold">No results</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No posts found for &ldquo;{query}&rdquo;
        </p>
      </div>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id.toString()} post={post} />
      ))}
      <div ref={sentinelRef} className="h-1" />
      {isFetchingNextPage && (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </>
  );
}
