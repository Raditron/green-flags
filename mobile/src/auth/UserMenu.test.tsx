import { render, screen } from "@testing-library/react-native";
import { press } from "../test/press";
import { ThemeProvider } from "../theme/ThemeContext";
import { UserMenu } from "./UserMenu";

const mockLogOut = jest.fn();

// Mirrors frontend's UserMenu.test.tsx: mock the AuthContext module wholesale rather than
// standing up a full Firebase test harness — UserMenu only needs `logOut` off useAuth.
jest.mock("./AuthContext", () => ({
  useAuth: () => ({ logOut: mockLogOut }),
}));

function renderMenu(props: { email: string; displayName: string }) {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — callers must await it.
  return render(
    <ThemeProvider>
      <UserMenu {...props} />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  mockLogOut.mockReset();
});

describe("UserMenu", () => {
  it("uses the displayName initial when displayName is present", async () => {
    // Deliberately mismatched initials (Z vs d) so this fails if the component still derives
    // the initial from email instead of displayName.
    await renderMenu({ email: "diver@example.com", displayName: "Zack" });

    expect(screen.getByRole("button", { name: "Account menu" })).toHaveTextContent("Z");
  });

  it("falls back to the email initial when displayName is empty", async () => {
    await renderMenu({ email: "diver@example.com", displayName: "" });

    expect(screen.getByRole("button", { name: "Account menu" })).toHaveTextContent("D");
  });

  it('falls back to "?" when both displayName and email are empty', async () => {
    await renderMenu({ email: "", displayName: "" });

    expect(screen.getByRole("button", { name: "Account menu" })).toHaveTextContent("?");
  });

  it("opens the menu on press, logs out and closes on Log out", async () => {
    await renderMenu({ email: "diver@example.com", displayName: "Zack" });

    await press(screen.getByRole("button", { name: "Account menu" }));
    const logOutItem = await screen.findByText("Log out");
    expect(logOutItem).toBeOnTheScreen();

    await press(logOutItem);

    expect(mockLogOut).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Log out")).toBeNull();
  });

  it("dismisses the menu when tapping outside it", async () => {
    await renderMenu({ email: "diver@example.com", displayName: "Zack" });

    await press(screen.getByRole("button", { name: "Account menu" }));
    await screen.findByText("Log out");

    await press(screen.getByLabelText("Close account menu"));

    expect(screen.queryByText("Log out")).toBeNull();
  });
});
