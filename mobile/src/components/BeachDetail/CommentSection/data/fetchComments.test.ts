import { API_BASE_URL } from "../../../../apiBaseUrl";
import { fetchComments } from "./fetchComments";

const BEACH_ID = "beach-a";

function stubFetch(status: number, body: unknown = {}) {
  const fetchMock = jest.fn(async () => new Response(JSON.stringify(body), { status }));
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe("fetchComments", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("GETs the beach's comments", async () => {
    const fetchMock = stubFetch(200, []);

    await fetchComments(BEACH_ID);

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/beaches/${BEACH_ID}/comments`);
  });

  it("resolves the comment list as-is", async () => {
    const comments = [{ id: "comment-a", description: "Nice beach", createdOn: "2026-08-02T12:00:00.000Z", userId: "uid-a", beachId: BEACH_ID, displayName: "Diver Dan", email: "diver@example.com" }];
    stubFetch(200, comments);

    await expect(fetchComments(BEACH_ID)).resolves.toEqual(comments);
  });

  it("throws on a non-ok response", async () => {
    stubFetch(503);

    await expect(fetchComments(BEACH_ID)).rejects.toThrow("Comments request failed with status 503");
  });
});
