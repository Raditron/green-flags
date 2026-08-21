import { render, screen } from "@testing-library/react-native";
import { press } from "../../../../test/press";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { ReportFlagPanel } from "./ReportFlagPanel";
import type { ReportFlagPanelProps } from "./interfaces";

function renderPanel(props: Partial<ReportFlagPanelProps> = {}) {
  return render(
    <ThemeProvider>
      <ReportFlagPanel submitting={false} onPick={() => {}} {...props} />
    </ThemeProvider>,
  );
}

describe("ReportFlagPanel", () => {
  it("renders the flag picker", async () => {
    await renderPanel();

    expect(screen.getByText("Think this flag is wrong? Vote below.")).toBeOnTheScreen();
    expect(screen.getByLabelText("Green")).toBeOnTheScreen();
  });

  it("calls onPick with the chosen color", async () => {
    const onPick = jest.fn();
    await renderPanel({ onPick });

    await press(screen.getByLabelText("Red"));

    expect(onPick).toHaveBeenCalledWith("red");
  });

  it("disables the picker while submitting", async () => {
    await renderPanel({ submitting: true });

    expect(screen.getByLabelText("Green")).toBeDisabled();
  });

  it("shows the submission error above the picker", async () => {
    await renderPanel({ error: "Could not submit report" });

    expect(screen.getByText("Could not submit report")).toBeOnTheScreen();
  });
});
