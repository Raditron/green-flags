import { render } from "@testing-library/react";
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
  useToast: () => ({ show: vi.fn() }),
}));
vi.mock("../SaveBeachButton/SaveBeachButton", () => ({
  SaveBeachButton: () => null,
}));
vi.mock("./ReportFlagButton/ReportFlagButton", () => ({
  ReportFlagButton: () => null,
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
});
