import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UserMenu } from "./UserMenu";

// UserMenu only needs `logOut` off useAuth — mocking the module directly (as
// useReportFlag.test.ts does) skips standing up the full Firebase test harness that
// AuthModal.test.tsx / CommentSection.test.tsx need for sign-in flows.
vi.mock("../../../auth/AuthContext", () => ({
  useAuth: () => ({ logOut: vi.fn() }),
}));

describe("UserMenu", () => {
  it("uses the displayName initial when displayName is present", () => {
    // Deliberately mismatched initials (Z vs d) so this fails if the component still
    // derives the initial from email instead of displayName.
    render(<UserMenu email="diver@example.com" displayName="Zack" />);
    expect(screen.getByRole("button", { name: "Account menu" })).toHaveTextContent("Z");
  });

  it("falls back to the email initial when displayName is empty", () => {
    render(<UserMenu email="diver@example.com" displayName="" />);
    expect(screen.getByRole("button", { name: "Account menu" })).toHaveTextContent("D");
  });

  it("falls back to \"?\" when both displayName and email are empty", () => {
    render(<UserMenu email="" displayName="" />);
    expect(screen.getByRole("button", { name: "Account menu" })).toHaveTextContent("?");
  });
});
