import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Paperclip, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import type { ExternalBlob } from "../backend";
import { useMediaUpload } from "../hooks/useMediaUpload";
import {
  useCreatePost,
  useCreateReply,
  usePost,
  useQuotePost,
} from "../hooks/useQueries";
import { useAppStore } from "../stores/useAppStore";
import { MAX_POST_LENGTH } from "../utils/constants";
import { fromNanoseconds, getInitials } from "../utils/formatting";
import { PostText } from "./PostText";

interface ComposePostProps {
  replyToId?: bigint | null;
  quotedPostId?: bigint | null;
}

export function ComposePost({ replyToId, quotedPostId }: ComposePostProps) {
  const isReplyMode = replyToId != null;
  const isQuoteMode = quotedPostId != null;
  const clearCompose = useAppStore((s) => s.clearCompose);
  const [text, setText] = useState("");
  const { mutate: createPost, isPending: isPostPending } = useCreatePost();
  const { mutate: createReply, isPending: isReplyPending } = useCreateReply();
  const { mutate: quotePost, isPending: isQuotePending } = useQuotePost();
  const { data: quotedPost } = usePost(quotedPostId ?? null);

  const isPending = isReplyMode
    ? isReplyPending
    : isQuoteMode
      ? isQuotePending
      : isPostPending;
  const {
    file,
    previewUrl,
    error: mediaError,
    mediaType,
    selectMedia,
    removeMedia,
    createBlob,
    MediaInput,
  } = useMediaUpload();
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const charCount = text.length;
  const isOverLimit = charCount > MAX_POST_LENGTH;
  const isEmpty = text.trim().length === 0 && !file;
  const isTextEmpty = text.trim().length === 0;

  const handleSubmit = async () => {
    if (isTextEmpty && !file) return;
    if (isOverLimit) return;

    let mediaHash: ExternalBlob | null = null;
    if (file) {
      try {
        setUploadProgress(0);
        mediaHash = await createBlob((pct) => setUploadProgress(pct));
      } catch {
        toast.error("Failed to upload media");
        setUploadProgress(null);
        return;
      }
    }

    const onSuccess = () => {
      setText("");
      removeMedia();
      setUploadProgress(null);
      if (isQuoteMode) {
        clearCompose();
        toast.success("Quote posted");
      } else if (isReplyMode) {
        toast.success("Reply posted");
      } else {
        toast.success("Post published");
      }
    };

    const onError = (error: Error) => {
      setUploadProgress(null);
      toast.error(error.message || "Failed to create post");
    };

    if (isQuoteMode) {
      quotePost(
        { postId: quotedPostId, text: text.trim(), mediaHash, mediaType },
        { onSuccess, onError },
      );
    } else if (isReplyMode) {
      createReply(
        { parentPostId: replyToId, text: text.trim(), mediaHash, mediaType },
        { onSuccess, onError },
      );
    } else {
      createPost(
        { text: text.trim(), mediaHash, mediaType },
        { onSuccess, onError },
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDismissQuote = () => {
    clearCompose();
  };

  const isSubmitting = isPending || uploadProgress !== null;

  const placeholder = isQuoteMode
    ? "Add a comment..."
    : isReplyMode
      ? "Post your reply"
      : "What's happening?";

  const buttonLabel = isSubmitting
    ? isQuoteMode
      ? "Quoting..."
      : isReplyMode
        ? "Replying..."
        : "Posting..."
    : isQuoteMode
      ? "Quote"
      : isReplyMode
        ? "Reply"
        : "Post";

  return (
    <div className="border-b px-4 py-3">
      <Textarea
        id={isReplyMode ? "reply-textarea" : undefined}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSubmitting}
        className={cn(
          "resize-none rounded-none border-0 p-0 shadow-none focus-visible:ring-0",
          isReplyMode ? "min-h-[60px] text-sm" : "min-h-[80px] text-base",
        )}
      />
      {isQuoteMode && quotedPost && (
        <div className="relative mt-2 rounded-lg border p-3">
          <button
            type="button"
            className="absolute right-2 top-2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={handleDismissQuote}
            aria-label="Dismiss quote"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              {quotedPost.authorProfilePictureHash && (
                <AvatarImage
                  src={quotedPost.authorProfilePictureHash.getDirectURL()}
                  alt={quotedPost.authorDisplayName}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="text-[10px]">
                {getInitials(quotedPost.authorDisplayName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold">
              {quotedPost.authorDisplayName}
            </span>
            <span className="text-sm text-muted-foreground">
              @{quotedPost.authorUsername}
            </span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(fromNanoseconds(quotedPost.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <PostText
            text={quotedPost.text}
            className="mt-1 line-clamp-3 text-sm text-muted-foreground"
          />
        </div>
      )}
      {previewUrl && (
        <div className="relative mt-2 max-w-xs">
          <AspectRatio ratio={16 / 9}>
            {mediaType === "video" ? (
              // biome-ignore lint/a11y/useMediaCaption: media element
              <video
                src={previewUrl}
                controls
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Attachment preview"
                className="h-full w-full rounded-md object-cover"
              />
            )}
          </AspectRatio>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-1 top-1 h-6 w-6 rounded-full"
            onClick={removeMedia}
            disabled={isSubmitting}
            aria-label="Remove media"
          >
            <X className="h-3 w-3" />
          </Button>
          {uploadProgress !== null && (
            <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50">
              <span className="text-sm font-medium text-white">
                {Math.round(uploadProgress)}%
              </span>
            </div>
          )}
        </div>
      )}
      {mediaError && (
        <p className="mt-1 text-sm text-destructive">{mediaError}</p>
      )}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={selectMedia}
            disabled={isSubmitting || !!file}
            aria-label="Add media"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <span
            className={cn(
              "text-sm",
              isOverLimit ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {charCount}/{MAX_POST_LENGTH}
          </span>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isEmpty || isOverLimit || isSubmitting}
          size="sm"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {buttonLabel}
        </Button>
      </div>
      <MediaInput />
    </div>
  );
}
