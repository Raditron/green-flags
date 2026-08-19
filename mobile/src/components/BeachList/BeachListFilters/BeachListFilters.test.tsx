import { fireEvent, render, screen } from "@testing-library/react-native";
import { press } from "../../../test/press";
import { ThemeProvider } from "../../../theme/ThemeContext";
import { BeachListFilters } from "./BeachListFilters";
import type { BeachListFiltersProps } from "./interfaces";

function renderFilters(overrides: Partial<BeachListFiltersProps> = {}) {
  const props: BeachListFiltersProps = {
    searchQuery: "",
    onSearchChange: jest.fn(),
    selectedFlag: null,
    onSelectFlag: jest.fn(),
    selectedArea: "all",
    onAreaChange: jest.fn(),
    isAreaAutoDetected: false,
    onClearFilters: jest.fn(),
    ...overrides,
  };
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — callers must await it.
  return render(
    <ThemeProvider>
      <BeachListFilters {...props} />
    </ThemeProvider>,
  );
}

describe("BeachListFilters", () => {
  it("calls onSearchChange as the visitor types", async () => {
    const onSearchChange = jest.fn();
    await renderFilters({ onSearchChange });

    fireEvent.changeText(screen.getByLabelText("Search beaches by name"), "Golden");

    expect(onSearchChange).toHaveBeenCalledWith("Golden");
  });

  it("shows the 'Near you' hint only when the Area was auto-detected", async () => {
    await renderFilters({ isAreaAutoDetected: false });
    expect(screen.queryByText("Near you")).toBeNull();
  });

  it("shows the 'Near you' hint when the Area was auto-detected", async () => {
    await renderFilters({ isAreaAutoDetected: true });
    expect(screen.getByText("Near you")).toBeOnTheScreen();
  });

  it("selects a flag color on tap", async () => {
    const onSelectFlag = jest.fn();
    await renderFilters({ onSelectFlag });

    await press(screen.getByLabelText("Green flag"));

    expect(onSelectFlag).toHaveBeenCalledWith("green");
  });

  it("clears the already-selected flag back to null on a second tap", async () => {
    const onSelectFlag = jest.fn();
    await renderFilters({ selectedFlag: "green", onSelectFlag });

    await press(screen.getByLabelText("Green flag"));

    expect(onSelectFlag).toHaveBeenCalledWith(null);
  });

  it("calls onClearFilters when 'Clear filters' is tapped", async () => {
    const onClearFilters = jest.fn();
    await renderFilters({ onClearFilters });

    await press(screen.getByLabelText("Clear filters"));

    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });
});
