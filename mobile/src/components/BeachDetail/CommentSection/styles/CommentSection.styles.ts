import { StyleSheet } from "react-native";
import { BORDER_RADIUS } from "../../../../theme/tokens";
import type { ThemeTokens } from "../../../../theme/tokens";

// RN port of frontend's CommentSection/styles/CommentSection.styles.ts. Lives inline under the
// rest of the screen (YouTube-style), set off from the predictions/description content above by
// its own top divider rather than a modal backdrop — same reasoning as frontend's `section`.
export function getCommentSectionStyles(
  tokens: ThemeTokens,
  { overLimit, canSubmit }: { overLimit: boolean; canSubmit: boolean },
) {
  return StyleSheet.create({
    section: {
      marginTop: 8,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: tokens.border,
    },
    title: {
      marginBottom: 16,
      fontSize: 16,
      fontWeight: "600",
      color: tokens.textHeading,
    },
    composerRow: {
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
      marginBottom: 24,
    },
    composerAvatar: {
      flexShrink: 0,
      width: 32,
      height: 32,
      borderRadius: 999,
      backgroundColor: tokens.iconChip,
      alignItems: "center",
      justifyContent: "center",
    },
    composerAvatarText: {
      fontSize: 14,
      fontWeight: "700",
      color: tokens.iconChipFg,
      textTransform: "uppercase",
    },
    composerBody: {
      flex: 1,
      gap: 6,
    },
    textarea: {
      borderWidth: 1,
      borderColor: tokens.border,
      borderRadius: BORDER_RADIUS,
      paddingVertical: 8,
      paddingHorizontal: 10,
      fontSize: 13.5,
      color: tokens.text,
      backgroundColor: tokens.surface,
      minHeight: 44,
      textAlignVertical: "top",
    },
    composerFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    counter: {
      fontSize: 11.5,
      color: overLimit ? tokens.error : tokens.text,
    },
    submit: {
      borderRadius: BORDER_RADIUS,
      backgroundColor: tokens.flagGreen,
      paddingVertical: 6,
      paddingHorizontal: 14,
      opacity: canSubmit ? 1 : 0.6,
    },
    submitText: {
      color: tokens.mediaBadgeFg,
      fontWeight: "700",
      fontSize: 14,
    },
    list: {
      gap: 20,
    },
    empty: {
      fontSize: 14,
      color: tokens.text,
    },
    comment: {
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
    },
    avatar: {
      flexShrink: 0,
      width: 32,
      height: 32,
      borderRadius: 999,
      backgroundColor: tokens.iconChip,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 14,
      fontWeight: "700",
      color: tokens.iconChipFg,
      textTransform: "uppercase",
    },
    commentBody: {
      flex: 1,
    },
    commentHeader: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 8,
      flexWrap: "wrap",
    },
    author: {
      fontWeight: "600",
      fontSize: 13,
      color: tokens.textHeading,
    },
    date: {
      fontSize: 11,
      color: tokens.text,
    },
    description: {
      marginTop: 2,
      fontSize: 13.5,
      color: tokens.text,
    },
    delete: {
      flexShrink: 0,
      padding: 4,
    },
  });
}
