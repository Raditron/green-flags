import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { BeachListCard } from "./BeachListCard";
import type { BeachWithDistance } from "../../../shared/types/Beach";
import { getBeachImage } from "../../../shared/data/images";

// Keep this a thin rendering test focused on image sourcing/loading: stub out
// the save button so the test doesn't need real auth/saved-beaches context.
vi.mock("../../SaveBeachButton/SaveBeachButton", () => ({
  SaveBeachButton: () => null,
}));

function renderCard(beach: BeachWithDistance) {
  // The rendered <img> is decorative (alt=""), which removes it from the
  // accessibility tree — query the DOM directly rather than via role.
  const { container } = render(
    <MemoryRouter>
      <ul>
        <BeachListCard beach={beach} />
      </ul>
    </MemoryRouter>,
  );
  return container.querySelector("img");
}

const baseBeach: BeachWithDistance = {
  id: "varna-central-beach",
  name: "Varna Central Beach",
  lat: 43.2,
  long: 27.9,
  area: "Varna",
  isUnguarded: false,
};

describe("BeachListCard", () => {
  it("renders the card-sized image variant with native lazy-loading for a beach with a curated photo", () => {
    const image = renderCard(baseBeach);
    const descriptor = getBeachImage(baseBeach.id);

    expect(descriptor).toBeDefined();
    expect(image).toHaveAttribute("src", descriptor?.card.src);
    expect(image).toHaveAttribute("loading", "lazy");
    expect(image).toHaveAttribute("width", String(descriptor?.card.width));
    expect(image).toHaveAttribute("height", String(descriptor?.card.height));
    expect(image).toHaveAttribute("alt", "");
  });

  it("falls back to the map-pin image when no curated photo exists for the beach id", () => {
    const image = renderCard({
      ...baseBeach,
      id: "not-a-real-beach",
      mapImageDataUrl: "data:image/png;base64,abc",
    });

    expect(image).toHaveAttribute("src", "data:image/png;base64,abc");
  });

  it("renders the generic icon chip when neither a curated photo nor a map-pin image exists", () => {
    const image = renderCard({ ...baseBeach, id: "not-a-real-beach", mapImageDataUrl: undefined });

    expect(image).not.toBeInTheDocument();
  });
});
