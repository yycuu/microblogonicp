import { cn } from "@/lib/utils";
import { Heart, Loader2, MessageCircle, Repeat2 } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { ThemeToggle } from "./ThemeToggle";

interface MockPostData {
  initials: string;
  name: string;
  handle: string;
  time: string;
  text: string;
  likes: number;
  replies: number;
  reposts: number;
  color: string;
}

const FEED_POSTS: MockPostData[] = [
  {
    initials: "AK",
    name: "Anna K",
    handle: "dev_anna",
    time: "2h",
    text: "Just deployed my first canister on ICP! The future is decentralized",
    likes: 12,
    replies: 3,
    reposts: 1,
    color: "bg-sky-600",
  },
  {
    initials: "MR",
    name: "Maya R",
    handle: "maya",
    time: "1h",
    text: "Your data should belong to you, not a corporation",
    likes: 45,
    replies: 8,
    reposts: 12,
    color: "bg-rose-600",
  },
  {
    initials: "SD",
    name: "Sam Davis",
    handle: "indie_dev",
    time: "30m",
    text: "Building in public, day 47. Almost ready to launch",
    likes: 7,
    replies: 2,
    reposts: 0,
    color: "bg-emerald-600",
  },
  {
    initials: "CP",
    name: "Chris P",
    handle: "chrisfoto",
    time: "3h",
    text: "Beautiful sunset from my balcony today #photography",
    likes: 19,
    replies: 0,
    reposts: 2,
    color: "bg-violet-600",
  },
];

function MockFeedPost({
  post,
  isLast,
}: {
  post: MockPostData;
  isLast?: boolean;
}) {
  return (
    <div
      className={cn("flex items-start gap-3 px-4 py-3", !isLast && "border-b")}
    >
      <div
        className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0 ${post.color}`}
      >
        {post.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-sm">
          <span className="font-semibold text-card-foreground truncate">
            {post.name}
          </span>
          <span className="text-muted-foreground truncate">@{post.handle}</span>
          <span className="text-muted-foreground shrink-0">· {post.time}</span>
        </div>
        <p className="mt-0.5 text-sm text-card-foreground leading-snug">
          {post.text}
        </p>
        <div className="mt-2 flex items-center gap-6 text-muted-foreground">
          <span className="flex items-center gap-1 text-xs">
            <MessageCircle className="h-4 w-4" />
            {post.replies > 0 && post.replies}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Repeat2 className="h-4 w-4" />
            {post.reposts > 0 && post.reposts}
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Heart className="h-4 w-4" />
            {post.likes > 0 && post.likes}
          </span>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="h-dvh overflow-hidden bg-landing relative flex flex-col">
      {/* Top bar */}
      <header className="shrink-0 px-6 sm:px-10 lg:px-16 py-5 flex items-center justify-between max-w-7xl mx-auto w-full animate-fade-up">
        <span className="text-xl font-bold text-foreground tracking-tight">
          MicroBlog
        </span>
        <ThemeToggle />
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 min-h-0">
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.05] tracking-[-0.03em] animate-fade-up-delay-1">
          Share what matters.
        </h1>

        <p className="mt-4 sm:mt-6 text-muted-foreground text-sm sm:text-base md:text-lg max-w-sm mx-auto leading-relaxed animate-fade-up-delay-2">
          Share thoughts, spark conversations, and own your content on the
          decentralized web.
        </p>

        <div className="mt-5 sm:mt-8 flex flex-col items-center gap-3 animate-fade-up-delay-3">
          <button
            type="button"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="rounded-full bg-foreground text-landing px-7 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign in with Internet Identity"
            )}
          </button>

          <span className="text-muted-foreground text-xs">
            &copy; 2026. Built with ❤️ using{" "}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </main>

      {/* Feed preview */}
      <div className="shrink-0 px-4 sm:px-10 lg:px-16 max-w-3xl mx-auto w-full animate-fade-up-delay-3">
        <div className="rounded-t-2xl border border-b-0 bg-card shadow-2xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b">
            <div className="flex-1 py-3 text-sm font-semibold text-center text-foreground border-b-2 border-primary">
              For You
            </div>
            <div className="flex-1 py-3 text-sm font-medium text-center text-muted-foreground">
              Following
            </div>
          </div>
          {/* Mock posts - show 2 on mobile, all on sm+ */}
          {FEED_POSTS.map((post, i) => (
            <div key={post.handle} className={cn(i >= 2 && "hidden sm:block")}>
              <MockFeedPost post={post} isLast={i === FEED_POSTS.length - 1} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
