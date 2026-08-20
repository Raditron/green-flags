import { render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { HourDetail } from "./HourDetail";
import type { HourlyPrediction } from "../../interfaces";

function renderHourDetail(prediction: HourlyPrediction) {
  return render(
    <ThemeProvider>
      <HourDetail prediction={prediction} />
    </ThemeProvider>,
  );
}

describe("HourDetail", () => {
  it("renders the hour and confidence percent", async () => {
    await renderHourDetail({
      hour: 14,
      flagColor: "green",
      ripCurrentRisk: "low",
      confidence: { percent: 72, basis: "blended", sampleSize: 4 },
      readableWindSpeed: "calm",
      readableSeaState: "calm",
    });

    expect(screen.getByText("14:00")).toBeOnTheScreen();
    expect(screen.getByText("72%")).toBeOnTheScreen();
    expect(screen.getByRole("progressbar", { name: "Confidence" })).toBeOnTheScreen();
  });

  it("captions a 'certain' basis as conditions clear of every threshold", async () => {
    await renderHourDetail({
      hour: 9,
      flagColor: "green",
      ripCurrentRisk: "low",
      confidence: { percent: 100, basis: "certain", sampleSize: 0 },
      readableWindSpeed: "calm",
      readableSeaState: "calm",
    });

    expect(screen.getByText("Conditions are clear of every threshold")).toBeOnTheScreen();
  });

  it("captions a 'prior' basis (or zero sample size) as no matching reports yet", async () => {
    await renderHourDetail({
      hour: 9,
      flagColor: "yellow",
      ripCurrentRisk: "low",
      confidence: { percent: 62, basis: "prior", sampleSize: 0 },
      readableWindSpeed: "calm",
      readableSeaState: "calm",
    });

    expect(screen.getByText("No matching reports yet")).toBeOnTheScreen();
  });

  it("captions a blended basis with the sample size, pluralized correctly", async () => {
    await renderHourDetail({
      hour: 9,
      flagColor: "yellow",
      ripCurrentRisk: "low",
      confidence: { percent: 80, basis: "blended", sampleSize: 1 },
      readableWindSpeed: "calm",
      readableSeaState: "calm",
    });

    expect(screen.getByText("Based on 1 past report")).toBeOnTheScreen();
  });
});
