import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { COMPACT_HEADER_BREAKPOINT_PX, useIsCompactHeader } from "./useIsCompactHeader";

// A minimal MediaQueryList stand-in: exposes `matches` plus the change-listener plumbing the
// hook relies on, and a `fire` helper tests use to simulate the OS/browser flipping the query.
function installMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<() => void>();

  window.matchMedia = ((query: string) => ({
    media: query,
    get matches() {
      return matches;
    },
    addEventListener: (_event: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_event: string, listener: () => void) => listeners.delete(listener),
  })) as unknown as typeof window.matchMedia;

  return {
    fire(next: boolean) {
      matches = next;
      listeners.forEach((listener) => listener());
    },
  };
}

describe("useIsCompactHeader", () => {
  afterEach(() => {
    // @ts-expect-error -- deliberately tearing down the test stub between cases
    delete window.matchMedia;
  });

  it("reflects a query that already matches at mount", () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useIsCompactHeader());
    expect(result.current).toBe(true);
  });

  it("reflects a query that doesn't match at mount", () => {
    installMatchMedia(false);
    const { result } = renderHook(() => useIsCompactHeader());
    expect(result.current).toBe(false);
  });

  it("flips as the media query's match state changes", () => {
    const media = installMatchMedia(false);
    const { result } = renderHook(() => useIsCompactHeader());
    expect(result.current).toBe(false);

    act(() => media.fire(true));
    expect(result.current).toBe(true);

    act(() => media.fire(false));
    expect(result.current).toBe(false);
  });

  it("queries at the documented breakpoint constant", () => {
    let queriedWith = "";
    window.matchMedia = ((query: string) => {
      queriedWith = query;
      return {
        media: query,
        matches: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      };
    }) as unknown as typeof window.matchMedia;

    renderHook(() => useIsCompactHeader());
    expect(queriedWith).toBe(`(max-width: ${COMPACT_HEADER_BREAKPOINT_PX}px)`);
  });
});
