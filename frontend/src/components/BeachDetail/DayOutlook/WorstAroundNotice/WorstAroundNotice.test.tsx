import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorstAroundNotice } from "./WorstAroundNotice";

describe("WorstAroundNotice", () => {
  it("renders the zero-padded hour as a status region", () => {
    render(<WorstAroundNotice hour={9} />);

    expect(screen.getByRole("status")).toHaveTextContent("Worst around 09:00");
  });
});
