import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useRouter } from "@tanstack/react-router";
import { Search } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useTrendingHashtags } from "../hooks/useQueries";

export function TrendingPanel() {
  const { data: trending, isLoading, isError } = useTrendingHashtags();
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (!trimmed) return;
    router.navigate({ to: "/search", search: { q: trimmed } });
    setSearchValue("");
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 overflow-y-auto lg:block">
      <div className="p-4">
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search"
              className="rounded-full bg-muted pl-9"
            />
          </div>
        </form>

        <div className="overflow-hidden rounded-xl border bg-card">
          <h2 className="px-4 pt-3 pb-2 text-xl font-bold">
            What&apos;s happening
          </h2>
          {isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: stable list
                <div key={i} className="px-4 py-3">
                  <Skeleton className="mb-1 h-3 w-16" />
                  <Skeleton className="mb-1 h-4 w-24" />
                  <Skeleton className="h-3 w-14" />
                </div>
              ))}
            </div>
          ) : isError || !trending || trending.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No trending topics yet
            </p>
          ) : (
            <div className="divide-y">
              {trending.map((item) => (
                <Link
                  key={item.tag}
                  to="/hashtag/$tag"
                  params={{ tag: item.tag }}
                  className="block px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <span className="text-xs text-muted-foreground">
                    Trending
                  </span>
                  <p className="font-bold">#{item.tag}</p>
                  <span className="text-xs text-muted-foreground">
                    {item.count.toString()} posts
                  </span>
                </Link>
              ))}
            </div>
          )}
          <Link
            to="/search"
            search={{ q: "" }}
            className="block px-4 py-3 text-sm text-primary transition-colors hover:bg-muted/50"
          >
            Show more
          </Link>
        </div>
      </div>
    </aside>
  );
}
