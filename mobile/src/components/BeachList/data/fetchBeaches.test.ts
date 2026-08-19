import { API_BASE_URL } from "../../../apiBaseUrl";
import { fetchBeaches } from "./fetchBeaches";
import type { Beach, BeachListResponse } from "../interfaces";

function stubFetch(status: number, body: unknown = {}) {
  const fetchMock = jest.fn(async () => new Response(JSON.stringify(body), { status }));
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

function beach(id: string): Beach {
  return { id, name: id, lat: 43.2, long: 27.9, area: "Varna", isUnguarded: false };
}

describe("fetchBeaches", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("requests GET /api/beaches against the configured API base URL", async () => {
    const body: BeachListResponse = { beaches: [beach("beach-a")] };
    const fetchMock = stubFetch(200, body);

    const result = await fetchBeaches();

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/beaches`);
    expect(result).toEqual(body);
  });

  it("resolves with an empty list when there are no beaches", async () => {
    stubFetch(200, { beaches: [] });

    const result = await fetchBeaches();

    expect(result.beaches).toEqual([]);
  });

  it("throws on a non-ok response", async () => {
    stubFetch(503);

    await expect(fetchBeaches()).rejects.toThrow("Beach list request failed with status 503");
  });
});
