import type { User } from "firebase/auth";
import { API_BASE_URL } from "../../../../apiBaseUrl";
import { fetchReportStatus } from "./fetchReportStatus";

const BEACH_ID = "beach-a";

function stubFetch(status: number, body: unknown = {}) {
  const fetchMock = jest.fn(async () => new Response(JSON.stringify(body), { status }));
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

function stubUser(idToken = "fake-id-token") {
  const getIdToken = jest.fn(async () => idToken);
  return { getIdToken } as unknown as User;
}

describe("fetchReportStatus", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("GETs report-status with a bearer token from the given user", async () => {
    const fetchMock = stubFetch(200, { alreadyReportedToday: false });

    await fetchReportStatus(BEACH_ID, stubUser("fake-id-token"));

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/beaches/${BEACH_ID}/report-status`, {
      headers: { Authorization: "Bearer fake-id-token" },
    });
  });

  it("resolves alreadyReportedToday: false as-is", async () => {
    stubFetch(200, { alreadyReportedToday: false });

    await expect(fetchReportStatus(BEACH_ID, stubUser())).resolves.toEqual({ alreadyReportedToday: false });
  });

  it("resolves the reported flag color and agreement when already reported today", async () => {
    stubFetch(200, { alreadyReportedToday: true, flagColor: "yellow", agreesWithPrediction: true });

    await expect(fetchReportStatus(BEACH_ID, stubUser())).resolves.toEqual({
      alreadyReportedToday: true,
      reported: { flagColor: "yellow", agreesWithPrediction: true },
    });
  });

  it("throws on a non-ok response", async () => {
    stubFetch(503);

    await expect(fetchReportStatus(BEACH_ID, stubUser())).rejects.toThrow(
      "Report status request failed with status 503",
    );
  });

  it("throws when the server sends alreadyReportedToday: true without flagColor/agreesWithPrediction", async () => {
    stubFetch(200, { alreadyReportedToday: true });

    await expect(fetchReportStatus(BEACH_ID, stubUser())).rejects.toThrow(
      "Report status response was missing flagColor/agreesWithPrediction for an already-reported day",
    );
  });
});
