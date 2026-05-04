import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Principal } from "@dfinity/principal";
import { Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { toast } from "sonner";
import {
  useFollowUser,
  useSearchUsers,
  useUnfollowUser,
} from "../hooks/useQueries";
import { getInitials } from "../utils/formatting";
import type { UserProfileResponse } from "../utils/types";

interface UserResultsProps {
  query: string;
}

export function UserResults({ query }: UserResultsProps) {
  const { data: users, isLoading, isError } = useSearchUsers(query);
  const { mutate: followUser, isPending: isFollowPending } = useFollowUser();
  const { mutate: unfollowUser, isPending: isUnfollowPending } =
    useUnfollowUser();

  const isActionPending = isFollowPending || isUnfollowPending;

  const handleFollow = (user: UserProfileResponse) => {
    followUser(Principal.fromText(user.principal.toText()), {
      onError: (error: Error) => {
        toast.error(error.message || "Failed to follow user");
      },
    });
  };

  const handleUnfollow = (user: UserProfileResponse) => {
    unfollowUser(Principal.fromText(user.principal.toText()), {
      onError: (error: Error) => {
        toast.error(error.message || "Failed to unfollow user");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: stable list
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="p-4 text-center text-destructive">
        Failed to search users.
      </p>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="flex flex-col items-center px-8 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <p className="text-lg font-semibold">No results</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No users found for &ldquo;{query}&rdquo;
        </p>
      </div>
    );
  }

  return (
    <div>
      {users.map((user) => (
        <div
          key={user.principal.toText()}
          className="flex items-center gap-3 border-b px-4 py-3 transition-colors hover:bg-muted/50"
        >
          <Link
            to="/$username"
            params={{ username: user.username }}
            className="shrink-0"
          >
            <Avatar className="h-10 w-10">
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
          </Link>
          <Link
            to="/$username"
            params={{ username: user.username }}
            className="min-w-0 flex-1 text-left"
          >
            <p className="truncate text-sm font-semibold">{user.displayName}</p>
            <p className="truncate text-sm text-muted-foreground">
              @{user.username}
            </p>
            {user.bio && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {user.bio}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {user.followersCount.toString()} followers
            </p>
          </Link>
          <Button
            variant={user.isFollowedByCurrentUser ? "outline" : "default"}
            size="sm"
            className="shrink-0"
            disabled={isActionPending}
            onClick={() => {
              if (user.isFollowedByCurrentUser) {
                handleUnfollow(user);
              } else {
                handleFollow(user);
              }
            }}
          >
            {user.isFollowedByCurrentUser ? "Unfollow" : "Follow"}
          </Button>
        </div>
      ))}
    </div>
  );
}
