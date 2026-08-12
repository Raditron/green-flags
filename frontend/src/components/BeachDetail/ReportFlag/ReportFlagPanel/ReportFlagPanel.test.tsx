import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReportFlagPanel } from "./ReportFlagPanel";

describe("ReportFlagPanel", () => {
  it("renders the flag picker", () => {
    render(<ReportFlagPanel submitting={false} onPick={vi.fn()} />);

    expect(screen.getByText("What color is the flag right now?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Green/ })).toBeInTheDocument();
  });

  it("calls onPick with the chosen color", async () => {
    const onPick = vi.fn();
    const user = userEvent.setup();
    render(<ReportFlagPanel submitting={false} onPick={onPick} />);

    await user.click(screen.getByRole("button", { name: /Red/ }));

    expect(onPick).toHaveBeenCalledWith("red");
  });

  it("disables the picker while submitting", () => {
    render(<ReportFlagPanel submitting={true} onPick={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Green/ })).toBeDisabled();
  });

  it("shows the submission error above the picker", () => {
    render(<ReportFlagPanel submitting={false} error="Could not submit report" onPick={vi.fn()} />);
    expect(screen.getByText("Could not submit report")).toBeInTheDocument();
  });
});
