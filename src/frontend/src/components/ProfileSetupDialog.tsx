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
import { Check, Loader2, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "../hooks/useDebounce";
import { useCheckUsername, useSetProfile } from "../hooks/useQueries";

const USERNAME_REGEX = /^[a-zA-Z0-9_]*$/;

export function ProfileSetupDialog() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const debouncedUsername = useDebounce(username, 400);
  const {
    data: isAvailable,
    isLoading: isCheckingUsername,
    isError: isCheckError,
  } = useCheckUsername(debouncedUsername);
  const { mutate: setProfile, isPending } = useSetProfile();

  useEffect(() => {
    if (username.length === 0) {
      setUsernameError("");
      return;
    }
    if (!USERNAME_REGEX.test(username)) {
      setUsernameError("Only letters, numbers, and underscores");
      return;
    }
    if (username.length < 3) {
      setUsernameError("Must be at least 3 characters");
      return;
    }
    if (username.length > 20) {
      setUsernameError("Must be 20 characters or fewer");
      return;
    }
    setUsernameError("");
  }, [username]);

  const isUsernameValid =
    username.length >= 3 &&
    username.length <= 20 &&
    USERNAME_REGEX.test(username) &&
    !usernameError;

  const showAvailability =
    isUsernameValid && debouncedUsername === username && !isCheckingUsername;

  const canSubmit =
    isUsernameValid &&
    displayName.trim().length > 0 &&
    displayName.length <= 50 &&
    bio.length <= 160 &&
    isAvailable === true &&
    !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setProfile(
      { username, displayName: displayName.trim(), bio: bio.trim() },
      {
        onSuccess: () => {
          toast.success("Profile created!");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create profile");
        },
      },
    );
  };

  return (
    <Dialog open>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Set up your profile</DialogTitle>
          <DialogDescription>
            Choose a username and tell people about yourself.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                @
              </span>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="pl-7"
                maxLength={20}
                disabled={isPending}
              />
              {isUsernameValid && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isCheckingUsername || debouncedUsername !== username ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : isCheckError ? (
                    <X className="h-4 w-4 text-destructive" />
                  ) : showAvailability && isAvailable ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : showAvailability && !isAvailable ? (
                    <X className="h-4 w-4 text-destructive" />
                  ) : null}
                </span>
              )}
            </div>
            {usernameError && (
              <p className="text-sm text-destructive">{usernameError}</p>
            )}
            {showAvailability && !isAvailable && !usernameError && (
              <p className="text-sm text-destructive">Username is taken</p>
            )}
            {showAvailability && isAvailable && !usernameError && (
              <p className="text-sm text-green-500">Username is available</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground text-right">
              {displayName.length}/50
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people about yourself (optional)"
              maxLength={160}
              rows={3}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/160
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={!canSubmit}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Creating profile..." : "Create profile"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
