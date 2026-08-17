import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../theme/ThemeContext";
import { AUTO_DISMISS_MS } from "./Toast";
import { ToastProvider, useToast } from "./ToastContext";

const TEST_METRICS = {
  frame: { x: 0, y: 0, width: 320, height: 640 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function Consumer() {
  const { show, update, dismiss } = useToast();
  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel="show" onPress={() => show("Saved!")}>
        <Text>show</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="show-persistent"
        onPress={() => show("Pending…", { autoDismiss: false })}
      >
        <Text>show-persistent</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="update-first"
        onPress={() => update(0, "Updated!")}
      >
        <Text>update-first</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="dismiss-first" onPress={() => dismiss(0)}>
        <Text>dismiss-first</Text>
      </Pressable>
    </>
  );
}

// RNTL v14's `render` is async — every call site must await it before `screen` is populated.
function renderConsumer() {
  return render(
    <SafeAreaProvider initialMetrics={TEST_METRICS}>
      <ThemeProvider>
        <ToastProvider>
          <Consumer />
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

// RNTL's `fireEvent.press` and `act` are both async under the hood (they always wrap in an async
// function internally, even for a synchronous callback) — every call site must be awaited, or the
// next statement runs before the state update/effect flush they triggered has actually landed.
async function press(label: string) {
  await fireEvent.press(screen.getByLabelText(label));
}

describe("ToastProvider / useToast", () => {
  it("show() renders the toast, and its close button dismisses it", async () => {
    await renderConsumer();

    await press("show");
    expect(await screen.findByText("Saved!")).toBeOnTheScreen();

    await press("Dismiss");
    expect(screen.queryByText("Saved!")).not.toBeOnTheScreen();
  });

  it("stacks multiple shown toasts independently", async () => {
    await renderConsumer();

    await press("show");
    await press("show-persistent");

    expect(screen.getByText("Saved!")).toBeOnTheScreen();
    expect(screen.getByText("Pending…")).toBeOnTheScreen();

    // Toast's AUTO_DISMISS_MS effect schedules a real 4s setTimeout for the "Saved!" (autoDismiss)
    // toast — clear it deterministically rather than leaving it to fire in the background during a
    // later test.
    await press("dismiss-first");
  });

  it("update() replaces a toast's content in place rather than adding a new one", async () => {
    await renderConsumer();

    await press("show"); // id 0, "Saved!"
    await press("update-first");

    expect(screen.getByText("Updated!")).toBeOnTheScreen();
    expect(screen.queryByText("Saved!")).not.toBeOnTheScreen();
    // Still one toast, not two — update() replaced it in place rather than appending.
    expect(screen.getAllByLabelText("Dismiss")).toHaveLength(1);

    // Same real-timer cleanup as above — the updated toast is still an autoDismiss one.
    await press("dismiss-first");
  });

  it("dismiss() removes a specific toast by id", async () => {
    await renderConsumer();

    await press("show"); // id 0
    await press("dismiss-first");

    expect(screen.queryByText("Saved!")).not.toBeOnTheScreen();
  });

  describe("with fake timers", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    // Always restored, even if an assertion above throws — leaking fake timers into the next
    // test (which expects real ones, e.g. relies on findByText's real-time polling) breaks it.
    afterEach(() => {
      jest.useRealTimers();
    });

    it("auto-dismisses a toast after AUTO_DISMISS_MS", async () => {
      await renderConsumer();

      await press("show");
      expect(screen.getByText("Saved!")).toBeOnTheScreen();

      await act(() => {
        jest.advanceTimersByTime(AUTO_DISMISS_MS);
      });

      expect(screen.queryByText("Saved!")).not.toBeOnTheScreen();
    });

    it("does not auto-dismiss a toast shown with autoDismiss: false", async () => {
      await renderConsumer();

      await press("show-persistent");
      expect(screen.getByText("Pending…")).toBeOnTheScreen();

      await act(() => {
        jest.advanceTimersByTime(AUTO_DISMISS_MS * 2);
      });

      expect(screen.getByText("Pending…")).toBeOnTheScreen();
    });
  });

  it("throws when useToast is called outside a ToastProvider", async () => {
    function Bare() {
      useToast();
      return null;
    }
    await expect(render(<Bare />)).rejects.toThrow("useToast must be used within a ToastProvider");
  });
});
