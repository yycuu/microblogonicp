import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { MAX_POST_LENGTH } from "../utils/constants";

interface EditPostFormProps {
  editText: string;
  onEditTextChange: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
  textareaClassName?: string;
  className?: string;
}

export function EditPostForm({
  editText,
  onEditTextChange,
  onSave,
  onCancel,
  isEditing,
  textareaClassName,
  className,
}: EditPostFormProps) {
  return (
    <div className={className}>
      <Textarea
        value={editText}
        onChange={(e) => onEditTextChange(e.target.value)}
        disabled={isEditing}
        className={cn("resize-none", textareaClassName)}
      />
      <div className="mt-2 flex items-center justify-between">
        <span
          className={cn(
            "text-xs",
            editText.length > MAX_POST_LENGTH
              ? "text-destructive"
              : "text-muted-foreground",
          )}
        >
          {editText.length}/{MAX_POST_LENGTH}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isEditing}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={
              isEditing ||
              editText.trim().length === 0 ||
              editText.length > MAX_POST_LENGTH
            }
          >
            {isEditing && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditing ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
