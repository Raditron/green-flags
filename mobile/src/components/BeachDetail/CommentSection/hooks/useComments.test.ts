import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useComments } from "./useComments";
import { fetchComments } from "../data/fetchComments";
import type { CommentWithAuthor } from "../interfaces";

jest.mock("../data/fetchComments", () => ({ fetchComments: jest.fn() }));

const BEACH_ID = "beach-a";

function comment(id: string): CommentWithAuthor {
  return {
    id,
    description: "Nice beach",
    createdOn: "2026-08-02T12:00:00.000Z",
    userId: "uid-a",
    beachId: BEACH_ID,
    displayName: "Diver Dan",
    email: "diver@example.com",
  };
}

describe("useComments", () => {
  beforeEach(() => {
    jest.mocked(fetchComments).mockReset();
  });

  it("starts loading and empty", async () => {
    jest.mocked(fetchComments).mockReturnValue(new Promise(() => {}));
    const { result } = await renderHook(() => useComments(BEACH_ID));

    expect(result.current.loading).toBe(true);
    expect(result.current.comments).toEqual([]);
  });

  it("resolves with the fetched comments", async () => {
    jest.mocked(fetchComments).mockResolvedValue([comment("comment-a")]);
    const { result } = await renderHook(() => useComments(BEACH_ID));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.comments).toEqual([comment("comment-a")]);
    expect(result.current.error).toBeNull();
  });

  it("surfaces a fetch failure as error", async () => {
    jest.mocked(fetchComments).mockRejectedValue(new Error("network down"));
    const { result } = await renderHook(() => useComments(BEACH_ID));

    await waitFor(() => expect(result.current.error).toBe("network down"));
    expect(result.current.loading).toBe(false);
  });

  it("refetch triggers another fetch and updates comments in place, without re-flipping loading", async () => {
    jest.mocked(fetchComments).mockResolvedValueOnce([]);
    const { result } = await renderHook(() => useComments(BEACH_ID));
    await waitFor(() => expect(result.current.loading).toBe(false));

    jest.mocked(fetchComments).mockResolvedValueOnce([comment("comment-a")]);
    await act(async () => result.current.refetch());

    await waitFor(() => expect(result.current.comments).toEqual([comment("comment-a")]));
    expect(result.current.loading).toBe(false);
    expect(fetchComments).toHaveBeenCalledTimes(2);
  });
});
