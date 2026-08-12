import { useCallback, useEffect, useState } from "react";
import { fetchComments } from "../data/fetchComments";
import type { CommentWithAuthor } from "../interfaces";

export interface UseCommentsResult {
  comments: CommentWithAuthor[];
  /** True only until the *first* fetch settles — refetches (after a post/delete) update
   * `comments` in place without flipping this back on, so the count badge never flashes back
   * to hidden/stale once it's had a real value. */
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useComments(beachId: string): UseCommentsResult {
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    fetchComments(beachId)
      .then((result) => {
        if (cancelled) return;
        setComments(result);
        setLoading(false);
      })
      .catch((fetchError: unknown) => {
        if (cancelled) return;
        setError(fetchError instanceof Error ? fetchError.message : "Could not load comments");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [beachId, version]);

  const refetch = useCallback(() => setVersion((current) => current + 1), []);

  return { comments, loading, error, refetch };
}
