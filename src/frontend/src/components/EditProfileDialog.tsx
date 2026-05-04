import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Loader2, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMediaUpload } from "../hooks/useMediaUpload";
import {
  useSetProfile,
  useUpdateHeaderImage,
  useUpdateProfilePicture,
} from "../hooks/useQueries";
import { getInitials } from "../utils/formatting";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: {
    username: string;
    displayName: string;
    bio: string;
    profilePictureHash?: { getDirectURL(): string } | null;
    headerImageHash?: { getDirectURL(): string } | null;
  };
}

export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
}: EditProfileDialogProps) {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { mutateAsync: setProfile } = useSetProfile();
  const { mutateAsync: updateProfilePicture } = useUpdateProfilePicture();
  const { mutateAsync: updateHeaderImage } = useUpdateHeaderImage();

  const {
    file: avatarFile,
    previewUrl: avatarPreviewUrl,
    selectMedia: selectAvatarImage,
    removeMedia: removeAvatarImage,
    createBlob: createAvatarBlob,
    MediaInput: AvatarImageInput,
  } = useMediaUpload("image");

  const {
    file: headerFile,
    previewUrl: headerPreviewUrl,
    selectMedia: selectHeaderImage,
    removeMedia: removeHeaderImage,
    createBlob: createHeaderBlob,
    MediaInput: HeaderImageInput,
  } = useMediaUpload("image");

  // Reset form state when dialog opens
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (open) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      setError("");
      removeAvatarImage();
      removeHeaderImage();
    }
  }, [open]);

  const currentAvatarUrl = profile.profilePictureHash?.getDirectURL() ?? null;
  const currentHeaderUrl = profile.headerImageHash?.getDirectURL() ?? null;
  const previewAvatarUrl = avatarPreviewUrl ?? currentAvatarUrl;
  const previewHeaderUrl = headerPreviewUrl ?? currentHeaderUrl;
  const initials = getInitials(displayName || profile.displayName);

  const canSubmit =
    displayName.trim().length > 0 &&
    displayName.length <= 50 &&
    bio.length <= 160 &&
    !isSaving;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setIsSaving(true);

    try {
      if (avatarFile) {
        const blob = await createAvatarBlob();
        if (blob) {
          await updateProfilePicture(blob);
        }
      }

      if (headerFile) {
        const blob = await createHeaderBlob();
        if (blob) {
          await updateHeaderImage(blob);
        }
      }

      const trimmedDisplayName = displayName.trim();
      const trimmedBio = bio.trim();
      if (
        trimmedDisplayName !== profile.displayName ||
        trimmedBio !== profile.bio
      ) {
        await setProfile({
          username: profile.username,
          displayName: trimmedDisplayName,
          bio: trimmedBio,
        });
      }

      toast.success("Profile updated");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (isSaving) return;
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your display name, bio, and images.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header image */}
          <div>
            <Label>Header image</Label>
            <div className="relative mt-1 overflow-hidden rounded-lg">
              <AspectRatio ratio={3 / 1}>
                {previewHeaderUrl ? (
                  <img
                    src={previewHeaderUrl}
                    alt="Header preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-muted" />
                )}
              </AspectRatio>
              <button
                type="button"
                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100"
                onClick={selectHeaderImage}
                disabled={isSaving}
              >
                <Camera className="h-5 w-5 text-white" />
              </button>
              <HeaderImageInput />
            </div>
            {headerPreviewUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1"
                onClick={removeHeaderImage}
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
                Remove new image
              </Button>
            )}
          </div>

          {/* Profile picture */}
          <div>
            <Label>Profile picture</Label>
            <div className="mt-1 flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  {previewAvatarUrl && (
                    <AvatarImage
                      src={previewAvatarUrl}
                      alt="Profile preview"
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity hover:opacity-100"
                  onClick={selectAvatarImage}
                  disabled={isSaving}
                >
                  <Camera className="h-4 w-4 text-white" />
                </button>
                <AvatarImageInput />
              </div>
              {avatarPreviewUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeAvatarImage}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4" />
                  Remove new
                </Button>
              )}
            </div>
          </div>

          {/* Display name */}
          <div className="space-y-2">
            <Label htmlFor="editDisplayName">Display name</Label>
            <Input
              id="editDisplayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              disabled={isSaving}
            />
            <p className="text-right text-xs text-muted-foreground">
              {displayName.length}/50
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="editBio">Bio</Label>
            <Textarea
              id="editBio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself"
              maxLength={160}
              rows={3}
              disabled={isSaving}
            />
            <p className="text-right text-xs text-muted-foreground">
              {bio.length}/160
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={!canSubmit}>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
