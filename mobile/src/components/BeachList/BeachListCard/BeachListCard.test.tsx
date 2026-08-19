import { render, screen } from "@testing-library/react-native";
import { press } from "../../../test/press";
import { ThemeProvider } from "../../../theme/ThemeContext";
import { BeachListCard } from "./BeachListCard";
import type { BeachWithDistance } from "../../../shared/types/Beach";

const BASE_BEACH: BeachWithDistance = {
  id: "beach-a",
  name: "Golden Sands",
  lat: 43.28,
  long: 28.05,
  area: "Varna",
  isUnguarded: false,
  currentFlagColor: "green",
  currentConfidencePercent: 82,
};

function renderCard(beach: BeachWithDistance, onPress?: () => void) {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — callers must await it.
  return render(
    <ThemeProvider>
      <BeachListCard beach={beach} onPress={onPress} />
    </ThemeProvider>,
  );
}

describe("BeachListCard", () => {
  it("renders the beach name, Area, flag status, and confidence", async () => {
    await renderCard(BASE_BEACH);

    expect(screen.getByText("Golden Sands")).toBeOnTheScreen();
    expect(screen.getByText("Varna")).toBeOnTheScreen();
    expect(screen.getByText("Green flag · safe to swim")).toBeOnTheScreen();
    expect(screen.getByText("82%")).toBeOnTheScreen();
  });

  it("shows 'No report yet' and no confidence badge when there's no flag prediction", async () => {
    await renderCard({
      ...BASE_BEACH,
      currentFlagColor: undefined,
      currentConfidencePercent: undefined,
    });

    expect(screen.getByText("No report yet")).toBeOnTheScreen();
    expect(screen.queryByText("82%")).toBeNull();
  });

  it("shows the distance when known", async () => {
    await renderCard({ ...BASE_BEACH, distanceKm: 3.2 });

    expect(screen.getByText("3.2 km away")).toBeOnTheScreen();
  });

  it("omits distance text when the visitor's location isn't known", async () => {
    await renderCard(BASE_BEACH);

    expect(screen.queryByText(/km away/)).toBeNull();
  });

  it("calls onPress when tapped", async () => {
    const onPress = jest.fn();
    await renderCard(BASE_BEACH, onPress);

    await press(screen.getByLabelText("Golden Sands"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
