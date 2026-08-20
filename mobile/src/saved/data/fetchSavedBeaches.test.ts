import type { User } from "firebase/auth";
import { API_BASE_URL } from "../../apiBaseUrl";
import { fetchSavedBeaches } from "./fetchSavedBeaches";
import type { Beach } from "../../shared/types/Beach";

function stubFetch(status: number, body: unknown = {}) {
  const fetchMock = jest.fn(async () => new Response(JSON.stringify(body), { status }));
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

function stubUser(idToken = "fake-id-token") {
  const getIdToken = jest.fn(async () => idToken);
  return { getIdToken } as unknown as User;
}

function beach(id: string): Beach {
  return { id, name: id, lat: 43.2, long: 27.9, area: "Varna", isUnguarded: false };
}

describe("fetchSavedBeaches", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("requests GET /api/beaches/saved with a bearer token from the given user", async () => {
    const body: Beach[] = [beach("beach-a")];
    const fetchMock = stubFetch(200, body);
    const user = stubUser("fake-id-token");

    const result = await fetchSavedBeaches(user);

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/beaches/saved`, {
      headers: { Authorization: "Bearer fake-id-token" },
    });
    expect(result).toEqual(body);
  });

  it("resolves with an empty list when nothing is saved", async () => {
    stubFetch(200, []);

    const result = await fetchSavedBeaches(stubUser());

    expect(result).toEqual([]);
  });

  it("throws on a non-ok response", async () => {
    stubFetch(503);

    await expect(fetchSavedBeaches(stubUser())).rejects.toThrow(
      "Saved beaches request failed with status 503",
    );
  });
});
