import type { User } from "firebase/auth";
import { API_BASE_URL } from "../../apiBaseUrl";
import { unsaveBeach } from "./unsaveBeach";

function stubFetch(status: number) {
  const fetchMock = jest.fn(async () => new Response(null, { status }));
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

function stubUser(idToken = "fake-id-token") {
  const getIdToken = jest.fn(async () => idToken);
  return { getIdToken } as unknown as User;
}

describe("unsaveBeach", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("DELETEs /api/beaches/:beachId/save with a bearer token from the given user", async () => {
    const fetchMock = stubFetch(200);

    await unsaveBeach("beach-a", stubUser("fake-id-token"));

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/beaches/beach-a/save`, {
      method: "DELETE",
      headers: { Authorization: "Bearer fake-id-token" },
    });
  });

  it("throws on a non-ok response", async () => {
    stubFetch(503);

    await expect(unsaveBeach("beach-a", stubUser())).rejects.toThrow(
      "Unsave beach request failed with status 503",
    );
  });
});
