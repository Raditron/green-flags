import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { FaRegComment, FaTrashCan } from "react-icons/fa6";
import { useAuth } from "../../../auth/AuthContext";
import { AuthModal } from "../../Auth/AuthModal/AuthModal";
import { useToast } from "../../Layout/Toast/ToastContext";
import { useComments } from "./hooks/useComments";
import { postComment } from "./data/postComment";
import { deleteComment } from "./data/deleteComment";
import type { CommentSectionProps, CommentWithAuthor } from "./interfaces";
import { getCommentSectionStyles } from "./styles/CommentSection.styles";

const MAX_DESCRIPTION_LENGTH = 1000;

// Mirrors the backend's own isValidDescription check (comment.controller.ts) so the composer's
// disabled state never disagrees with what the server would actually accept.
function isValidDescription(value: string): boolean {
  return value.trim().length > 0 && value.length <= MAX_DESCRIPTION_LENGTH;
}

function avatarInitial(displayName: string, email: string): string {
  return displayName.charAt(0) || email.charAt(0) || "?";
}

function formatDate(createdOn: string): string {
  return new Date(createdOn).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function commentCountLabel(count: number): string {
  return `${count} ${count === 1 ? "Comment" : "Comments"}`;
}

/**
 * Comments render inline under the beach detail page (YouTube-style) rather than behind a
 * modal — per issue #70, reads are always open to any visitor, so there's nothing to gate
 * behind an open/close toggle. Posting/deleting still funnels a signed-out visitor through the
 * existing AuthModal first, same as SaveBeachButton and Timeline's report-the-flag feature.
 * All failures surface via the global Toast system rather than inline in the section.
 */
export function CommentSection({ beachId }: CommentSectionProps) {
  const { user } = useAuth();
  const { comments, loading, error, refetch } = useComments(beachId);
  const { show: showToast } = useToast();
  const [authenticating, setAuthenticating] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const overLimit = draft.length > MAX_DESCRIPTION_LENGTH;
  const canSubmit = isValidDescription(draft) && !posting;
  const styles = getCommentSectionStyles({ overLimit, canSubmit });
  const reportedErrorRef = useRef<string | null>(null);

  // Surfaces a comment-list fetch failure once per distinct error via the global toast, since
  // the section is always on screen (no modal to hide it behind).
  useEffect(() => {
    if (error && reportedErrorRef.current !== error) {
      reportedErrorRef.current = error;
      showToast("Could not load comments.");
    }
    if (!error) reportedErrorRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) {
      setAuthenticating(true);
      return;
    }
    if (!isValidDescription(draft)) return;

    setPosting(true);
    try {
      await postComment(beachId, user, draft);
      setDraft("");
      refetch();
    } catch {
      showToast("Could not post comment.");
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(comment: CommentWithAuthor) {
    if (!user) return;
    setDeletingId(comment.id);
    try {
      await deleteComment(beachId, comment.id, user);
      refetch();
    } catch {
      showToast("Could not delete comment.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section id="comments" style={styles.section} aria-label="Comments">
      <h2 style={styles.title}>{loading ? "Comments" : commentCountLabel(comments.length)}</h2>

      <form onSubmit={handleSubmit} style={styles.composerForm}>
        <div style={styles.composerAvatar} aria-hidden="true">
          {user ? avatarInitial(user.displayName ?? "", user.email ?? "") : <FaRegComment style={styles.composerIcon} />}
        </div>
        <div style={styles.composerBody}>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a comment…"
            style={styles.textarea}
            aria-label="Add a comment"
          />
          <div style={styles.composerFooter}>
            <span style={styles.counter}>{`${draft.length}/${MAX_DESCRIPTION_LENGTH}`}</span>
            <button type="submit" style={styles.submit} disabled={!canSubmit}>
              Post
            </button>
          </div>
        </div>
      </form>

      <div style={styles.list}>
        {!loading && comments.length === 0 && (
          <p style={styles.empty}>No comments yet — be the first to leave one.</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} style={styles.comment}>
            <div style={styles.avatar}>{avatarInitial(comment.displayName, comment.email)}</div>
            <div style={styles.commentBody}>
              <div style={styles.commentHeader}>
                <span style={styles.author}>{comment.displayName || comment.email}</span>
                <span style={styles.date}>{formatDate(comment.createdOn)}</span>
              </div>
              <p style={styles.description}>{comment.description}</p>
            </div>
            {user?.uid === comment.userId && (
              <button
                type="button"
                style={styles.delete}
                onClick={() => handleDelete(comment)}
                disabled={deletingId === comment.id}
                aria-label="Delete comment"
              >
                <FaTrashCan style={styles.deleteIcon} />
              </button>
            )}
          </div>
        ))}
      </div>

      {authenticating && (
        <AuthModal
          onClose={() => setAuthenticating(false)}
          onAuthenticated={() => setAuthenticating(false)}
        />
      )}
    </section>
  );
}
