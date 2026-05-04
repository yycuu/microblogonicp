import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Quote,
  Repeat2,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { usePostActions } from "../hooks/usePostActions";
import { usePost } from "../hooks/useQueries";
import { EDIT_DELETE_WINDOW_MS } from "../utils/constants";
import { fromNanoseconds, getInitials } from "../utils/formatting";
import type { Post, PostType } from "../utils/types";
import { DeletePostDialog } from "./DeletePostDialog";
import { EditPostForm } from "./EditPostForm";
import { PostText } from "./PostText";

interface PostCardProps {
  post: Post;
}

function getReferencedPostId(postType: PostType): bigint | null {
  if ("repost" in postType) return postType.repost;
  if ("quote" in postType) return postType.quote;
  return null;
}

export function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  const isRepost = "repost" in post.postType;
  const isQuote = "quote" in post.postType;
  const referencedPostId = getReferencedPostId(post.postType);
  const { data: referencedPostData, isLoading: isLoadingReferenced } =
    usePost(referencedPostId);
  const refPost = referencedPostData as Post | null | undefined;

  // For reposts, display and interact with the original post
  const contentPost = isRepost && refPost ? refPost : post;
  const actionPost = isRepost && refPost ? refPost : post;

  const {
    isEditMode,
    editText,
    setEditText,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    isEditing,
    showDeleteDialog,
    setShowDeleteDialog,
    handleDelete,
    isDeleting,
    handleLikeToggle,
    isLikePending,
    likeAnimating,
    setLikeAnimating,
    handleRepost,
    isRepostPending,
    handleQuote,
  } = usePostActions({
    postId: post.id,
    actionPostId: actionPost.id,
    postText: post.text,
    isLikedByCurrentUser: actionPost.isLikedByCurrentUser,
    isRepostedByCurrentUser: actionPost.isRepostedByCurrentUser,
  });

  const [showLightbox, setShowLightbox] = useState(false);
  const suppressNavRef = useRef(false);

  const handleDropdownOpenChange = () => {
    suppressNavRef.current = true;
    requestAnimationFrame(() => {
      suppressNavRef.current = false;
    });
  };

  const contentMediaUrl = contentPost.mediaHash
    ? contentPost.mediaHash.getDirectURL()
    : null;
  const contentMediaType = contentPost.mediaType;

  const currentPrincipal = identity?.getPrincipal().toText();
  const isOwnPost = !isRepost && currentPrincipal === post.author.toText();
  const createdDate = fromNanoseconds(contentPost.createdAt);
  const isWithinWindow =
    Date.now() - createdDate.getTime() < EDIT_DELETE_WINDOW_MS;
  const canModify = isOwnPost && isWithinWindow;

  const contentInitials = getInitials(contentPost.authorDisplayName);
  const contentAvatarUrl = contentPost.authorProfilePictureHash
    ? contentPost.authorProfilePictureHash.getDirectURL()
    : null;

  // For reposts, wait for the original post to load
  if (isRepost && !refPost) {
    if (isLoadingReferenced) {
      return (
        <div className="border-b">
          <div className="flex items-center gap-3 px-4 pt-2 text-sm text-muted-foreground">
            <div className="flex w-10 shrink-0 justify-end">
              <Repeat2 className="h-4 w-4" />
            </div>
            <span className="font-medium">
              {post.authorDisplayName} reposted
            </span>
          </div>
          <div className="flex gap-3 px-4 pb-3 pt-1">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className="cursor-pointer border-b"
      onClick={() => {
        if (suppressNavRef.current || showDeleteDialog || isEditMode) return;
        navigate({ to: "/post/$id", params: { id: actionPost.id.toString() } });
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (suppressNavRef.current || showDeleteDialog || isEditMode) return;
          navigate({
            to: "/post/$id",
            params: { id: actionPost.id.toString() },
          });
        }
      }}
    >
      {isRepost && (
        <div className="flex items-center gap-3 px-4 pt-2 text-sm text-muted-foreground">
          <div className="flex w-10 shrink-0 justify-end">
            <Repeat2 className="h-4 w-4" />
          </div>
          <Link
            to="/$username"
            params={{ username: post.authorUsername }}
            className="font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {post.authorDisplayName} reposted
          </Link>
        </div>
      )}

      <div
        className={cn(
          "flex items-start gap-3 px-4",
          isRepost ? "pb-3 pt-1" : "py-3",
        )}
      >
        <Link
          to="/$username"
          params={{ username: contentPost.authorUsername }}
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar className="h-10 w-10">
            {contentAvatarUrl && (
              <AvatarImage
                src={contentAvatarUrl}
                alt={contentPost.authorDisplayName}
                className="object-cover"
              />
            )}
            <AvatarFallback className="text-xs">
              {contentInitials}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 truncate text-sm">
              <Link
                to="/$username"
                params={{ username: contentPost.authorUsername }}
                className="truncate font-semibold hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {contentPost.authorDisplayName}
              </Link>
              <Link
                to="/$username"
                params={{ username: contentPost.authorUsername }}
                className="truncate text-muted-foreground hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                @{contentPost.authorUsername}
              </Link>
              <span className="shrink-0 text-muted-foreground">·</span>
              <span className="shrink-0 text-muted-foreground">
                {formatDistanceToNow(createdDate, { addSuffix: true })}
              </span>
              {contentPost.editedAt != null && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  (edited)
                </span>
              )}
            </div>

            {canModify && !isEditMode && (
              <div
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                <DropdownMenu onOpenChange={handleDropdownOpenChange}>
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
                  <DropdownMenuContent
                    align="end"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <DropdownMenuItem onClick={handleStartEdit}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {isEditMode ? (
            <div
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              <EditPostForm
                editText={editText}
                onEditTextChange={setEditText}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                isEditing={isEditing}
                textareaClassName="min-h-[60px] text-sm"
                className="mt-2"
              />
            </div>
          ) : (
            <>
              {contentPost.text && (
                <PostText
                  text={contentPost.text}
                  className="mt-1 whitespace-pre-wrap break-words text-sm"
                />
              )}
              {contentMediaUrl &&
                (contentMediaType === "video" ? (
                  <div
                    className="mt-2 w-full overflow-hidden rounded-xl border"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  >
                    {/* biome-ignore lint/a11y/useMediaCaption: media element */}
                    <video
                      src={contentMediaUrl}
                      controls
                      preload="metadata"
                      className="max-h-80 w-full object-cover"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    className="mt-2 block w-full cursor-pointer overflow-hidden rounded-xl border"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLightbox(true);
                    }}
                    aria-label="View image"
                  >
                    <img
                      src={contentMediaUrl}
                      alt="Post attachment"
                      loading="lazy"
                      className="max-h-80 w-full object-cover"
                    />
                  </button>
                ))}

              {isQuote && refPost && (
                <Link
                  to="/post/$id"
                  params={{ id: refPost.id.toString() }}
                  className="mt-2 block w-full rounded-xl border p-3 text-left transition-colors hover:bg-muted/50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1 text-sm">
                    <Avatar className="h-5 w-5">
                      {refPost.authorProfilePictureHash && (
                        <AvatarImage
                          src={refPost.authorProfilePictureHash.getDirectURL()}
                          alt={refPost.authorDisplayName}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="text-[10px]">
                        {getInitials(refPost.authorDisplayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate font-semibold">
                      {refPost.authorDisplayName}
                    </span>
                    <span className="truncate text-muted-foreground">
                      @{refPost.authorUsername}
                    </span>
                    <span className="shrink-0 text-muted-foreground">·</span>
                    <span className="shrink-0 text-muted-foreground">
                      {formatDistanceToNow(fromNanoseconds(refPost.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  {refPost.text && (
                    <PostText
                      text={refPost.text}
                      className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-sm"
                    />
                  )}
                  {refPost.mediaHash &&
                    (refPost.mediaType === "video" ? (
                      // biome-ignore lint/a11y/useMediaCaption: media element
                      // biome-ignore lint/a11y/useKeyWithClickEvents: non-interactive
                      <video
                        src={refPost.mediaHash.getDirectURL()}
                        controls
                        preload="metadata"
                        className="mt-2 max-h-40 w-full rounded-lg object-cover"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <img
                        src={refPost.mediaHash.getDirectURL()}
                        alt="Quoted post attachment"
                        loading="lazy"
                        className="mt-2 max-h-40 w-full rounded-lg object-cover"
                      />
                    ))}
                </Link>
              )}
              {isQuote && !refPost && isLoadingReferenced && (
                <div className="mt-2 rounded-xl border p-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="mt-2 h-4 w-3/4" />
                </div>
              )}
              {isQuote && !refPost && !isLoadingReferenced && (
                <div className="mt-2 rounded-xl border p-3 text-sm text-muted-foreground">
                  This post is unavailable
                </div>
              )}

              <div
                className="mt-2 flex items-center gap-6"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                <Link
                  to="/post/$id"
                  params={{ id: actionPost.id.toString() }}
                  className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                  aria-label="Reply"
                >
                  <MessageCircle className="h-4 w-4" />
                  {actionPost.replyCount > 0n && (
                    <span>{actionPost.replyCount.toString()}</span>
                  )}
                </Link>
                <DropdownMenu onOpenChange={handleDropdownOpenChange}>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex items-center gap-1 text-sm transition-colors",
                        actionPost.isRepostedByCurrentUser
                          ? "text-green-500"
                          : "text-muted-foreground hover:text-green-500",
                      )}
                      disabled={isRepostPending}
                      aria-label="Repost options"
                    >
                      <Repeat2 className="h-4 w-4" />
                      {actionPost.repostCount > 0n && (
                        <span>{actionPost.repostCount.toString()}</span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <DropdownMenuItem onClick={handleRepost}>
                      <Repeat2 className="h-4 w-4" />
                      {actionPost.isRepostedByCurrentUser
                        ? "Undo repost"
                        : "Repost"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleQuote}>
                      <Quote className="h-4 w-4" />
                      Quote
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-1 text-sm transition-colors",
                    actionPost.isLikedByCurrentUser
                      ? "text-red-500"
                      : "text-muted-foreground hover:text-red-500",
                  )}
                  onClick={handleLikeToggle}
                  disabled={isLikePending}
                  aria-label={
                    actionPost.isLikedByCurrentUser ? "Unlike" : "Like"
                  }
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      actionPost.isLikedByCurrentUser && "fill-current",
                      likeAnimating && "animate-like-pop",
                    )}
                    onAnimationEnd={() => setLikeAnimating(false)}
                  />
                  {actionPost.likeCount > 0n && (
                    <span>{actionPost.likeCount.toString()}</span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {contentMediaUrl && contentMediaType !== "video" && (
        <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
          <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
            <DialogTitle className="sr-only">Image preview</DialogTitle>
            <img
              src={contentMediaUrl}
              alt="Post attachment"
              className="max-h-[85vh] w-full rounded-lg object-contain"
            />
          </DialogContent>
        </Dialog>
      )}

      <DeletePostDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isPending={isDeleting}
      />
    </div>
  );
}
