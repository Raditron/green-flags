import type { User } from "firebase/auth";
import { API_BASE_URL } from "../../../../apiBaseUrl";

export class CommentSubmissionError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export async function postComment(beachId: string, user: User, description: string): Promise<void> {
  const idToken = await user.getIdToken();
  const response = await fetch(`${API_BASE_URL}/api/beaches/${beachId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ description }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new CommentSubmissionError(body?.code ?? "unknown_error", body?.message ?? "Could not post comment");
  }
}
