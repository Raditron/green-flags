import { render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "../../../theme/ThemeContext";
import { DistributionBar } from "./DistributionBar";

const ORDER = ["green", "yellow", "red"] as const;
const COLOR_FOR_KEY = { green: "#16a34a", yellow: "#ca8a04", red: "#dc2626" };
const LABEL_FOR_KEY = { green: "Green", yellow: "Yellow", red: "Red" };

function renderBar(distribution: Record<(typeof ORDER)[number], number>, compact = false) {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — callers must await it.
  return render(
    <ThemeProvider>
      <DistributionBar
        label="Flag colors"
        distribution={distribution}
        order={ORDER}
        colorForKey={COLOR_FOR_KEY}
        labelForKey={LABEL_FOR_KEY}
        compact={compact}
      />
    </ThemeProvider>,
  );
}

describe("DistributionBar", () => {
  it("renders the label and a legend entry (label + percent) for every key", async () => {
    await renderBar({ green: 80, yellow: 20, red: 0 });

    expect(screen.getByText("Flag colors")).toBeOnTheScreen();
    expect(screen.getByText("Green 80%")).toBeOnTheScreen();
    expect(screen.getByText("Yellow 20%")).toBeOnTheScreen();
    expect(screen.getByText("Red 0%")).toBeOnTheScreen();
  });

  it("summarizes the whole distribution in one accessible label on the track, mirroring web's role=img + aria-label", async () => {
    await renderBar({ green: 80, yellow: 20, red: 0 });

    expect(screen.getByLabelText("Flag colors: Green 80%, Yellow 20%, Red 0%")).toBeOnTheScreen();
  });
});
