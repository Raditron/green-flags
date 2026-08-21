import type { User } from "firebase/auth";
import { API_BASE_URL } from "../../../../apiBaseUrl";
import { CommentSubmissionError, postComment } from "./postComment";

const BEACH_ID = "beach-a";

// undefined body means "no body" (the Fetch spec forbids a body on a null-body status like 204,
// which is exactly what a successful addComment response is — see comment.controller.ts's
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

describe("postComment", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("POSTs the description with a bearer token from the given user", async () => {
    const fetchMock = stubFetch(204);

    await postComment(BEACH_ID, stubUser("fake-id-token"), "Nice beach");

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/beaches/${BEACH_ID}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer fake-id-token" },
      body: JSON.stringify({ description: "Nice beach" }),
    });
  });

  it("resolves with nothing on success", async () => {
    stubFetch(204);

    await expect(postComment(BEACH_ID, stubUser(), "Nice beach")).resolves.toBeUndefined();
  });

  it("throws a CommentSubmissionError carrying the server's code/message on failure", async () => {
    stubFetch(400, { code: "invalid_description", message: "description must be a non-empty string" });

    const rejection = postComment(BEACH_ID, stubUser(), "");
    await expect(rejection).rejects.toBeInstanceOf(CommentSubmissionError);
    await expect(rejection).rejects.toMatchObject({
      code: "invalid_description",
      message: "description must be a non-empty string",
    });
  });

  it("falls back to a generic code/message when the failure response has no body", async () => {
    const fetchMock = jest.fn(async () => new Response(null, { status: 500 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const rejection = postComment(BEACH_ID, stubUser(), "Nice beach");
    await expect(rejection).rejects.toMatchObject({ code: "unknown_error", message: "Could not post comment" });
  });
});
