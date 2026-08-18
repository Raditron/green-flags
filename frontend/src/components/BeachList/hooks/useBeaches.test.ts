import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBeaches } from "./useBeaches";
import { fetchBeaches } from "../data/fetchBeaches";
import type { Beach } from "../../../shared/types/Beach";

vi.mock("../data/fetchBeaches", async () => {
  const actual = await vi.importActual<typeof import("../data/fetchBeaches")>("../data/fetchBeaches");
  return { ...actual, fetchBeaches: vi.fn() };
});

function beach(id: string): Beach {
  return { id, name: id, lat: 0, long: 0, area: "Varna", isUnguarded: false };
}

describe("useBeaches", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(fetchBeaches).mockReset();
  });

  it("renders loading then success when there is no cached entry yet", async () => {
    vi.mocked(fetchBeaches).mockResolvedValue({ beaches: [beach("beach-a")] });
    const { result } = renderHook(() => useBeaches());

    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current).toMatchObject({ status: "success", data: [beach("beach-a")], refreshing: false });
  });

  it("renders cached data immediately as refreshing, then drops refreshing once the fetch resolves", async () => {
    localStorage.setItem(
      "green-flags:beaches",
      JSON.stringify({ version: 1, data: [beach("cached-beach")], updatedAt: "2026-08-13T00:00:00.000Z" }),
    );
    let resolveFetch: (value: { beaches: Beach[] }) => void = () => {};
    vi.mocked(fetchBeaches).mockReturnValue(new Promise((resolve) => (resolveFetch = resolve)));

    const { result } = renderHook(() => useBeaches());

    expect(result.current).toMatchObject({
      status: "success",
      data: [beach("cached-beach")],
      refreshing: true,
    });

    resolveFetch({ beaches: [beach("fresh-beach")] });

    await waitFor(() =>
      expect(result.current).toMatchObject({ status: "success", data: [beach("fresh-beach")], refreshing: false }),
    );
  });

  it("always calls fetchBeaches on mount regardless of whether the cache hit", async () => {
    localStorage.setItem(
      "green-flags:beaches",
      JSON.stringify({ version: 1, data: [beach("cached-beach")], updatedAt: "2026-08-13T00:00:00.000Z" }),
    );
    vi.mocked(fetchBeaches).mockResolvedValue({ beaches: [beach("fresh-beach")] });

    renderHook(() => useBeaches());

    await waitFor(() => expect(fetchBeaches).toHaveBeenCalledTimes(1));
  });

  it("treats a version-mismatched cache entry as a miss", () => {
    localStorage.setItem(
      "green-flags:beaches",
      JSON.stringify({ version: 0, data: [beach("stale-beach")], updatedAt: "2026-08-13T00:00:00.000Z" }),
    );
    vi.mocked(fetchBeaches).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useBeaches());
    expect(result.current.status).toBe("loading");
  });

  it("keeps cached data and clears refreshing (without becoming error) when revalidation fails", async () => {
    localStorage.setItem(
      "green-flags:beaches",
      JSON.stringify({ version: 1, data: [beach("cached-beach")], updatedAt: "2026-08-13T00:00:00.000Z" }),
    );
    vi.mocked(fetchBeaches).mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useBeaches());

    await waitFor(() =>
      expect(result.current).toMatchObject({ status: "success", data: [beach("cached-beach")], refreshing: false }),
    );
  });

  it("surfaces a failed fetch as error when there was no cache to fall back on", async () => {
    vi.mocked(fetchBeaches).mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useBeaches());

    await waitFor(() => expect(result.current).toEqual({ status: "error", message: "network down" }));
  });
});
