import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { BeachDetail } from "./BeachDetail";
import { getBeachImage } from "../../shared/data/images";

// Thin rendering test: mock the data-fetching hooks and toast context so this
// stays isolated from network calls and focuses on the hero image sourcing.
vi.mock("./hooks/useBeach", () => ({
  useBeach: () => ({
    name: "Varna Central Beach",
    mapImageDataUrl: undefined,
    quirkNotes: undefined,
    isUnguarded: false,
  }),
}));
vi.mock("./hooks/usePredictions", () => ({
  usePredictions: () => ({ status: "loading" }) as const,
}));
vi.mock("../Layout/Toast/ToastContext", () => ({
  useToast: () => ({ show: vi.fn(), dismiss: vi.fn() }),
}));
vi.mock("../SaveBeachButton/SaveBeachButton", () => ({
  SaveBeachButton: () => null,
}));
vi.mock("./CommentSection/CommentSection", () => ({
  CommentSection: () => null,
}));

function renderDetail(beachId: string) {
  const { container } = render(
    <MemoryRouter initialEntries={[`/beaches/${beachId}`]}>
      <Routes>
        <Route path="/beaches/:beachId" element={<BeachDetail />} />
      </Routes>
    </MemoryRouter>,
  );
  return container.querySelector("img");
}

describe("BeachDetail", () => {
  it("renders the hero-sized image variant (not the card-sized one) without lazy-loading", () => {
    const image = renderDetail("varna-central-beach");
    const descriptor = getBeachImage("varna-central-beach");

    expect(descriptor).toBeDefined();
    expect(image).toHaveAttribute("src", descriptor?.hero.src);
    expect(image).toHaveAttribute("width", String(descriptor?.hero.width));
    expect(image).toHaveAttribute("height", String(descriptor?.hero.height));
    expect(image).not.toHaveAttribute("loading");
    expect(image).toHaveAttribute("alt", "");
  });

  it("falls back to the generic icon when the beach has no curated photo or map-pin image", () => {
    const image = renderDetail("not-a-real-beach");
    expect(image).not.toBeInTheDocument();
  });

  it("selecting a future Forecast Strip chip swaps Timeline for Day Outlook, and reselecting Today reverts", async () => {
    const user = userEvent.setup();
    renderDetail("varna-central-beach");

    // Today starts selected: the page's own (Timeline) loading copy shows, not Day Outlook's.
    expect(screen.getByText("Loading predictions…")).toBeInTheDocument();
    expect(screen.queryByText("Loading forecast…")).not.toBeInTheDocument();

    // Chip 0 is Today; click the next chip, a future date, to swap in Day Outlook.
    const chips = screen.getAllByRole("button", { name: /loading forecast/ });
    await user.click(chips[1]);

    expect(screen.getByText("Loading forecast…")).toBeInTheDocument();
    expect(screen.queryByText("Loading predictions…")).not.toBeInTheDocument();

    // Selecting Today again reverts to the original Timeline area, unchanged.
    await user.click(screen.getByRole("button", { name: "Today: loading forecast" }));

    expect(screen.getByText("Loading predictions…")).toBeInTheDocument();
    expect(screen.queryByText("Loading forecast…")).not.toBeInTheDocument();
  });
});
