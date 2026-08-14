import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPredictions, PredictionsNotFoundError } from "./fetchPredictions";
import { API_BASE_URL } from "../../../apiBaseUrl";

const BEACH_ID = "beach-a";

function stubFetch(status: number, body: unknown = {}) {
  const fetchMock = vi.fn(async (..._args: Parameters<typeof fetch>) => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("fetchPredictions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("omitting date preserves the exact prior request, with no ?date= param", async () => {
    const fetchMock = stubFetch(200, { beachId: BEACH_ID, date: "2026-08-13", hourlyPredictions: [] });

    await fetchPredictions(BEACH_ID);

    const requestedUrl = new URL(fetchMock.mock.calls[0][0] as string | URL);
    expect(requestedUrl.origin + requestedUrl.pathname).toBe(`${API_BASE_URL}/api/beaches/${BEACH_ID}/predictions`);
    expect(requestedUrl.searchParams.has("date")).toBe(false);
  });

  it("forwards a given date as the ?date= query param", async () => {
    const fetchMock = stubFetch(200, { beachId: BEACH_ID, date: "2026-08-20", hourlyPredictions: [] });

    await fetchPredictions(BEACH_ID, "2026-08-20");

    const requestedUrl = new URL(fetchMock.mock.calls[0][0] as string | URL);
    expect(requestedUrl.searchParams.get("date")).toBe("2026-08-20");
  });

  it("throws PredictionsNotFoundError, distinct from a generic Error, on a 404", async () => {
    stubFetch(404);

    await expect(fetchPredictions(BEACH_ID, "2026-08-20")).rejects.toBeInstanceOf(PredictionsNotFoundError);
  });

  it("throws a generic Error (not PredictionsNotFoundError) on any other failure status", async () => {
    stubFetch(503);

    const rejection = fetchPredictions(BEACH_ID);
    await expect(rejection).rejects.toThrow("Prediction request failed with status 503");
    await expect(rejection).rejects.not.toBeInstanceOf(PredictionsNotFoundError);
  });
});
