import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { press } from "../test/press";
import { TEST_SAFE_AREA_METRICS } from "../test/safeAreaMetrics";
import { ThemeProvider } from "../theme/ThemeContext";
import { EmailVerificationBanner } from "./EmailVerificationBanner";

const mockResendVerificationEmail = jest.fn();
let mockAuthState: { user: { emailVerified: boolean } | null; loading: boolean };

// Mirrors frontend's UserMenu.test.tsx precedent: mock the AuthContext module wholesale (the
// established "hooks" seam for auth-aware components — see #94's testing decisions) instead of
// standing up a full Firebase test harness.
jest.mock("./AuthContext", () => ({
  useAuth: () => ({
    ...mockAuthState,
    resendVerificationEmail: mockResendVerificationEmail,
  }),
}));

function renderBanner() {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — callers must await it.
  return render(
    <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>
      <ThemeProvider>
        <EmailVerificationBanner />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  mockResendVerificationEmail.mockReset();
  mockAuthState = { user: { emailVerified: false }, loading: false };
});

describe("EmailVerificationBanner", () => {
  it("renders nothing while auth is still loading", async () => {
    mockAuthState = { user: null, loading: true };
    await renderBanner();

    expect(screen.queryByText(/Email not verified/)).toBeNull();
  });

  it("renders nothing when signed out", async () => {
    mockAuthState = { user: null, loading: false };
    await renderBanner();

    expect(screen.queryByText(/Email not verified/)).toBeNull();
  });

  it("renders nothing once the user is verified", async () => {
    mockAuthState = { user: { emailVerified: true }, loading: false };
    await renderBanner();

    expect(screen.queryByText(/Email not verified/)).toBeNull();
  });

  it("prompts an unverified user to verify, and resends on press", async () => {
    mockResendVerificationEmail.mockResolvedValue(undefined);
    await renderBanner();

    expect(screen.getByText(/Email not verified/)).toBeOnTheScreen();

    await press(screen.getByText("Resend verification email"));

    expect(mockResendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Verification email sent")).toBeOnTheScreen();
  });

  it("shows an error message if resending fails", async () => {
    mockResendVerificationEmail.mockRejectedValue(new Error("network error"));
    await renderBanner();

    await press(screen.getByText("Resend verification email"));

    expect(await screen.findByText(/Could not send email/)).toBeOnTheScreen();
  });
});
