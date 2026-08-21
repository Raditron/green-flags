import { render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { ReportedTodayNotice } from "./ReportedTodayNotice";
import type { FlagColor } from "../../../../shared/types/Beach";

function renderNotice(flagColor: FlagColor, agreesWithPrediction: boolean) {
  return render(
    <ThemeProvider>
      <ReportedTodayNotice reported={{ flagColor, agreesWithPrediction }} />
    </ThemeProvider>,
  );
}

describe("ReportedTodayNotice", () => {
  it.each([
    ["green", "Green"],
    ["yellow", "Yellow"],
    ["red", "Red"],
  ] as const)("echoes back the %s flag the user reported today", async (flagColor, label) => {
    await renderNotice(flagColor, true);

    expect(screen.getByText(`Thanks — you reported the flag as ${label} today.`)).toBeOnTheScreen();
  });

  it("shows an agreement message when the report matched the prediction", async () => {
    await renderNotice("green", true);

    expect(screen.getByText("You agreed with our prediction.")).toBeOnTheScreen();
  });

  it("shows a disagreement message when the report didn't match the prediction", async () => {
    await renderNotice("green", false);

    expect(screen.getByText("That's different from our prediction.")).toBeOnTheScreen();
  });
});
