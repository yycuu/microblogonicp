import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMatch, useRouter } from "@tanstack/react-router";
import { Search } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { TAB_TRIGGER_CLASS } from "../utils/constants";
import { BackButton } from "./BackButton";
import { HashtagResults } from "./HashtagResults";
import { PostResults } from "./PostResults";
import { UserResults } from "./UserResults";

export function SearchPage() {
  const router = useRouter();

  const searchMatch = useMatch({ from: "/search", shouldThrow: false });
  const hashtagMatch = useMatch({
    from: "/hashtag/$tag",
    shouldThrow: false,
  });

  const routeQuery = searchMatch?.search.q ?? "";
  const routeTag = hashtagMatch?.params.tag ?? "";
  const initialQuery = routeTag ? `#${routeTag}` : routeQuery;

  const [inputValue, setInputValue] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("posts");

  // Sync when route params change
  useEffect(() => {
    setInputValue(initialQuery);
    setActiveQuery(initialQuery);
    if (initialQuery) {
      setActiveTab("posts");
    }
  }, [initialQuery]);

  const isHashtagSearch = activeQuery.startsWith("#");
  const hashtagTerm = isHashtagSearch ? activeQuery.slice(1) : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    router.navigate({ to: "/search", search: { q: trimmed } });
  };

  return (
    <div>
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-2">
          <BackButton className="shrink-0" />
          <form onSubmit={handleSubmit} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search posts or users..."
                className="pl-9"
                autoFocus
              />
            </div>
          </form>
        </div>

        {activeQuery && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-auto w-full rounded-none border-b bg-transparent p-0">
              <TabsTrigger value="posts" className={TAB_TRIGGER_CLASS}>
                Posts
              </TabsTrigger>
              <TabsTrigger value="users" className={TAB_TRIGGER_CLASS}>
                Users
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {!activeQuery ? (
        <div className="flex flex-col items-center px-8 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-semibold">Search MicroBlog</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Search for posts, users, or #hashtags
          </p>
        </div>
      ) : activeTab === "posts" ? (
        isHashtagSearch ? (
          <HashtagResults tag={hashtagTerm} />
        ) : (
          <PostResults query={activeQuery} />
        )
      ) : (
        <UserResults query={activeQuery} />
      )}
    </div>
  );
}
