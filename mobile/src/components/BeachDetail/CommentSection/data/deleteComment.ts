import type { User } from "firebase/auth";
import { API_BASE_URL } from "../../../../apiBaseUrl";

// RN port of frontend/src/components/BeachDetail/CommentSection/data/deleteComment.ts, verbatim.
export class CommentDeletionError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export async function deleteComment(beachId: string, commentId: string, user: User): Promise<void> {
  const idToken = await user.getIdToken();
  const response = await fetch(`${API_BASE_URL}/api/beaches/${beachId}/comments/${commentId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new CommentDeletionError(body?.code ?? "unknown_error", body?.message ?? "Could not delete comment");
  }
}
