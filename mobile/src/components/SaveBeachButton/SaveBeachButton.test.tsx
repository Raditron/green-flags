import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { press } from "../../test/press";
import { TEST_SAFE_AREA_METRICS } from "../../test/safeAreaMetrics";
import { ThemeProvider } from "../../theme/ThemeContext";
import { SaveBeachButton } from "./SaveBeachButton";

const mockIsSaved = jest.fn();
const mockToggleSave = jest.fn();
let mockAuthValue: { user: { uid: string } | null };

// Mirrors the auth/context-mocking seam used throughout mobile (EmailVerificationBanner,
// AccountControl): mock both context modules wholesale rather than standing up real providers.
jest.mock("../../auth/AuthContext", () => ({
  useAuth: () => mockAuthValue,
}));
jest.mock("../../saved/SavedBeachesContext", () => ({
  useSavedBeaches: () => ({ isSaved: mockIsSaved, toggleSave: mockToggleSave, isReady: true }),
}));

function renderButton(onToggle?: (saved: boolean) => void) {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — callers must await it.
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
      <ThemeProvider>
        <SaveBeachButton beachId="beach-a" onToggle={onToggle} />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  mockIsSaved.mockReset();
  mockToggleSave.mockReset();
});

describe("SaveBeachButton", () => {
  it("renders an outline star, labelled 'Save beach', when unsaved", async () => {
    mockAuthValue = { user: { uid: "u1" } };
    mockIsSaved.mockReturnValue(false);
    await renderButton();

    expect(screen.getByLabelText("Save beach")).toBeOnTheScreen();
  });

  it("renders a filled star, labelled 'Unsave beach', when saved", async () => {
    mockAuthValue = { user: { uid: "u1" } };
    mockIsSaved.mockReturnValue(true);
    await renderButton();

    expect(screen.getByLabelText("Unsave beach")).toBeOnTheScreen();
  });

  it("always shows unsaved when signed out, regardless of the context's isSaved", async () => {
    mockAuthValue = { user: null };
    mockIsSaved.mockReturnValue(true);
    await renderButton();

    expect(screen.getByLabelText("Save beach")).toBeOnTheScreen();
  });

  it("tapping while signed in toggles the save and reports the new state via onToggle", async () => {
    mockAuthValue = { user: { uid: "u1" } };
    mockIsSaved.mockReturnValue(false);
    const onToggle = jest.fn();
    await renderButton(onToggle);

    await press(screen.getByLabelText("Save beach"));

    expect(mockToggleSave).toHaveBeenCalledWith("beach-a");
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it("tapping an already-saved beach reports onToggle(false)", async () => {
    mockAuthValue = { user: { uid: "u1" } };
    mockIsSaved.mockReturnValue(true);
    const onToggle = jest.fn();
    await renderButton(onToggle);

    await press(screen.getByLabelText("Unsave beach"));

    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it("tapping while signed out opens the sign-in screen instead of toggling", async () => {
    mockAuthValue = { user: null };
    mockIsSaved.mockReturnValue(false);
    await renderButton();

    await press(screen.getByLabelText("Save beach"));

    expect(mockToggleSave).not.toHaveBeenCalled();
    expect(await screen.findByLabelText("Email")).toBeOnTheScreen();
  });
});
