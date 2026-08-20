import { renderHook, waitFor } from "@testing-library/react-native";
import type { User } from "firebase/auth";
import { useSavedBeachesList } from "./useSavedBeachesList";
import { fetchSavedBeaches } from "../../../saved/data/fetchSavedBeaches";
import type { Beach } from "../../../shared/types/Beach";

jest.mock("../../../saved/data/fetchSavedBeaches", () => ({
  fetchSavedBeaches: jest.fn(),
}));

function beach(id: string): Beach {
  return { id, name: id, lat: 43.2, long: 27.9, area: "Varna", isUnguarded: false };
}

const USER = { uid: "u1" } as unknown as User;

describe("useSavedBeachesList", () => {
  beforeEach(() => {
    jest.mocked(fetchSavedBeaches).mockReset();
  });

  it("stays loading (no fetch) when there's no user", async () => {
    const { result } = await renderHook(() => useSavedBeachesList(null));

    expect(result.current.status).toBe("loading");
    expect(fetchSavedBeaches).not.toHaveBeenCalled();
  });

  it("fetches the signed-in visitor's saved beaches and resolves to success", async () => {
    jest.mocked(fetchSavedBeaches).mockResolvedValue([beach("beach-a")]);
    const { result } = await renderHook(() => useSavedBeachesList(USER));

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current).toEqual({
      status: "success",
      data: [beach("beach-a")],
      refetch: expect.any(Function),
    });
    expect(fetchSavedBeaches).toHaveBeenCalledWith(USER);
  });

  it("resolves to an error state with the failure message on a rejected fetch", async () => {
    jest.mocked(fetchSavedBeaches).mockRejectedValue(new Error("network down"));
    const { result } = await renderHook(() => useSavedBeachesList(USER));

    await waitFor(() =>
      expect(result.current).toEqual({
        status: "error",
        message: "network down",
        refetch: expect.any(Function),
      }),
    );
  });

  it("does nothing on refetch() when there's no user", async () => {
    const { result } = await renderHook(() => useSavedBeachesList(null));

    result.current.refetch();

    expect(fetchSavedBeaches).not.toHaveBeenCalled();
  });

  it("refetches and reflects the new result", async () => {
    jest.mocked(fetchSavedBeaches).mockResolvedValueOnce([beach("beach-a")]);
    const { result } = await renderHook(() => useSavedBeachesList(USER));
    await waitFor(() => expect(result.current.status).toBe("success"));

    jest.mocked(fetchSavedBeaches).mockResolvedValueOnce([beach("beach-a"), beach("beach-b")]);
    result.current.refetch();

    await waitFor(() =>
      expect(result.current).toEqual({
        status: "success",
        data: [beach("beach-a"), beach("beach-b")],
        refetch: expect.any(Function),
      }),
    );
    expect(fetchSavedBeaches).toHaveBeenCalledTimes(2);
  });

  it("ignores a stale in-flight response once a newer refetch has started", async () => {
    let resolveStale!: (beaches: Beach[]) => void;
    jest.mocked(fetchSavedBeaches).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveStale = resolve;
      }),
    );
    const { result } = await renderHook(() => useSavedBeachesList(USER));
    expect(result.current.status).toBe("loading");

    jest.mocked(fetchSavedBeaches).mockResolvedValueOnce([beach("beach-fresh")]);
    result.current.refetch();
    await waitFor(() => expect(result.current.status).toBe("success"));

    // The mount fetch (still in flight) resolving after the refetch already landed must not
    // clobber the newer result.
    resolveStale([beach("beach-stale")]);

    expect(result.current).toEqual({
      status: "success",
      data: [beach("beach-fresh")],
      refetch: expect.any(Function),
    });
  });
});
