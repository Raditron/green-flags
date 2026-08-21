import type { User } from "firebase/auth";
import { API_BASE_URL } from "../../../../apiBaseUrl";
import { ReportSubmissionError, submitFlagReport } from "./submitFlagReport";

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

describe("submitFlagReport", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("POSTs the picked flag color with a bearer token from the given user", async () => {
    const fetchMock = stubFetch(200, { agreesWithPrediction: true });

    await submitFlagReport(BEACH_ID, stubUser("fake-id-token"), "green");

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/beaches/${BEACH_ID}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer fake-id-token" },
      body: JSON.stringify({ flagColor: "green" }),
    });
  });

  it("resolves with whether the report agreed with the prediction", async () => {
    stubFetch(200, { agreesWithPrediction: false });

    await expect(submitFlagReport(BEACH_ID, stubUser(), "red")).resolves.toEqual({ agreesWithPrediction: false });
  });

  it("throws a ReportSubmissionError carrying the server's code/message on failure", async () => {
    stubFetch(409, { code: "already_reported", message: "Already reported today" });

    const rejection = submitFlagReport(BEACH_ID, stubUser(), "green");
    await expect(rejection).rejects.toBeInstanceOf(ReportSubmissionError);
    await expect(rejection).rejects.toMatchObject({ code: "already_reported", message: "Already reported today" });
  });

  it("falls back to a generic code/message when the failure response has no body", async () => {
    const fetchMock = jest.fn(async () => new Response(null, { status: 500 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const rejection = submitFlagReport(BEACH_ID, stubUser(), "green");
    await expect(rejection).rejects.toMatchObject({ code: "unknown_error", message: "Could not submit report" });
  });
});
