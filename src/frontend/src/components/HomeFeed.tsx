import { Users } from "lucide-react";
import { useHomeFeed } from "../hooks/useQueries";
import { FeedList } from "./FeedList";

export function HomeFeed() {
  const query = useHomeFeed();

  return (
    <FeedList
      query={query}
      emptyIcon={<Users className="h-8 w-8 text-primary" />}
      emptyTitle="Your feed is empty"
      emptyDescription="Follow users to see their posts here."
    />
  );
}
