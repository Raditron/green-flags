import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useAuth } from "../../../auth/AuthContext";
import { AuthScreen } from "../../../auth/AuthScreen";
import { useTheme } from "../../../theme/ThemeContext";
import { useToast } from "../../../toast/ToastContext";
import { avatarInitial } from "../../../shared/avatarInitial";
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
 * RN port of frontend's CommentSection/CommentSection.tsx — same YouTube-style always-visible
 * placement under the rest of Beach Detail (see BeachDetail.tsx), same auth gating (a signed-out
 * visitor tapping Post routes through AuthScreen first, same as SaveBeachButton and Timeline's
 * report-the-flag flow), same author-only delete control, same "errors via toast, success via
 * refetch" split — no success toast of its own, matching frontend's own CommentSection (unlike the
 * save/report-submitted toasts BeachDetail.tsx documents as deliberate mobile-only additions on top
 * of frontend, this one is a straight port). Unlike ReportFlag's useReportFlag, a draft isn't
 * queued and auto-submitted once a signed-out visitor finishes authenticating — frontend's own
 * composer doesn't do that either, so the draft just sits in the textarea for a manual re-tap.
 */
export function CommentSection({ beachId }: CommentSectionProps) {
  const { user } = useAuth();
  const { tokens } = useTheme();
  const { comments, loading, error, refetch } = useComments(beachId);
  const { show: showToast } = useToast();
  const [authenticating, setAuthenticating] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const overLimit = draft.length > MAX_DESCRIPTION_LENGTH;
  const canSubmit = isValidDescription(draft) && !posting;
  const styles = getCommentSectionStyles(tokens, { overLimit, canSubmit });
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

  async function handleSubmit() {
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
    <View style={styles.section} accessibilityLabel="Comments">
      <Text style={styles.title} accessibilityRole="header">
        {loading ? "Comments" : commentCountLabel(comments.length)}
      </Text>

      <View style={styles.composerRow}>
        <View style={styles.composerAvatar}>
          {user ? (
            <Text style={styles.composerAvatarText}>{avatarInitial(user.displayName ?? "", user.email ?? "")}</Text>
          ) : (
            <FontAwesome6 name="comment" size={14} color={tokens.iconChipFg} />
          )}
        </View>
        <View style={styles.composerBody}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Add a comment…"
            placeholderTextColor={tokens.text}
            style={styles.textarea}
            multiline
            accessibilityLabel="Add a comment"
          />
          <View style={styles.composerFooter}>
            <Text style={styles.counter}>{`${draft.length}/${MAX_DESCRIPTION_LENGTH}`}</Text>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              accessibilityRole="button"
              accessibilityLabel="Post"
              accessibilityState={{ disabled: !canSubmit }}
              style={styles.submit}
            >
              <Text style={styles.submitText}>Post</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.list}>
        {!loading && comments.length === 0 && (
          <Text style={styles.empty}>No comments yet — be the first to leave one.</Text>
        )}
        {comments.map((comment) => (
          <View key={comment.id} style={styles.comment}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarInitial(comment.displayName, comment.email)}</Text>
            </View>
            <View style={styles.commentBody}>
              <View style={styles.commentHeader}>
                <Text style={styles.author}>{comment.displayName || comment.email}</Text>
                <Text style={styles.date}>{formatDate(comment.createdOn)}</Text>
              </View>
              <Text style={styles.description}>{comment.description}</Text>
            </View>
            {user?.uid === comment.userId && (
              <Pressable
                onPress={() => handleDelete(comment)}
                disabled={deletingId === comment.id}
                accessibilityRole="button"
                accessibilityLabel="Delete comment"
                style={styles.delete}
              >
                <FontAwesome6 name="trash-can" solid size={13} color={tokens.error} />
              </Pressable>
            )}
          </View>
        ))}
      </View>

      {authenticating && (
        <AuthScreen onClose={() => setAuthenticating(false)} onAuthenticated={() => setAuthenticating(false)} />
      )}
    </View>
  );
}
