import { fireEvent, render, screen, within } from "@testing-library/react-native";
import { press } from "../../test/press";
import { ThemeProvider } from "../../theme/ThemeContext";
import { BeachList } from "./BeachList";
import type { BeachListState } from "./hooks/useBeaches";
import type { UserLocationState } from "../../shared/hooks/useUserLocation";
import type { Beach } from "../../shared/types/Beach";

let mockBeachesState: BeachListState;
let mockUserLocationState: UserLocationState;

// Mirrors Dashboard.test.tsx's seam: mock the colocated data hooks wholesale rather than the
// network/expo-location, per #96's "component-level test mocking the colocated hook" acceptance
// criterion. useBeachFilters is deliberately left un-mocked — it's a pure derivation over
// whatever these two hooks report, so letting it run for real is what actually exercises the
// Detected Area / search / flag filtering behavior this screen composes.
jest.mock("./hooks/useBeaches", () => ({
  useBeaches: () => mockBeachesState,
}));

jest.mock("../../shared/hooks/useUserLocation", () => ({
  useUserLocation: () => mockUserLocationState,
}));

const mockNavigate = jest.fn();

// Golden Sands sits in Varna, right where VARNA_COORDS below is — well within
// DETECTED_AREA_MAX_KM (50km) — so it drives Detected Area in the location-known tests. Sunny
// Beach sits far south in Burgas, outside that radius, so it stays reachable only via a manual
// Area pick or All Areas.
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

const VARNA_COORDS = { lat: 43.28, long: 28.05 };

function renderScreen() {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — callers must await it.
  return render(
    <ThemeProvider>
      <BeachList navigation={{ navigate: mockNavigate } as never} route={{} as never} />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  mockNavigate.mockReset();
});

describe("BeachList", () => {
  it("shows a loading message while beaches are loading", async () => {
    mockBeachesState = { status: "loading" };
    mockUserLocationState = { status: "loading" };
    await renderScreen();

    expect(screen.getByText("Loading beaches…")).toBeOnTheScreen();
  });

  it("shows an error message when the beach list fails to load", async () => {
    mockBeachesState = { status: "error", message: "Beach list request failed with status 503" };
    mockUserLocationState = { status: "unavailable" };
    await renderScreen();

    expect(
      screen.getByText("Could not load beaches: Beach list request failed with status 503"),
    ).toBeOnTheScreen();
  });

  it("shows 'Finding your area…' while beaches are in but location is still resolving", async () => {
    mockBeachesState = { status: "success", data: [GOLDEN_SANDS, SUNNY_BEACH] };
    mockUserLocationState = { status: "loading" };
    await renderScreen();

    expect(screen.getByText("Finding your area…")).toBeOnTheScreen();
    expect(screen.queryByText("Golden Sands")).toBeNull();
  });

  it("falls back to All Areas with no distances when location is unavailable (denied/ignored)", async () => {
    mockBeachesState = { status: "success", data: [GOLDEN_SANDS, SUNNY_BEACH] };
    mockUserLocationState = { status: "unavailable" };
    await renderScreen();

    expect(screen.getByText("All Areas")).toBeOnTheScreen();
    expect(screen.getByText("Golden Sands")).toBeOnTheScreen();
    expect(screen.getByText("Sunny Beach")).toBeOnTheScreen();
    expect(screen.queryByText(/km away/)).toBeNull();
  });

  it("defaults Selected Area to the Detected Area and shows distances when location resolves", async () => {
    mockBeachesState = { status: "success", data: [GOLDEN_SANDS, SUNNY_BEACH] };
    mockUserLocationState = { status: "success", coords: VARNA_COORDS };
    await renderScreen();

    expect(within(screen.getByLabelText("Filter by area")).getByText("Varna")).toBeOnTheScreen();
    expect(screen.getByText("Near you")).toBeOnTheScreen();
    expect(screen.getByText("Golden Sands")).toBeOnTheScreen();
    expect(screen.getByText("0 km away")).toBeOnTheScreen();
    // Sunny Beach is in Burgas, outside the Varna Detected Area, so it's filtered out.
    expect(screen.queryByText("Sunny Beach")).toBeNull();
  });

  it("shows a friendly empty state when the search matches nothing", async () => {
    mockBeachesState = { status: "success", data: [GOLDEN_SANDS, SUNNY_BEACH] };
    mockUserLocationState = { status: "unavailable" };
    await renderScreen();

    await fireEvent.changeText(screen.getByLabelText("Search beaches by name"), "Nowhere");

    expect(screen.getByText("No beaches match your search.")).toBeOnTheScreen();
  });

  it("filters by name via search", async () => {
    mockBeachesState = { status: "success", data: [GOLDEN_SANDS, SUNNY_BEACH] };
    mockUserLocationState = { status: "unavailable" };
    await renderScreen();

    await fireEvent.changeText(screen.getByLabelText("Search beaches by name"), "golden");

    expect(screen.getByText("Golden Sands")).toBeOnTheScreen();
    expect(screen.queryByText("Sunny Beach")).toBeNull();
  });

  it("narrows to a single flag color", async () => {
    mockBeachesState = { status: "success", data: [GOLDEN_SANDS, SUNNY_BEACH] };
    mockUserLocationState = { status: "unavailable" };
    await renderScreen();

    await press(screen.getByLabelText("Red flag"));

    expect(screen.getByText("Sunny Beach")).toBeOnTheScreen();
    expect(screen.queryByText("Golden Sands")).toBeNull();
  });

  it("navigates to Beach Detail when a card is tapped", async () => {
    mockBeachesState = { status: "success", data: [GOLDEN_SANDS, SUNNY_BEACH] };
    mockUserLocationState = { status: "unavailable" };
    await renderScreen();

    await press(screen.getByLabelText("Golden Sands"));

    expect(mockNavigate).toHaveBeenCalledWith("BeachDetail", {
      beachId: "golden-sands",
      name: "Golden Sands",
      quirkNotes: undefined,
      isUnguarded: false,
    });
  });
});
