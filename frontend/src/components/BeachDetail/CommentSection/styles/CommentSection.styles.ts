import type { CSSProperties } from "react";

type CommentSectionStyleKey =
  | "section"
  | "title"
  | "composerForm"
  | "composerAvatar"
  | "composerIcon"
  | "composerBody"
  | "textarea"
  | "composerFooter"
  | "counter"
  | "submit"
  | "list"
  | "empty"
  | "comment"
  | "avatar"
  | "commentBody"
  | "commentHeader"
  | "author"
  | "date"
  | "description"
  | "delete"
  | "deleteIcon";

export function getCommentSectionStyles({
  overLimit,
  canSubmit,
}: {
  overLimit: boolean;
  canSubmit: boolean;
}): Record<CommentSectionStyleKey, CSSProperties> {
  return {
    // Lives inline under the rest of the page (YouTube-style), so it's set off from the
    // predictions/description content above by its own top divider rather than a modal backdrop.
    section: {
      marginTop: 32,
      paddingTop: 24,
      borderTop: "1px solid var(--border)",
      textAlign: "left",
    },
    title: {
      margin: "0 0 16px",
      fontSize: 16,
      fontWeight: 600,
      color: "var(--text-h)",
    },
    composerForm: {
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
      marginBottom: 24,
    },
    composerAvatar: {
      flexShrink: 0,
      width: 32,
      height: 32,
      borderRadius: "50%",
      background: "var(--icon-chip)",
      color: "var(--icon-chip-fg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 14,
      fontWeight: 700,
      textTransform: "uppercase",
    },
    composerIcon: {
      width: 14,
      height: 14,
    },
    composerBody: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },
    textarea: {
      width: "100%",
      boxSizing: "border-box",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: "8px 10px",
      font: "inherit",
      fontSize: 13.5,
      background: "var(--surface)",
      color: "var(--text)",
      resize: "vertical",
      minHeight: 44,
    },
    composerFooter: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    counter: {
      fontSize: 11.5,
      color: overLimit ? "var(--error)" : "var(--text)",
    },
    submit: {
      border: "none",
      borderRadius: 12,
      background: "var(--flag-green)",
      color: "white",
      padding: "6px 14px",
      font: "inherit",
      fontWeight: 600,
      cursor: canSubmit ? "pointer" : "default",
      opacity: canSubmit ? 1 : 0.6,
    },
    list: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
    },
    empty: {
      color: "var(--text)",
      fontSize: 14,
      margin: 0,
    },
    comment: {
      display: "flex",
      gap: 10,
      alignItems: "flex-start",
    },
    avatar: {
      flexShrink: 0,
      width: 32,
      height: 32,
      borderRadius: "50%",
      background: "var(--icon-chip)",
      color: "var(--icon-chip-fg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 14,
      fontWeight: 700,
      textTransform: "uppercase",
    },
    commentBody: {
      flex: 1,
      minWidth: 0,
    },
    commentHeader: {
      display: "flex",
      alignItems: "baseline",
      gap: 8,
      flexWrap: "wrap",
    },
    author: {
      fontWeight: 600,
      fontSize: 13,
      color: "var(--text-h)",
    },
    date: {
      fontSize: 11,
      color: "var(--text)",
    },
    description: {
      margin: "2px 0 0",
      fontSize: 13.5,
      color: "var(--text)",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    },
    delete: {
      flexShrink: 0,
      border: "none",
      background: "none",
      cursor: "pointer",
      color: "var(--error)",
      padding: 4,
    },
    deleteIcon: {
      width: 13,
      height: 13,
    },
  };
}
