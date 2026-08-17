import { act, render, screen } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { press } from "../test/press";
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

// Presses the Pressable with the given accessibility label — a thin wrapper around the shared
// `press()` helper (see ../test/press.ts) for this file's label-driven Consumer.
async function pressLabel(label: string) {
  await press(screen.getByLabelText(label));
}

describe("ToastProvider / useToast", () => {
  it("show() renders the toast, and its close button dismisses it", async () => {
    await renderConsumer();

    await pressLabel("show");
    expect(await screen.findByText("Saved!")).toBeOnTheScreen();

    await pressLabel("Dismiss");
    expect(screen.queryByText("Saved!")).not.toBeOnTheScreen();
  });

  it("stacks multiple shown toasts independently", async () => {
    await renderConsumer();

    await pressLabel("show");
    await pressLabel("show-persistent");

    expect(screen.getByText("Saved!")).toBeOnTheScreen();
    expect(screen.getByText("Pending…")).toBeOnTheScreen();

    // Toast's AUTO_DISMISS_MS effect schedules a real 4s setTimeout for the "Saved!" (autoDismiss)
    // toast — clear it deterministically rather than leaving it to fire in the background during a
    // later test.
    await pressLabel("dismiss-first");
  });

  it("update() replaces a toast's content in place rather than adding a new one", async () => {
    await renderConsumer();

    await pressLabel("show"); // id 0, "Saved!"
    await pressLabel("update-first");

    expect(screen.getByText("Updated!")).toBeOnTheScreen();
    expect(screen.queryByText("Saved!")).not.toBeOnTheScreen();
    // Still one toast, not two — update() replaced it in place rather than appending.
    expect(screen.getAllByLabelText("Dismiss")).toHaveLength(1);

    // Same real-timer cleanup as above — the updated toast is still an autoDismiss one.
    await pressLabel("dismiss-first");
  });

  it("dismiss() removes a specific toast by id", async () => {
    await renderConsumer();

    await pressLabel("show"); // id 0
    await pressLabel("dismiss-first");

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

      await pressLabel("show");
      expect(screen.getByText("Saved!")).toBeOnTheScreen();

      await act(() => {
        jest.advanceTimersByTime(AUTO_DISMISS_MS);
      });

      expect(screen.queryByText("Saved!")).not.toBeOnTheScreen();
    });

    it("does not auto-dismiss a toast shown with autoDismiss: false", async () => {
      await renderConsumer();

      await pressLabel("show-persistent");
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
