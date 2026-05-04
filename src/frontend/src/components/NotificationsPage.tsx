import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
  AtSign,
  CheckCheck,
  Heart,
  Loader2,
  MessageCircle,
  Quote,
  Repeat2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "../hooks/useQueries";
import { fromNanoseconds, getInitials } from "../utils/formatting";
import { BackButton } from "./BackButton";

function getNotificationInfo(notificationType: Record<string, unknown>) {
  if ("like" in notificationType) {
    return {
      icon: Heart,
      iconClassName: "text-red-500",
      text: "liked your post",
      postId: notificationType.like as bigint,
    };
  }
  if ("reply" in notificationType) {
    return {
      icon: MessageCircle,
      iconClassName: "text-blue-500",
      text: "replied to your post",
      postId: notificationType.reply as bigint,
    };
  }
  if ("mention" in notificationType) {
    return {
      icon: AtSign,
      iconClassName: "text-purple-500",
      text: "mentioned you",
      postId: notificationType.mention as bigint,
    };
  }
  if ("follow" in notificationType) {
    return {
      icon: UserPlus,
      iconClassName: "text-green-500",
      text: "followed you",
      postId: null,
    };
  }
  if ("repost" in notificationType) {
    return {
      icon: Repeat2,
      iconClassName: "text-emerald-500",
      text: "reposted your post",
      postId: notificationType.repost as bigint,
    };
  }
  if ("quote" in notificationType) {
    return {
      icon: Quote,
      iconClassName: "text-orange-500",
      text: "quoted your post",
      postId: notificationType.quote as bigint,
    };
  }
  return {
    icon: Heart,
    iconClassName: "text-muted-foreground",
    text: "interacted with you",
    postId: null,
  };
}

export function NotificationsPage() {
  const {
    data: notifData,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useNotifications();

  const { data: unreadCount } = useUnreadNotificationCount();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAllRead } =
    useMarkAllNotificationsRead();

  const notifications =
    notifData?.pages.flatMap((page) => page.notifications) ?? [];

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const handleMarkRead = (notif: (typeof notifications)[0]) => {
    if (!notif.isRead) {
      markRead(notif.id, {
        onError: () => {
          toast.error("Failed to mark notification as read");
        },
      });
    }
  };

  return (
    <div>
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-3">
          <BackButton className="shrink-0" />
          <h1 className="flex-1 text-lg font-semibold">Notifications</h1>
          {unreadCount !== undefined && unreadCount > 0n && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              disabled={isMarkingAllRead}
              onClick={() =>
                markAllRead(undefined, {
                  onError: () => {
                    toast.error("Failed to mark all as read");
                  },
                })
              }
            >
              {isMarkingAllRead ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              )}
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: stable list
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <Skeleton className="h-4 w-4 shrink-0" />
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="p-4 text-center text-destructive">
          Failed to load notifications.
        </p>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center px-8 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-semibold">No notifications yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            When someone interacts with your posts, you'll see it here.
          </p>
        </div>
      ) : (
        <>
          {notifications.map((notif) => {
            const info = getNotificationInfo(
              notif.notificationType as Record<string, unknown>,
            );
            const Icon = info.icon;
            const timeAgo = formatDistanceToNow(
              fromNanoseconds(notif.createdAt),
              { addSuffix: true },
            );

            const linkClassName = cn(
              "flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50",
              !notif.isRead && "bg-primary/5",
            );

            const content = (
              <>
                <Icon
                  className={cn("mt-1 h-4 w-4 shrink-0", info.iconClassName)}
                />
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-xs">
                    {getInitials(notif.actorUsername)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">
                      @{notif.actorUsername}
                    </span>{" "}
                    {info.text}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {timeAgo}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </>
            );

            return info.postId !== null ? (
              <Link
                key={notif.id.toString()}
                to="/post/$id"
                params={{ id: info.postId.toString() }}
                className={linkClassName}
                onClick={() => handleMarkRead(notif)}
              >
                {content}
              </Link>
            ) : (
              <Link
                key={notif.id.toString()}
                to="/$username"
                params={{ username: notif.actorUsername }}
                className={linkClassName}
                onClick={() => handleMarkRead(notif)}
              >
                {content}
              </Link>
            );
          })}
          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
