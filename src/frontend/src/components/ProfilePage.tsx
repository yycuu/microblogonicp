import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, getRouteApi } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  Camera,
  Loader2,
  MoreHorizontal,
  PenLine,
  Search,
  ShieldBan,
  ShieldCheck,
  ShieldOff,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useMediaUpload } from "../hooks/useMediaUpload";
import {
  useBlockUser,
  useFollowUser,
  useMuteUser,
  usePostsByUsername,
  useProfile,
  useProfileByUsername,
  useUnblockUser,
  useUnfollowUser,
  useUnmuteUser,
  useUpdateHeaderImage,
  useUpdateProfilePicture,
} from "../hooks/useQueries";
import { fromNanoseconds, getInitials } from "../utils/formatting";
import { BackButton } from "./BackButton";
import { EditProfileDialog } from "./EditProfileDialog";
import { FeedSkeleton } from "./FeedSkeleton";
import { PostCard } from "./PostCard";
import { PostText } from "./PostText";

const profileRouteApi = getRouteApi("/$username");

export function ProfilePage() {
  const { username } = profileRouteApi.useParams();

  const { data: currentUserProfile, isError: isCurrentProfileError } =
    useProfile();

  const isOwnProfile =
    !isCurrentProfileError &&
    !!currentUserProfile &&
    currentUserProfile.username.toLowerCase() === username.toLowerCase();

  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isProfileError,
  } = useProfileByUsername(username);

  const {
    data: postsData,
    isLoading: isLoadingPosts,
    isError: isPostsError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = usePostsByUsername(username);

  const profilePrincipal = profile?.principal ?? null;

  const { mutate: followUser, isPending: isFollowPending } = useFollowUser();
  const { mutate: unfollowUser, isPending: isUnfollowPending } =
    useUnfollowUser();
  const { mutate: blockUser, isPending: isBlockPending } = useBlockUser();
  const { mutate: unblockUser, isPending: isUnblockPending } = useUnblockUser();
  const { mutate: muteUser, isPending: isMutePending } = useMuteUser();
  const { mutate: unmuteUser, isPending: isUnmutePending } = useUnmuteUser();
  const { mutate: updateProfilePicture, isPending: isUploadingPicture } =
    useUpdateProfilePicture();
  const { mutate: updateHeaderImage, isPending: isUploadingHeader } =
    useUpdateHeaderImage();
  const {
    file: avatarFile,
    selectMedia: selectAvatarImage,
    removeMedia: removeAvatarImage,
    createBlob: createAvatarBlob,
    MediaInput: AvatarImageInput,
  } = useMediaUpload("image");
  const {
    file: headerFile,
    selectMedia: selectHeaderImage,
    removeMedia: removeHeaderImage,
    createBlob: createHeaderBlob,
    MediaInput: HeaderImageInput,
  } = useMediaUpload("image");
  const [avatarUploadProgress, setAvatarUploadProgress] = useState<
    number | null
  >(null);
  const [headerUploadProgress, setHeaderUploadProgress] = useState<
    number | null
  >(null);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showBlockedPosts, setShowBlockedPosts] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    setShowBlockedPosts(false);
  }, [username]);
  const isUploadingAvatar = isUploadingPicture || avatarUploadProgress !== null;
  const isUploadingHeaderImage =
    isUploadingHeader || headerUploadProgress !== null;

  // Auto-upload when avatar file is selected
  useEffect(() => {
    if (!avatarFile) return;
    let cancelled = false;

    async function upload() {
      try {
        setAvatarUploadProgress(0);
        const blob = await createAvatarBlob((pct) =>
          setAvatarUploadProgress(pct),
        );
        if (cancelled || !blob) return;
        updateProfilePicture(blob, {
          onSuccess: () => {
            toast.success("Profile picture updated");
            setAvatarUploadProgress(null);
            removeAvatarImage();
          },
          onError: (error) => {
            toast.error(error.message || "Failed to update profile picture");
            setAvatarUploadProgress(null);
            removeAvatarImage();
          },
        });
      } catch {
        if (!cancelled) {
          toast.error("Failed to upload image");
          setAvatarUploadProgress(null);
          removeAvatarImage();
        }
      }
    }

    upload();
    return () => {
      cancelled = true;
    };
  }, [avatarFile, createAvatarBlob, updateProfilePicture, removeAvatarImage]);

  // Auto-upload when header file is selected
  useEffect(() => {
    if (!headerFile) return;
    let cancelled = false;

    async function upload() {
      try {
        setHeaderUploadProgress(0);
        const blob = await createHeaderBlob((pct) =>
          setHeaderUploadProgress(pct),
        );
        if (cancelled || !blob) return;
        updateHeaderImage(blob, {
          onSuccess: () => {
            toast.success("Header image updated");
            setHeaderUploadProgress(null);
            removeHeaderImage();
          },
          onError: (error) => {
            toast.error(error.message || "Failed to update header image");
            setHeaderUploadProgress(null);
            removeHeaderImage();
          },
        });
      } catch {
        if (!cancelled) {
          toast.error("Failed to upload image");
          setHeaderUploadProgress(null);
          removeHeaderImage();
        }
      }
    }

    upload();
    return () => {
      cancelled = true;
    };
  }, [headerFile, createHeaderBlob, updateHeaderImage, removeHeaderImage]);

  const posts = postsData?.pages.flatMap((page) => page.posts) ?? [];

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const handleFollow = () => {
    if (!profilePrincipal) return;
    followUser(profilePrincipal, {
      onError: (error) => {
        toast.error(error.message || "Failed to follow user");
      },
    });
  };

  const handleUnfollow = () => {
    if (!profilePrincipal) return;
    unfollowUser(profilePrincipal, {
      onError: (error) => {
        toast.error(error.message || "Failed to unfollow user");
      },
    });
  };

  const handleBlock = () => {
    if (!profilePrincipal) return;
    blockUser(profilePrincipal, {
      onSuccess: () => toast.success("User blocked"),
      onError: (error) => {
        toast.error(error.message || "Failed to block user");
      },
    });
  };

  const handleUnblock = () => {
    if (!profilePrincipal) return;
    unblockUser(profilePrincipal, {
      onSuccess: () => toast.success("User unblocked"),
      onError: (error) => {
        toast.error(error.message || "Failed to unblock user");
      },
    });
  };

  const handleMute = () => {
    if (!profilePrincipal) return;
    muteUser(profilePrincipal, {
      onSuccess: () => toast.success("User muted"),
      onError: (error) => {
        toast.error(error.message || "Failed to mute user");
      },
    });
  };

  const handleUnmute = () => {
    if (!profilePrincipal) return;
    unmuteUser(profilePrincipal, {
      onSuccess: () => toast.success("User unmuted"),
      onError: (error) => {
        toast.error(error.message || "Failed to unmute user");
      },
    });
  };

  if (isLoadingProfile) {
    return (
      <div>
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/80 px-4 py-2 backdrop-blur-sm">
          <BackButton />
          <Skeleton className="h-4 w-24" />
        </div>
        <AspectRatio ratio={3 / 1}>
          <Skeleton className="h-full w-full rounded-none" />
        </AspectRatio>
        <div className="border-b px-4 py-4">
          <div className="flex items-start gap-3">
            <Skeleton className="-mt-10 h-16 w-16 shrink-0 rounded-full border-4 border-background" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
        <FeedSkeleton />
      </div>
    );
  }

  if (isProfileError) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Failed to load profile.</p>
        <BackButton variant="link" label="Go back" className="mt-2" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center px-8 py-20 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">This account doesn't exist</h2>
        <p className="mt-1 text-muted-foreground">Try searching for another.</p>
        <BackButton variant="link" label="Go back" className="mt-4" />
      </div>
    );
  }

  const initials = getInitials(profile.displayName);
  const profilePictureUrl = profile.profilePictureHash
    ? profile.profilePictureHash.getDirectURL()
    : null;
  const headerImageUrl = profile.headerImageHash
    ? profile.headerImageHash.getDirectURL()
    : null;
  const joinedDate = fromNanoseconds(profile.createdAt);
  const isFollowActionPending = isFollowPending || isUnfollowPending;
  const isMenuActionPending =
    isBlockPending || isUnblockPending || isMutePending || isUnmutePending;

  return (
    <div>
      {/* Header bar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-background/80 px-4 py-2 backdrop-blur-sm">
        <BackButton />
        <div>
          <p className="text-sm font-semibold leading-tight">
            {profile.displayName}
          </p>
          <p className="text-xs text-muted-foreground">
            {profile.postsCount.toString()} posts
          </p>
        </div>
      </div>

      {/* Header banner */}
      <div className="relative">
        <AspectRatio ratio={3 / 1}>
          {headerImageUrl ? (
            <img
              src={headerImageUrl}
              alt="Profile header"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </AspectRatio>
        {isOwnProfile && (
          <>
            <button
              type="button"
              className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100"
              onClick={selectHeaderImage}
              disabled={isUploadingHeaderImage}
              aria-label="Change header image"
            >
              {isUploadingHeaderImage ? (
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </button>
            <HeaderImageInput />
          </>
        )}
        {isUploadingHeaderImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Profile header */}
      <div className="border-b px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="relative -mt-10 shrink-0 rounded-full border-4 border-background">
              <Avatar className="h-16 w-16">
                {profilePictureUrl && (
                  <AvatarImage
                    src={profilePictureUrl}
                    alt={profile.displayName}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <>
                  <button
                    type="button"
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity hover:opacity-100"
                    onClick={selectAvatarImage}
                    disabled={isUploadingAvatar}
                    aria-label="Change profile picture"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                      <Camera className="h-5 w-5 text-white" />
                    )}
                  </button>
                  <AvatarImageInput />
                </>
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">
                {profile.displayName}
              </h2>
              <p className="text-sm text-muted-foreground">
                @{profile.username}
              </p>
            </div>
          </div>

          {isOwnProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditProfileOpen(true)}
            >
              Edit profile
            </Button>
          )}

          {!isOwnProfile && (
            <div className="flex items-center gap-2">
              {profile.isBlockedByCurrentUser ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleUnblock}
                  disabled={isUnblockPending}
                >
                  {isUnblockPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldOff className="h-4 w-4" />
                  )}
                  Blocked
                </Button>
              ) : (
                <Button
                  variant={
                    profile.isFollowedByCurrentUser ? "outline" : "default"
                  }
                  size="sm"
                  onClick={
                    profile.isFollowedByCurrentUser
                      ? handleUnfollow
                      : handleFollow
                  }
                  disabled={isFollowActionPending}
                >
                  {isFollowActionPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {profile.isFollowedByCurrentUser ? "Unfollow" : "Follow"}
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={isMenuActionPending}
                    aria-label="User options"
                  >
                    {isMenuActionPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {profile.isBlockedByCurrentUser ? (
                    <DropdownMenuItem onClick={handleUnblock}>
                      <ShieldCheck className="h-4 w-4" />
                      Unblock @{profile.username}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={handleBlock}
                      className="text-destructive"
                    >
                      <ShieldBan className="h-4 w-4" />
                      Block @{profile.username}
                    </DropdownMenuItem>
                  )}
                  {profile.isMutedByCurrentUser ? (
                    <DropdownMenuItem onClick={handleUnmute}>
                      <Volume2 className="h-4 w-4" />
                      Unmute @{profile.username}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={handleMute}>
                      <VolumeX className="h-4 w-4" />
                      Mute @{profile.username}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {profile.bio && (
          <PostText
            text={profile.bio}
            className="mt-3 text-sm whitespace-pre-wrap"
          />
        )}

        <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
          <span>Joined {format(joinedDate, "MMM yyyy")}</span>
        </div>

        <div className="mt-2 flex gap-4 text-sm">
          <Link
            to="/$username/following"
            params={{ username: profile.username }}
            className="hover:underline"
          >
            <span className="font-semibold text-foreground">
              {profile.followingCount.toString()}
            </span>{" "}
            <span className="text-muted-foreground">Following</span>
          </Link>
          <Link
            to="/$username/followers"
            params={{ username: profile.username }}
            className="hover:underline"
          >
            <span className="font-semibold text-foreground">
              {profile.followersCount.toString()}
            </span>{" "}
            <span className="text-muted-foreground">Followers</span>
          </Link>
        </div>
      </div>

      {/* Post timeline */}
      {profile.isBlockedByCurrentUser && !showBlockedPosts ? (
        <div className="flex flex-col items-center px-8 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldBan className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-lg font-semibold">
            @{profile.username} is blocked
          </p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            They can't follow you or view your posts, and you won't see
            notifications from them.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setShowBlockedPosts(true)}
          >
            View posts
          </Button>
        </div>
      ) : isLoadingPosts ? (
        <FeedSkeleton />
      ) : isPostsError ? (
        <p className="p-4 text-center text-destructive">
          Failed to load posts.
        </p>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center px-8 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <PenLine className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-semibold">No posts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isOwnProfile
              ? "Share your first post with the world!"
              : `@${profile.username} hasn't posted anything yet.`}
          </p>
        </div>
      ) : (
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
      )}

      {isOwnProfile && profile && (
        <EditProfileDialog
          open={isEditProfileOpen}
          onOpenChange={setIsEditProfileOpen}
          profile={profile}
        />
      )}
    </div>
  );
}
