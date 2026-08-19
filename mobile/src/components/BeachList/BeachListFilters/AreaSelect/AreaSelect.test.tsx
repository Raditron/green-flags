import { render, screen } from "@testing-library/react-native";
import { press } from "../../../../test/press";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { AreaSelect } from "./AreaSelect";
import type { SelectedArea } from "../../hooks/useBeachFilters";

function renderSelect(value: SelectedArea, onChange: (area: SelectedArea) => void = jest.fn()) {
  // RNTL v14's `render` is async (it wraps the initial render in `act`) — callers must await it.
  return render(
    <ThemeProvider>
      <AreaSelect value={value} onChange={onChange} />
    </ThemeProvider>,
  );
}

describe("AreaSelect", () => {
  it("shows 'All Areas' as the trigger label when value is 'all'", async () => {
    await renderSelect("all");

    expect(screen.getByLabelText("Filter by area")).toBeOnTheScreen();
    expect(screen.getByText("All Areas")).toBeOnTheScreen();
  });

  it("shows the selected Area's name as the trigger label", async () => {
    await renderSelect("Varna");

    expect(screen.getByText("Varna")).toBeOnTheScreen();
  });

  it("opens a picker listing every Area plus All Areas, and calls onChange with the tapped Area", async () => {
    const onChange = jest.fn();
    await renderSelect("all", onChange);

    await press(screen.getByLabelText("Filter by area"));

    expect(screen.getByText("Burgas")).toBeOnTheScreen();
    await press(screen.getByText("Burgas"));

    expect(onChange).toHaveBeenCalledWith("Burgas");
  });
});
