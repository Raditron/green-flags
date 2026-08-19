import { API_BASE_URL } from "../../../apiBaseUrl";
import { fetchDailySummary } from "./fetchDailySummary";
import type { AverageAttributes, DailySummaryResponse } from "../interfaces";

function stubFetch(status: number, body: unknown = {}) {
  const fetchMock = jest.fn(async () => new Response(JSON.stringify(body), { status }));
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

const EMPTY_AVERAGE_ATTRIBUTES: AverageAttributes = {
  dominantFlagColor: "green",
  flagColorDistribution: { green: 0, yellow: 0, red: 0 },
  dominantRipCurrentRisk: "low",
  ripCurrentRiskDistribution: { low: 0, moderate: 0, high: 0 },
  averageConfidencePercent: 0,
  confidenceBasisDistribution: { certain: 0, prior: 0, blended: 0 },
  averageWindSpeedMps: 0,
  readableWindSpeed: "calm",
  averageWaveHeightM: 0,
  readableSeaState: "calm",
  averageWavePeriodS: 0,
  stormWarningActivePercent: 0,
  sampleSize: 0,
  beachCount: 0,
};

describe("fetchDailySummary", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("requests GET /api/daily-summary against the configured API base URL", async () => {
    const body: DailySummaryResponse = {
      date: "2026-08-18",
      averageAttributesBySea: { ...EMPTY_AVERAGE_ATTRIBUTES, sampleSize: 10, beachCount: 3 },
      averageAttributesByArea: [],
    };
    const fetchMock = stubFetch(200, body);

    const result = await fetchDailySummary();

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/daily-summary`);
    expect(result).toEqual(body);
  });

  it("resolves with a zero-sampleSize response on an empty day (no predictions yet)", async () => {
    const body: DailySummaryResponse = {
      date: "2026-08-18",
      averageAttributesBySea: EMPTY_AVERAGE_ATTRIBUTES,
      averageAttributesByArea: [],
    };
    stubFetch(200, body);

    const result = await fetchDailySummary();

    expect(result.averageAttributesBySea.sampleSize).toBe(0);
    expect(result.averageAttributesByArea).toEqual([]);
  });

  it("throws on a non-ok response", async () => {
    stubFetch(503);

    await expect(fetchDailySummary()).rejects.toThrow("Daily summary request failed with status 503");
  });
});
