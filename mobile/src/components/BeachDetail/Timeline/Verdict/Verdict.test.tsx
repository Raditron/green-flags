import { render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { Verdict } from "./Verdict";
import type { HourlyPrediction } from "../../interfaces";

const PREDICTION: HourlyPrediction = {
  hour: 15,
  flagColor: "green",
  ripCurrentRisk: "low",
  confidence: { percent: 90, basis: "certain", sampleSize: 0 },
  readableWindSpeed: "calm",
  readableSeaState: "calm",
};

function renderVerdict(props: Partial<{ prediction: HourlyPrediction; desaturated: boolean }> = {}) {
  return render(
    <ThemeProvider>
      <Verdict {...props} />
    </ThemeProvider>,
  );
}

describe("Verdict", () => {
  it("renders nothing when there is no prediction for the selected hour", async () => {
    const { toJSON } = await renderVerdict();

    expect(toJSON()).toBeNull();
  });

  it("renders the flag status headline for the selected prediction", async () => {
    await renderVerdict({ prediction: PREDICTION });

    expect(screen.getByText("Green flag · safe to swim")).toBeOnTheScreen();
  });

  it("shows a rip-current caution only when actually warranted", async () => {
    await renderVerdict({ prediction: { ...PREDICTION, ripCurrentRisk: "high" } });

    expect(screen.getByText("Strong rip currents — stay close to shore")).toBeOnTheScreen();
  });

  it("omits the caution for a low rip-current risk", async () => {
    await renderVerdict({ prediction: PREDICTION });

    expect(screen.queryByText(/rip current/i)).toBeNull();
  });
});
