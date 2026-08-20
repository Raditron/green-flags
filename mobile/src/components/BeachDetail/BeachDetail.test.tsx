import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { press } from "../../test/press";
import { TEST_SAFE_AREA_METRICS } from "../../test/safeAreaMetrics";
import { ThemeProvider } from "../../theme/ThemeContext";
import { ToastProvider } from "../../toast/ToastContext";
import { BeachDetail } from "./BeachDetail";
import type { BeachDetailScreenProps } from "../../navigation/interfaces";

// Thin rendering test: mock the data-fetching hooks and toast context so this stays isolated from
// network calls and focuses on the hero image sourcing and the Forecast Strip <-> Timeline/Day
// Outlook swap — mirrors frontend's BeachDetail.test.tsx.
jest.mock("./hooks/useBeach", () => ({
  useBeach: () => ({
    name: "Varna Central Beach",
    quirkNotes: undefined,
    isUnguarded: false,
  }),
}));
jest.mock("./hooks/usePredictions", () => ({
  usePredictions: () => ({ status: "loading" }) as const,
}));

const mockIsSaved = jest.fn();
const mockToggleSave = jest.fn();

// SaveBeachButton (#100) reads both of these contexts — mocked wholesale, same seam as
// SaveBeachButton.test.tsx, so this stays a rendering test of BeachDetail rather than an
// end-to-end exercise of the save feature (that's SaveBeachButton's own job).
jest.mock("../../auth/AuthContext", () => ({
  useAuth: () => ({ user: { uid: "u1" } }),
}));
jest.mock("../../saved/SavedBeachesContext", () => ({
  useSavedBeaches: () => ({ isSaved: mockIsSaved, toggleSave: mockToggleSave, isReady: true }),
}));

const mockNavigation = { setOptions: jest.fn(), goBack: jest.fn() } as unknown as BeachDetailScreenProps["navigation"];

function renderDetail(beachId: string) {
  const route = { key: "BeachDetail", name: "BeachDetail", params: { beachId } } as unknown as BeachDetailScreenProps["route"];
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
      <ThemeProvider>
        <ToastProvider>
          <BeachDetail route={route} navigation={mockNavigation} />
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  mockIsSaved.mockReset();
  mockToggleSave.mockReset();
});

describe("BeachDetail", () => {
  it("renders the beach's curated hero photo when one exists", async () => {
    await renderDetail("varna-central-beach");

    expect(screen.getByLabelText("Beach photo")).toBeOnTheScreen();
  });

  it("falls back to the generic icon when the beach has no curated photo", async () => {
    await renderDetail("not-a-real-beach");

    expect(screen.queryByLabelText("Beach photo")).toBeNull();
  });

  it("selecting a future Forecast Strip chip swaps Timeline for Day Outlook, and reselecting Today reverts", async () => {
    await renderDetail("varna-central-beach");

    // Today starts selected: the screen's own (Timeline) loading copy shows, not Day Outlook's.
    expect(screen.getByText("Loading predictions…")).toBeOnTheScreen();
    expect(screen.queryByText("Loading forecast…")).toBeNull();

    // Chip 0 is Today; press the next chip, a future date, to swap in Day Outlook.
    const chips = screen.getAllByRole("button", { name: /loading forecast/ });
    fireEvent.press(chips[1]);

    expect(await screen.findByText("Loading forecast…")).toBeOnTheScreen();
    expect(screen.queryByText("Loading predictions…")).toBeNull();

    // Selecting Today again reverts to the original Timeline area, unchanged.
    fireEvent.press(screen.getByRole("button", { name: "Today: loading forecast" }));

    expect(await screen.findByText("Loading predictions…")).toBeOnTheScreen();
    expect(screen.queryByText("Loading forecast…")).toBeNull();
  });

  it("saving the beach toggles it and shows a confirmation toast", async () => {
    mockIsSaved.mockReturnValue(false);
    await renderDetail("varna-central-beach");

    await press(screen.getByLabelText("Save beach"));

    expect(mockToggleSave).toHaveBeenCalledWith("varna-central-beach");
    expect(await screen.findByText("Saved to your beaches")).toBeOnTheScreen();
  });

  it("unsaving a previously saved beach toggles it without a toast", async () => {
    mockIsSaved.mockReturnValue(true);
    await renderDetail("varna-central-beach");

    await press(screen.getByLabelText("Unsave beach"));

    expect(mockToggleSave).toHaveBeenCalledWith("varna-central-beach");
    expect(screen.queryByText("Saved to your beaches")).toBeNull();
  });
});
