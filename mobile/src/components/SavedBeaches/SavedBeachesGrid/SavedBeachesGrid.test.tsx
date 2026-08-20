import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { press } from "../../../test/press";
import { TEST_SAFE_AREA_METRICS } from "../../../test/safeAreaMetrics";
import { ThemeProvider } from "../../../theme/ThemeContext";
import { SavedBeachesGrid } from "./SavedBeachesGrid";
import type { Beach } from "../../../shared/types/Beach";

const mockIsSaved = jest.fn();
const mockToggleSave = jest.fn();
let mockIsReady: boolean;

// SaveBeachButton (used per-card for the unsave star) reads both of these contexts too — mocking
// them here covers the grid's own filtering (isSaved/isReady) and each card's star in one seam,
// mirroring SaveBeachButton.test.tsx's own mocks rather than duplicating a real AuthProvider.
jest.mock("../../../auth/AuthContext", () => ({
  useAuth: () => ({ user: { uid: "u1" } }),
}));
jest.mock("../../../saved/SavedBeachesContext", () => ({
  useSavedBeaches: () => ({ isSaved: mockIsSaved, toggleSave: mockToggleSave, isReady: mockIsReady }),
}));

const GOLDEN_SANDS: Beach = {
  id: "golden-sands",
  name: "Golden Sands",
  lat: 43.28,
  long: 28.05,
  area: "Varna",
  isUnguarded: false,
  currentFlagColor: "green",
  currentConfidencePercent: 82,
};

const SUNNY_BEACH: Beach = {
  id: "sunny-beach",
  name: "Sunny Beach",
  lat: 42.5,
  long: 27.7,
  area: "Burgas",
  isUnguarded: true,
  currentFlagColor: "red",
  currentConfidencePercent: 60,
};

function renderGrid(beaches: Beach[], onPressBeach = jest.fn()) {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — callers must await it.
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
      <ThemeProvider>
        <SavedBeachesGrid beaches={beaches} onPressBeach={onPressBeach} />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  mockIsSaved.mockReset();
  mockToggleSave.mockReset();
  mockIsReady = true;
});

describe("SavedBeachesGrid", () => {
  it("renders a card per beach still reported saved by SavedBeachesContext", async () => {
    mockIsSaved.mockReturnValue(true);
    await renderGrid([GOLDEN_SANDS, SUNNY_BEACH]);

    expect(screen.getByText("Golden Sands")).toBeOnTheScreen();
    expect(screen.getByText("Sunny Beach")).toBeOnTheScreen();
  });

  it("drops a beach the context no longer reports saved (e.g. unsaved elsewhere)", async () => {
    mockIsSaved.mockImplementation((id: string) => id === "golden-sands");
    await renderGrid([GOLDEN_SANDS, SUNNY_BEACH]);

    expect(screen.getByText("Golden Sands")).toBeOnTheScreen();
    expect(screen.queryByText("Sunny Beach")).toBeNull();
  });

  it("shows every beach passed in (unfiltered) until the context's own fetch is ready", async () => {
    mockIsReady = false;
    mockIsSaved.mockReturnValue(false);
    await renderGrid([GOLDEN_SANDS, SUNNY_BEACH]);

    expect(screen.getByText("Golden Sands")).toBeOnTheScreen();
    expect(screen.getByText("Sunny Beach")).toBeOnTheScreen();
  });

  it("shows a friendly empty state when there are no saved beaches", async () => {
    mockIsSaved.mockReturnValue(false);
    await renderGrid([]);

    expect(screen.getByText(/haven't saved any beaches yet/)).toBeOnTheScreen();
  });

  it("calls onPressBeach when a card is tapped", async () => {
    mockIsSaved.mockReturnValue(true);
    const onPressBeach = jest.fn();
    await renderGrid([GOLDEN_SANDS], onPressBeach);

    await press(screen.getByLabelText("Golden Sands"));

    expect(onPressBeach).toHaveBeenCalledWith(GOLDEN_SANDS);
  });

  it("unsaving a card directly from the grid calls toggleSave without needing onPressBeach", async () => {
    mockIsSaved.mockReturnValue(true);
    await renderGrid([GOLDEN_SANDS]);

    await press(screen.getByLabelText("Unsave beach"));

    expect(mockToggleSave).toHaveBeenCalledWith("golden-sands");
  });
});
