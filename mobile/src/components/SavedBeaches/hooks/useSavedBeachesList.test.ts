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
    expect(result.current).toEqual({ status: "success", data: [beach("beach-a")] });
    expect(fetchSavedBeaches).toHaveBeenCalledWith(USER);
  });

  it("resolves to an error state with the failure message on a rejected fetch", async () => {
    jest.mocked(fetchSavedBeaches).mockRejectedValue(new Error("network down"));
    const { result } = await renderHook(() => useSavedBeachesList(USER));

    await waitFor(() => expect(result.current).toEqual({ status: "error", message: "network down" }));
  });
});
