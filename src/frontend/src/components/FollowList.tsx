import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link, getRouteApi } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import {
  useFollowers,
  useFollowing,
  useProfileByUsername,
} from "../hooks/useQueries";
import { getInitials } from "../utils/formatting";
import type { FollowUserResponse } from "../utils/types";
import { BackButton } from "./BackButton";

interface FollowListProps {
  type: "followers" | "following";
}

const followersRouteApi = getRouteApi("/$username/followers");
const followingRouteApi = getRouteApi("/$username/following");

export function FollowList({ type }: FollowListProps) {
  const { username: followersUsername } = followersRouteApi.useParams();
  const { username: followingUsername } = followingRouteApi.useParams();
  const username = type === "followers" ? followersUsername : followingUsername;

  const { data: profile, isLoading: isLoadingProfile } =
    useProfileByUsername(username);

  const {
    data: followersData,
    isLoading: isLoadingFollowers,
    isError: isFollowersError,
    hasNextPage: hasNextFollowers,
    fetchNextPage: fetchNextFollowers,
    isFetchingNextPage: isFetchingNextFollowers,
  } = useFollowers(username);

  const {
    data: followingData,
    isLoading: isLoadingFollowing,
    isError: isFollowingError,
    hasNextPage: hasNextFollowing,
    fetchNextPage: fetchNextFollowing,
    isFetchingNextPage: isFetchingNextFollowing,
  } = useFollowing(username);

  const isLoading =
    type === "followers" ? isLoadingFollowers : isLoadingFollowing;
  const isError = type === "followers" ? isFollowersError : isFollowingError;
  const hasNextPage =
    type === "followers" ? hasNextFollowers : hasNextFollowing;
  const fetchNextPage =
    type === "followers" ? fetchNextFollowers : fetchNextFollowing;
  const isFetchingNextPage =
    type === "followers" ? isFetchingNextFollowers : isFetchingNextFollowing;

  const users: FollowUserResponse[] =
    type === "followers"
      ? (followersData?.pages.flatMap((p) => p.users) ?? [])
      : (followingData?.pages.flatMap((p) => p.users) ?? []);

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rootMargin: "0px",
  });

  const displayName = profile?.displayName ?? username;

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/80 px-4 py-2 backdrop-blur-sm">
        <BackButton />
        <div>
          {isLoadingProfile ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <>
              <p className="text-sm font-semibold leading-tight">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground">@{username}</p>
            </>
          )}
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex border-b">
        <Link
          to="/$username/followers"
          params={{ username }}
          className={cn(
            "flex-1 py-3 text-center text-sm font-medium transition-colors hover:bg-muted/50",
            type === "followers"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground",
          )}
        >
          Followers
        </Link>
        <Link
          to="/$username/following"
          params={{ username }}
          className={cn(
            "flex-1 py-3 text-center text-sm font-medium transition-colors hover:bg-muted/50",
            type === "following"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground",
          )}
        >
          Following
        </Link>
      </div>

      {/* List */}
      {isLoading && (
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: stable list
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <p className="p-4 text-center text-destructive">
          Failed to load {type}.
        </p>
      )}

      {!isLoading && !isError && users.length === 0 && (
        <div className="flex flex-col items-center px-8 py-16 text-center">
          <p className="text-muted-foreground">
            {type === "followers"
              ? "No followers yet."
              : "Not following anyone yet."}
          </p>
        </div>
      )}

      {!isLoading &&
        !isError &&
        users.map((user: FollowUserResponse) => (
          <Link
            key={user.principal.toString()}
            to="/$username"
            params={{ username: user.username }}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
          >
            <Avatar className="h-10 w-10 shrink-0">
              {user.profilePictureHash && (
                <AvatarImage
                  src={user.profilePictureHash.getDirectURL()}
                  alt={user.displayName}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="text-xs">
                {getInitials(user.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user.displayName}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                @{user.username}
              </p>
            </div>
          </Link>
        ))}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
