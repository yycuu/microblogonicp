import { useState } from "react";
import { toast } from "sonner";
import { useAppStore } from "../stores/useAppStore";
import { MAX_POST_LENGTH } from "../utils/constants";
import {
  useDeletePost,
  useEditPost,
  useLikePost,
  useRepostPost,
  useUndoRepost,
  useUnlikePost,
} from "./useQueries";

interface UsePostActionsOptions {
  postId: bigint;
  actionPostId: bigint;
  postText: string;
  isLikedByCurrentUser: boolean;
  isRepostedByCurrentUser: boolean;
  onDeleteSuccess?: () => void;
}

export function usePostActions({
  postId,
  actionPostId,
  postText,
  isLikedByCurrentUser,
  isRepostedByCurrentUser,
  onDeleteSuccess,
}: UsePostActionsOptions) {
  const { mutate: editPost, isPending: isEditing } = useEditPost();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
  const { mutate: likePost, isPending: isLiking } = useLikePost();
  const { mutate: unlikePost, isPending: isUnliking } = useUnlikePost();
  const { mutate: repostPost, isPending: isReposting } = useRepostPost();
  const { mutate: undoRepost, isPending: isUndoingRepost } = useUndoRepost();
  const startQuote = useAppStore((s) => s.startQuote);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editText, setEditText] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const handleStartEdit = () => {
    setEditText(postText);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditText("");
  };

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed.length > MAX_POST_LENGTH) return;
    editPost(
      { postId, text: trimmed },
      {
        onSuccess: () => {
          toast.success("Post updated");
          setIsEditMode(false);
          setEditText("");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to edit post");
        },
      },
    );
  };

  const handleDelete = () => {
    deletePost(postId, {
      onSuccess: () => {
        toast.success("Post deleted");
        setShowDeleteDialog(false);
        onDeleteSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete post");
      },
    });
  };

  const handleLikeToggle = () => {
    if (isLikedByCurrentUser) {
      unlikePost(actionPostId, {
        onError: () => toast.error("Failed to unlike post"),
      });
    } else {
      setLikeAnimating(true);
      likePost(actionPostId, {
        onError: () => toast.error("Failed to like post"),
      });
    }
  };

  const handleRepost = () => {
    if (isRepostedByCurrentUser) {
      undoRepost(actionPostId, {
        onError: () => toast.error("Failed to undo repost"),
      });
    } else {
      repostPost(actionPostId, {
        onError: (error) => toast.error(error.message || "Failed to repost"),
      });
    }
  };

  const handleQuote = () => {
    startQuote(actionPostId);
  };

  const isLikePending = isLiking || isUnliking;
  const isRepostPending = isReposting || isUndoingRepost;

  return {
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
  };
}
