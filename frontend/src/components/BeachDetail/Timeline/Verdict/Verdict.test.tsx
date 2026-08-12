import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

describe("Verdict", () => {
  it("renders nothing when there is no prediction for the selected hour", () => {
    const { container } = render(<Verdict />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the flag status headline for the selected prediction", () => {
    const { getByRole } = render(<Verdict prediction={PREDICTION} />);
    expect(getByRole("status")).toBeInTheDocument();
  });
});
