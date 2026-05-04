import { create } from "zustand";

interface AppState {
  composeMode: "new" | "reply" | "quote" | null;
  composeQuotedPostId: bigint | null;
  composeReplyToId: bigint | null;

  startReply: (postId: bigint) => void;
  startQuote: (postId: bigint) => void;
  clearCompose: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  composeMode: null,
  composeQuotedPostId: null,
  composeReplyToId: null,

  startReply: (postId) =>
    set({ composeMode: "reply", composeReplyToId: postId }),

  startQuote: (postId) =>
    set({ composeMode: "quote", composeQuotedPostId: postId }),

  clearCompose: () =>
    set({
      composeMode: null,
      composeQuotedPostId: null,
      composeReplyToId: null,
    }),
}));
