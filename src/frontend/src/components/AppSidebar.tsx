import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Home, LogOut, Moon, Search, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useProfile, useUnreadNotificationCount } from "../hooks/useQueries";
import { getInitials } from "../utils/formatting";

const NAV_ITEMS = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Search", icon: Search, to: "/search" },
  { label: "Notifications", icon: Bell, to: "/notifications" },
] as const;

function isNavActive(itemTo: string, currentPath: string): boolean {
  if (itemTo === "/") return currentPath === "/";
  if (itemTo === "/search")
    return (
      currentPath.startsWith("/search") || currentPath.startsWith("/hashtag/")
    );
  return currentPath.startsWith(itemTo);
}

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const queryClient = useQueryClient();
  const { clear } = useInternetIdentity();

  const handleLogout = () => {
    queryClient.clear();
    clear();
  };
  const { data: profile, isError: isProfileError } = useProfile();
  const { data: unreadCount } = useUnreadNotificationCount();
  const { theme, setTheme } = useTheme();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const initials = profile?.displayName
    ? getInitials(profile.displayName)
    : "?";
  const profilePictureUrl = profile?.profilePictureHash
    ? profile.profilePictureHash.getDirectURL()
    : null;

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pt-5 pb-6">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-1 transition-opacity hover:opacity-80"
          onClick={onNavigate}
        >
          <span className="text-xl font-bold tracking-tight">MicroBlog</span>
        </Link>
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item.to, currentPath);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-full px-4 py-3 text-[15px] transition-colors",
                    active
                      ? "font-bold text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                  onClick={onNavigate}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      active && "stroke-[2.5px]",
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.to === "/notifications" &&
                    !!unreadCount &&
                    unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-2 px-3 py-3">
        {isProfileError ? (
          <div className="px-3 py-2 text-sm text-destructive">
            Failed to load profile
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-full px-3 py-2 text-left transition-colors hover:bg-accent"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  {profilePictureUrl && (
                    <AvatarImage
                      src={profilePictureUrl}
                      alt={profile?.displayName ?? ""}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-sm font-medium">
                    {profile?.displayName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    @{profile?.username}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="w-(--radix-dropdown-menu-trigger-width) min-w-[180px]"
            >
              <DropdownMenuItem asChild>
                <Link
                  to="/$username"
                  params={{ username: profile?.username ?? "" }}
                  onClick={onNavigate}
                >
                  <User />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="dark:hidden" />
                <Moon className="hidden dark:block" />
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
