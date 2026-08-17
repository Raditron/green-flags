import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Layout } from "./Layout";

// Layout only needs a handful of AuthContext fields to render its header (see
// EmailVerificationBanner/UserMenu, which also read useAuth directly) — mocking the module, as
// useReportFlag.test.ts does, skips standing up the full Firebase test harness.
const mockAuthState: {
  user: { email: string; displayName: string | null; emailVerified: boolean } | null;
  loading: boolean;
} = { user: null, loading: false };
vi.mock("../../auth/AuthContext", () => ({
  useAuth: () => ({
    ...mockAuthState,
    resendVerificationEmail: vi.fn(),
    logOut: vi.fn(),
  }),
}));

// Forces useIsCompactHeader (and, incidentally, ThemeContext's prefers-color-scheme read) to a
// known state rather than depending on jsdom's real (nonexistent) matchMedia support.
function mockMatchMedia(isCompact: boolean) {
  window.matchMedia = ((query: string) => ({
    media: query,
    matches: query.includes("max-width") ? isCompact : false,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

function renderLayout() {
  return render(
    <MemoryRouter>
      <Layout>page content</Layout>
    </MemoryRouter>,
  );
}

function getNavPillLabels() {
  const nav = screen.getByRole("navigation", { name: "Primary" });
  return within(nav).getAllByRole("link").map((link) => link.textContent);
}

describe("Layout header", () => {
  afterEach(() => {
    mockAuthState.user = null;
    mockAuthState.loading = false;
    // @ts-expect-error -- deliberately tearing down the test stub between cases
    delete window.matchMedia;
  });

  it("renders title, nav pills, and right controls as siblings in one row when wide", () => {
    mockMatchMedia(false);
    const { container } = renderLayout();

    const header = container.querySelector("header");
    expect(header?.children).toHaveLength(1);
    const row = header?.children[0] as Element;
    expect(row.children).toHaveLength(3);

    const nav = screen.getByRole("navigation", { name: "Primary" });
    const title = screen.getByRole("link", { name: /green flags/i });
    const themeToggle = screen.getByRole("button", { name: /switch to/i });

    expect(row.contains(nav)).toBe(true);
    expect(row.contains(title)).toBe(true);
    expect(row.contains(themeToggle)).toBe(true);
  });

  it("collapses into exactly two rows when compact, with the nav pills alone on row 2", () => {
    mockMatchMedia(true);
    const { container } = renderLayout();

    const header = container.querySelector("header");
    expect(header?.children).toHaveLength(2);
    const [row1, row2] = Array.from(header?.children ?? []);

    const nav = screen.getByRole("navigation", { name: "Primary" });
    const title = screen.getByRole("link", { name: /green flags/i });
    const themeToggle = screen.getByRole("button", { name: /switch to/i });

    // Row 2 stands alone: it holds the nav group and nothing else.
    expect(row2.children).toHaveLength(1);
    expect(row2.contains(nav)).toBe(true);

    // Row 1 holds title + right controls, but the nav group is not its descendant.
    expect(row1.contains(title)).toBe(true);
    expect(row1.contains(themeToggle)).toBe(true);
    expect(row1.contains(nav)).toBe(false);
  });

  it("never splits the nav pills from each other, and keeps their order, across layouts", () => {
    mockAuthState.user = { email: "diver@example.com", displayName: null, emailVerified: true };

    mockMatchMedia(false);
    const { unmount } = renderLayout();
    const widePills = getNavPillLabels();
    unmount();

    mockMatchMedia(true);
    renderLayout();
    const compactPills = getNavPillLabels();

    expect(widePills).toEqual(["All beaches", "Your beaches", "Today"]);
    expect(compactPills).toEqual(widePills);
  });

  it("keeps the signed-out pill set (no 'Your beaches') identical across layouts", () => {
    mockMatchMedia(false);
    const { unmount } = renderLayout();
    const widePills = getNavPillLabels();
    unmount();

    mockMatchMedia(true);
    renderLayout();
    const compactPills = getNavPillLabels();

    expect(widePills).toEqual(["All beaches", "Today"]);
    expect(compactPills).toEqual(widePills);
  });
});
