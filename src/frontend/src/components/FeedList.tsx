import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import type { PaginatedPosts, Post } from "../utils/types";
import { FeedSkeleton } from "./FeedSkeleton";
import { NewPostsIndicator } from "./NewPostsIndicator";
import { PostCard } from "./PostCard";

interface FeedListProps {
  query: UseInfiniteQueryResult<InfiniteData<PaginatedPosts>, Error>;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptyDescription: string;
}

export function FeedList({
  query,
  emptyIcon,
  emptyTitle,
  emptyDescription,
}: FeedListProps) {
  const {
    data: feedData,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = query;

  const allPosts = useMemo(
    () => feedData?.pages.flatMap((page) => page.posts) ?? [],
    [feedData],
  );

  const [seenTopPostId, setSeenTopPostId] = useState<bigint | null>(null);
  const feedTopRef = useRef<HTMLDivElement>(null);

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  // Set initial seen post ID on first data load
  useEffect(() => {
    if (allPosts.length > 0 && seenTopPostId === null) {
      setSeenTopPostId(allPosts[0].id);
    }
  }, [allPosts, seenTopPostId]);

  const { visiblePosts, newPostCount } = useMemo(() => {
    if (seenTopPostId === null || allPosts.length === 0) {
      return { visiblePosts: allPosts, newPostCount: 0 };
    }
    const idx = allPosts.findIndex((p) => p.id === seenTopPostId);
    if (idx <= 0) return { visiblePosts: allPosts, newPostCount: 0 };
    return { visiblePosts: allPosts.slice(idx), newPostCount: idx };
  }, [allPosts, seenTopPostId]);

  const handleShowNewPosts = useCallback(() => {
    if (allPosts.length > 0) {
      setSeenTopPostId(allPosts[0].id);
    }
    feedTopRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allPosts]);

  if (isLoading) return <FeedSkeleton />;

  if (isError) {
    return (
      <p className="p-4 text-center text-destructive">Failed to load feed.</p>
    );
  }

  if (allPosts.length === 0) {
    return (
      <div className="flex flex-col items-center px-8 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          {emptyIcon}
        </div>
        <p className="text-lg font-semibold">{emptyTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <>
      <div ref={feedTopRef} />
      <NewPostsIndicator count={newPostCount} onClick={handleShowNewPosts} />
      {visiblePosts.map((post) => (
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
