import { PenLine } from "lucide-react";
import { useGlobalFeed } from "../hooks/useQueries";
import { FeedList } from "./FeedList";

export function GlobalFeed() {
  const query = useGlobalFeed();

  return (
    <FeedList
      query={query}
      emptyIcon={<PenLine className="h-8 w-8 text-primary" />}
      emptyTitle="No posts yet"
      emptyDescription="Be the first to share something!"
    />
  );
}
