import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { press } from "../../test/press";
import { TEST_SAFE_AREA_METRICS } from "../../test/safeAreaMetrics";
import { ThemeProvider } from "../../theme/ThemeContext";
import { SavedBeaches } from "./SavedBeaches";
import type { SavedBeachesListState } from "./hooks/useSavedBeachesList";
import type { Beach } from "../../shared/types/Beach";
import type { SavedTabScreenProps } from "../../navigation/interfaces";

let mockAuthValue: { user: { uid: string } | null; loading: boolean };
let mockSavedBeachesListState: SavedBeachesListState;
const mockRefetch = jest.fn();

jest.mock("../../auth/AuthContext", () => ({
  useAuth: () => mockAuthValue,
}));

// Mirrors BeachList.test.tsx's seam: mock the colocated data hook wholesale rather than the
// network, per #100's "component-level test mocking the colocated hook" acceptance criterion.
jest.mock("./hooks/useSavedBeachesList", () => ({
  useSavedBeachesList: () => ({ ...mockSavedBeachesListState, refetch: mockRefetch }),
}));

// SavedBeachesGrid (rendered for real below) and each card's SaveBeachButton both read this
// context too — mocked here the same way SavedBeachesGrid.test.tsx does, so isSaved/isReady drive
// what actually renders through the grid rather than duplicating a real SavedBeachesProvider.
jest.mock("../../saved/SavedBeachesContext", () => ({
  useSavedBeaches: () => ({ isSaved: () => true, toggleSave: jest.fn(), isReady: true }),
}));

const mockNavigate = jest.fn();
let focusListener: (() => void) | undefined;
const mockAddListener = jest.fn((event: string, callback: () => void) => {
  if (event === "focus") focusListener = callback;
  return jest.fn(); // unsubscribe
});

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

function renderScreen() {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — callers must await it.
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
      <ThemeProvider>
        <SavedBeaches
          navigation={
            { navigate: mockNavigate, addListener: mockAddListener } as unknown as SavedTabScreenProps["navigation"]
          }
          route={{} as SavedTabScreenProps["route"]}
        />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  mockNavigate.mockReset();
  mockAddListener.mockClear();
  mockRefetch.mockReset();
  focusListener = undefined;
});

describe("SavedBeaches", () => {
  it("prompts a signed-out visitor to sign in, without a crash or an empty-grid message", async () => {
    mockAuthValue = { user: null, loading: false };
    mockSavedBeachesListState = { status: "loading" };
    await renderScreen();

    expect(await screen.findByText("Sign in to see your saved beaches")).toBeOnTheScreen();
    expect(screen.queryByText(/haven't saved any beaches yet/)).toBeNull();
  });

  it("opens the sign-in screen when the signed-out prompt's button is pressed", async () => {
    mockAuthValue = { user: null, loading: false };
    mockSavedBeachesListState = { status: "loading" };
    await renderScreen();

    await press(screen.getByLabelText("Sign in"));

    expect(await screen.findByLabelText("Email")).toBeOnTheScreen();
  });

  it("shows a loading message while auth is still resolving, not the sign-in prompt", async () => {
    mockAuthValue = { user: null, loading: true };
    mockSavedBeachesListState = { status: "loading" };
    await renderScreen();

    expect(screen.getByText("Loading…")).toBeOnTheScreen();
    expect(screen.queryByText("Sign in to see your saved beaches")).toBeNull();
  });

  it("shows a loading message while the saved list is fetching for a signed-in visitor", async () => {
    mockAuthValue = { user: { uid: "u1" }, loading: false };
    mockSavedBeachesListState = { status: "loading" };
    await renderScreen();

    expect(screen.getByText("Loading saved beaches…")).toBeOnTheScreen();
  });

  it("shows an error message when the saved list fails to load", async () => {
    mockAuthValue = { user: { uid: "u1" }, loading: false };
    mockSavedBeachesListState = { status: "error", message: "Saved beaches request failed with status 503" };
    await renderScreen();

    expect(
      screen.getByText("Could not load saved beaches: Saved beaches request failed with status 503"),
    ).toBeOnTheScreen();
  });

  it("renders the grid of saved beaches for a signed-in visitor", async () => {
    mockAuthValue = { user: { uid: "u1" }, loading: false };
    mockSavedBeachesListState = { status: "success", data: [GOLDEN_SANDS] };
    await renderScreen();

    expect(screen.getByText("Golden Sands")).toBeOnTheScreen();
  });

  it("refetches the saved list when the Saved tab regains focus", async () => {
    mockAuthValue = { user: { uid: "u1" }, loading: false };
    mockSavedBeachesListState = { status: "success", data: [GOLDEN_SANDS] };
    await renderScreen();

    expect(mockAddListener).toHaveBeenCalledWith("focus", expect.any(Function));
    expect(mockRefetch).not.toHaveBeenCalled();

    focusListener?.();

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("navigates to Beach Detail when a card in the grid is tapped", async () => {
    mockAuthValue = { user: { uid: "u1" }, loading: false };
    mockSavedBeachesListState = { status: "success", data: [GOLDEN_SANDS] };
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
