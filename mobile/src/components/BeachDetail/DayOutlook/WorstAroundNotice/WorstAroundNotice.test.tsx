import { render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { WorstAroundNotice } from "./WorstAroundNotice";

describe("WorstAroundNotice", () => {
  it("renders the zero-padded hour", async () => {
    await render(
      <ThemeProvider>
        <WorstAroundNotice hour={9} />
      </ThemeProvider>,
    );

    expect(screen.getByText("Worst around 09:00")).toBeOnTheScreen();
  });
});
