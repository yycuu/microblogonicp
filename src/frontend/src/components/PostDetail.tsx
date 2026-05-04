import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link, getRouteApi } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  Heart,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Quote,
  Repeat2,
  Trash2,
} from "lucide-react";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { usePostActions } from "../hooks/usePostActions";
import { usePost, useReplies } from "../hooks/useQueries";
import { EDIT_DELETE_WINDOW_MS } from "../utils/constants";
import { fromNanoseconds, getInitials } from "../utils/formatting";
import { BackButton, useGoBack } from "./BackButton";
import { ComposePost } from "./ComposePost";
import { DeletePostDialog } from "./DeletePostDialog";
import { EditPostForm } from "./EditPostForm";
import { PostCard } from "./PostCard";
import { PostText } from "./PostText";

const routeApi = getRouteApi("/post/$id");

function isValidPostId(id: string): boolean {
  return /^\d+$/.test(id);
}

export function PostDetail() {
  const { id } = routeApi.useParams();
  const goBack = useGoBack();
  const validId = isValidPostId(id);
  const postId = validId ? BigInt(id) : null;
  const { identity } = useInternetIdentity();

  const {
    data: post,
    isLoading: isLoadingPost,
    isError: isPostError,
  } = usePost(postId);

  const {
    data: repliesData,
    isLoading: isLoadingReplies,
    isError: isRepliesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReplies(postId);

  const actions = usePostActions({
    postId: postId ?? 0n,
    actionPostId: postId ?? 0n,
    postText: post?.text ?? "",
    isLikedByCurrentUser: post?.isLikedByCurrentUser ?? false,
    isRepostedByCurrentUser: post?.isRepostedByCurrentUser ?? false,
    onDeleteSuccess: goBack,
  });

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  if (!validId) {
    return (
      <div className="p-4">
        <BackButton
          label="Back"
          size="sm"
          className="mb-4 text-muted-foreground"
        />
        <p className="text-muted-foreground">Post not found.</p>
      </div>
    );
  }

  if (isLoadingPost) {
    return (
      <div className="p-4">
        <BackButton
          label="Back"
          size="sm"
          className="mb-4 text-muted-foreground"
        />
        <div className="flex gap-3">
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (isPostError || !post) {
    return (
      <div className="p-4">
        <BackButton
          label="Back"
          size="sm"
          className="mb-4 text-muted-foreground"
        />
        <p className="text-destructive">Failed to load post.</p>
      </div>
    );
  }

  const mediaUrl = post.mediaHash ? post.mediaHash.getDirectURL() : null;
  const currentPrincipal = identity?.getPrincipal().toText();
  const isOwnPost = currentPrincipal === post.author.toText();
  const createdDate = fromNanoseconds(post.createdAt);
  const isWithinWindow =
    Date.now() - createdDate.getTime() < EDIT_DELETE_WINDOW_MS;
  const canModify = isOwnPost && isWithinWindow;
  const initials = getInitials(post.authorDisplayName);
  const avatarUrl = post.authorProfilePictureHash
    ? post.authorProfilePictureHash.getDirectURL()
    : null;
  const replies = repliesData?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <BackButton />
        <h2 className="text-lg font-semibold">Post</h2>
      </div>

      {/* Main post */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start gap-3">
          <Link
            to="/$username"
            params={{ username: post.authorUsername }}
            className="shrink-0"
          >
            <Avatar className="h-12 w-12">
              {avatarUrl && (
                <AvatarImage
                  src={avatarUrl}
                  alt={post.authorDisplayName}
                  className="object-cover"
                />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  to="/$username"
                  params={{ username: post.authorUsername }}
                  className="font-semibold hover:underline"
                >
                  {post.authorDisplayName}
                </Link>
                <Link
                  to="/$username"
                  params={{ username: post.authorUsername }}
                  className="block text-sm text-muted-foreground hover:underline"
                >
                  @{post.authorUsername}
                </Link>
              </div>
              {canModify && !actions.isEditMode && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      aria-label="Post options"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={actions.handleStartEdit}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => actions.setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* Post content */}
        {actions.isEditMode ? (
          <EditPostForm
            editText={actions.editText}
            onEditTextChange={actions.setEditText}
            onSave={actions.handleSaveEdit}
            onCancel={actions.handleCancelEdit}
            isEditing={actions.isEditing}
            textareaClassName="min-h-[80px] text-base"
            className="mt-3"
          />
        ) : (
          <>
            <PostText
              text={post.text}
              className="mt-3 whitespace-pre-wrap break-words text-base"
            />
            {mediaUrl && (
              <div className="mt-3 overflow-hidden rounded-xl border">
                {post.mediaType === "video" ? (
                  // biome-ignore lint/a11y/useMediaCaption: media element
                  <video
                    src={mediaUrl}
                    controls
                    preload="metadata"
                    className="max-h-96 w-full object-contain"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Post attachment"
                    className="max-h-96 w-full object-cover"
                  />
                )}
              </div>
            )}
          </>
        )}

        {/* Timestamp */}
        <p className="mt-3 text-sm text-muted-foreground">
          {format(createdDate, "h:mm a · MMM d, yyyy")}
          {post.editedAt != null && " · Edited"}
        </p>

        {/* Engagement stats */}
        {(post.replyCount > 0n ||
          post.repostCount > 0n ||
          post.likeCount > 0n) && (
          <>
            <Separator className="my-3" />
            <div className="flex gap-4 text-sm">
              {post.replyCount > 0n && (
                <span>
                  <span className="font-semibold">
                    {post.replyCount.toString()}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    {post.replyCount === 1n ? "Reply" : "Replies"}
                  </span>
                </span>
              )}
              {post.repostCount > 0n && (
                <span>
                  <span className="font-semibold">
                    {post.repostCount.toString()}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    {post.repostCount === 1n ? "Repost" : "Reposts"}
                  </span>
                </span>
              )}
              {post.likeCount > 0n && (
                <span>
                  <span className="font-semibold">
                    {post.likeCount.toString()}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    {post.likeCount === 1n ? "Like" : "Likes"}
                  </span>
                </span>
              )}
            </div>
          </>
        )}

        {/* Action buttons */}
        <Separator className="my-3" />
        <div className="flex justify-around">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full p-2 text-muted-foreground transition-colors hover:text-primary"
            onClick={() => document.getElementById("reply-textarea")?.focus()}
            aria-label="Reply"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center gap-2 rounded-full p-2 transition-colors",
                  post.isRepostedByCurrentUser
                    ? "text-green-500"
                    : "text-muted-foreground hover:text-green-500",
                )}
                disabled={actions.isRepostPending}
                aria-label="Repost options"
              >
                <Repeat2 className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={actions.handleRepost}>
                <Repeat2 className="h-4 w-4" />
                {post.isRepostedByCurrentUser ? "Undo repost" : "Repost"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={actions.handleQuote}>
                <Quote className="h-4 w-4" />
                Quote
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 rounded-full p-2 transition-colors",
              post.isLikedByCurrentUser
                ? "text-red-500"
                : "text-muted-foreground hover:text-red-500",
            )}
            onClick={actions.handleLikeToggle}
            disabled={actions.isLikePending}
            aria-label={post.isLikedByCurrentUser ? "Unlike" : "Like"}
          >
            <Heart
              className={cn(
                "h-5 w-5",
                post.isLikedByCurrentUser && "fill-current",
                actions.likeAnimating && "animate-like-pop",
              )}
              onAnimationEnd={() => actions.setLikeAnimating(false)}
            />
          </button>
        </div>
        <Separator className="my-3" />
      </div>

      {/* Reply compose */}
      <ComposePost replyToId={postId} />

      {/* Replies */}
      {isLoadingReplies && (
        <div className="space-y-4 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: stable list
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isRepliesError && (
        <p className="p-4 text-destructive">Failed to load replies.</p>
      )}

      {!isLoadingReplies && !isRepliesError && replies.length === 0 && (
        <div className="flex flex-col items-center px-8 py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <p className="font-semibold">No replies yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to reply!
          </p>
        </div>
      )}

      {replies.map((reply) => (
        <PostCard key={reply.id.toString()} post={reply} />
      ))}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Delete dialog */}
      <DeletePostDialog
        open={actions.showDeleteDialog}
        onOpenChange={actions.setShowDeleteDialog}
        onConfirm={actions.handleDelete}
        isPending={actions.isDeleting}
      />
    </div>
  );
}
