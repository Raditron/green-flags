import { render, screen } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import { press } from "../test/press";
import { SavedBeachesProvider, useSavedBeaches } from "./SavedBeachesContext";

const mockFetchSavedBeaches = jest.fn();
const mockSaveBeach = jest.fn();
const mockUnsaveBeach = jest.fn();

jest.mock("./data/fetchSavedBeaches", () => ({
  fetchSavedBeaches: (...args: unknown[]) => mockFetchSavedBeaches(...args),
}));
jest.mock("./data/saveBeach", () => ({
  saveBeach: (...args: unknown[]) => mockSaveBeach(...args),
}));
jest.mock("./data/unsaveBeach", () => ({
  unsaveBeach: (...args: unknown[]) => mockUnsaveBeach(...args),
}));

let mockAuthValue: { user: { uid: string } | null };

// Mirrors the auth seam used throughout the auth module — mock AuthContext wholesale rather than
// standing up a real Firebase session (see EmailVerificationBanner.test.tsx).
jest.mock("../auth/AuthContext", () => ({
  useAuth: () => mockAuthValue,
}));

function Consumer({ beachId }: { beachId: string }) {
  const { isSaved, toggleSave, isReady } = useSavedBeaches();
  return (
    <>
      <Text>ready:{String(isReady)}</Text>
      <Text>saved:{String(isSaved(beachId))}</Text>
      <Pressable onPress={() => toggleSave(beachId)} accessibilityRole="button" accessibilityLabel="toggle">
        <Text>toggle</Text>
      </Pressable>
    </>
  );
}

function renderConsumer(beachId = "beach-a") {
  return render(
    <SavedBeachesProvider>
      <Consumer beachId={beachId} />
    </SavedBeachesProvider>,
  );
}

beforeEach(() => {
  mockFetchSavedBeaches.mockReset();
  mockSaveBeach.mockReset();
  mockUnsaveBeach.mockReset();
});

describe("SavedBeachesProvider", () => {
  it("starts unsaved and ready with no fetch when signed out", async () => {
    mockAuthValue = { user: null };
    await renderConsumer();

    expect(await screen.findByText("ready:true")).toBeOnTheScreen();
    expect(screen.getByText("saved:false")).toBeOnTheScreen();
    expect(mockFetchSavedBeaches).not.toHaveBeenCalled();
  });

  it("fetches the signed-in visitor's saved ids and reports isSaved from them", async () => {
    mockAuthValue = { user: { uid: "u1" } };
    mockFetchSavedBeaches.mockResolvedValue([{ id: "beach-a" }, { id: "beach-b" }]);

    await renderConsumer("beach-a");

    expect(await screen.findByText("ready:true")).toBeOnTheScreen();
    expect(screen.getByText("saved:true")).toBeOnTheScreen();
  });

  it("becomes ready with nothing saved when the fetch fails", async () => {
    mockAuthValue = { user: { uid: "u1" } };
    mockFetchSavedBeaches.mockRejectedValue(new Error("network error"));

    await renderConsumer("beach-a");

    expect(await screen.findByText("ready:true")).toBeOnTheScreen();
    expect(screen.getByText("saved:false")).toBeOnTheScreen();
  });

  it("toggling flips saved state immediately (optimistic) and fires saveBeach", async () => {
    mockAuthValue = { user: { uid: "u1" } };
    mockFetchSavedBeaches.mockResolvedValue([]);
    mockSaveBeach.mockResolvedValue(undefined);
    await renderConsumer("beach-a");
    await screen.findByText("ready:true");

    await press(screen.getByLabelText("toggle"));

    expect(screen.getByText("saved:true")).toBeOnTheScreen();
    expect(mockSaveBeach).toHaveBeenCalledWith("beach-a", { uid: "u1" });
  });

  it("toggling an already-saved beach fires unsaveBeach and flips it back to unsaved", async () => {
    mockAuthValue = { user: { uid: "u1" } };
    mockFetchSavedBeaches.mockResolvedValue([{ id: "beach-a" }]);
    mockUnsaveBeach.mockResolvedValue(undefined);
    await renderConsumer("beach-a");
    await screen.findByText("saved:true");

    await press(screen.getByLabelText("toggle"));

    expect(screen.getByText("saved:false")).toBeOnTheScreen();
    expect(mockUnsaveBeach).toHaveBeenCalledWith("beach-a", { uid: "u1" });
  });

  it("reverts the optimistic toggle back to its prior state when the request fails", async () => {
    mockAuthValue = { user: { uid: "u1" } };
    mockFetchSavedBeaches.mockResolvedValue([]);
    mockSaveBeach.mockRejectedValue(new Error("network error"));
    await renderConsumer("beach-a");
    await screen.findByText("ready:true");

    await press(screen.getByLabelText("toggle"));

    // The optimistic flip and its revert both settle within the same awaited press (the mock
    // rejection resolves on the same microtask queue RNTL's press already flushes), so only the
    // final, reverted state is observable here — see the analogous saveBeach.catch in the class
    // doc above for why a failed request can never leave the final state wrong.
    expect(await screen.findByText("saved:false")).toBeOnTheScreen();
  });

  it("throws when useSavedBeaches is called outside a SavedBeachesProvider", async () => {
    function Bare() {
      useSavedBeaches();
      return null;
    }
    await expect(render(<Bare />)).rejects.toThrow(
      "useSavedBeaches must be used within a SavedBeachesProvider",
    );
  });
});
