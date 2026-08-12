import { API_BASE_URL } from "../../../../apiBaseUrl";
import type { CommentWithAuthor } from "../interfaces";

export async function fetchComments(beachId: string): Promise<CommentWithAuthor[]> {
  const response = await fetch(`${API_BASE_URL}/api/beaches/${beachId}/comments`);

  if (!response.ok) {
    throw new Error(`Comments request failed with status ${response.status}`);
  }

  return response.json() as Promise<CommentWithAuthor[]>;
}
