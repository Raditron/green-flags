import type { User } from "firebase/auth";
import { API_BASE_URL } from "../../../../apiBaseUrl";
import { CommentDeletionError, deleteComment } from "./deleteComment";

const BEACH_ID = "beach-a";
const COMMENT_ID = "comment-a";

// undefined body means "no body" (the Fetch spec forbids a body on a null-body status like 204,
// which is exactly what a successful deleteComment response is — see comment.controller.ts's
// `res.status(204).end()`).
function stubFetch(status: number, body?: unknown) {
  const fetchMock = jest.fn(async () => new Response(body === undefined ? null : JSON.stringify(body), { status }));
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

function stubUser(idToken = "fake-id-token") {
  const getIdToken = jest.fn(async () => idToken);
  return { getIdToken } as unknown as User;
}

describe("deleteComment", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("DELETEs the comment with a bearer token from the given user", async () => {
    const fetchMock = stubFetch(204);

    await deleteComment(BEACH_ID, COMMENT_ID, stubUser("fake-id-token"));

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/beaches/${BEACH_ID}/comments/${COMMENT_ID}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer fake-id-token" },
    });
  });

  it("resolves with nothing on success", async () => {
    stubFetch(204);

    await expect(deleteComment(BEACH_ID, COMMENT_ID, stubUser())).resolves.toBeUndefined();
  });

  it("throws a CommentDeletionError carrying the server's code/message on failure", async () => {
    stubFetch(403, { code: "unauthorized", message: "You are not authorized to delete this comment" });

    const rejection = deleteComment(BEACH_ID, COMMENT_ID, stubUser());
    await expect(rejection).rejects.toBeInstanceOf(CommentDeletionError);
    await expect(rejection).rejects.toMatchObject({
      code: "unauthorized",
      message: "You are not authorized to delete this comment",
    });
  });

  it("falls back to a generic code/message when the failure response has no body", async () => {
    const fetchMock = jest.fn(async () => new Response(null, { status: 500 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const rejection = deleteComment(BEACH_ID, COMMENT_ID, stubUser());
    await expect(rejection).rejects.toMatchObject({ code: "unknown_error", message: "Could not delete comment" });
  });
});
