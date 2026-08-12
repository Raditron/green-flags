import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReportedTodayNotice } from "./ReportedTodayNotice";

describe("ReportedTodayNotice", () => {
  it.each([
    ["green", "Green"],
    ["yellow", "Yellow"],
    ["red", "Red"],
  ] as const)("echoes back the %s flag the user reported today", (flagColor, label) => {
    render(<ReportedTodayNotice reported={{ flagColor, agreesWithPrediction: true }} />);

    expect(screen.getByText(`Thanks — you reported the flag as ${label} today.`)).toBeInTheDocument();
  });

  it("shows an agreement message when the report matched the prediction", () => {
    render(<ReportedTodayNotice reported={{ flagColor: "green", agreesWithPrediction: true }} />);

    expect(screen.getByText("You agreed with our prediction.")).toBeInTheDocument();
  });

  it("shows a disagreement message when the report didn't match the prediction", () => {
    render(<ReportedTodayNotice reported={{ flagColor: "green", agreesWithPrediction: false }} />);

    expect(screen.getByText("That's different from our prediction.")).toBeInTheDocument();
  });
});
