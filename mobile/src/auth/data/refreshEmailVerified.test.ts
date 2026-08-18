import type { User } from "firebase/auth";
import { refreshEmailVerified } from "./refreshEmailVerified";

describe("refreshEmailVerified", () => {
  it("reloads the user, force-refreshes the ID token, and returns a new object reference", async () => {
    const reload = jest.fn(async () => {});
    const getIdToken = jest.fn(async () => "fresh-id-token");
    const user = { uid: "u1", emailVerified: false, reload, getIdToken } as unknown as User;

    const refreshed = await refreshEmailVerified(user);

    expect(reload).toHaveBeenCalled();
    expect(getIdToken).toHaveBeenCalledWith(true);
    // reload() mutates the given User instance in place — a plain copy is returned so React
    // sees a new object reference and re-renders (see AuthContext.tsx).
    expect(refreshed).not.toBe(user);
    expect(refreshed).toMatchObject({ uid: "u1", emailVerified: false });

    const callOrder = [reload.mock.invocationCallOrder[0], getIdToken.mock.invocationCallOrder[0]];
    expect(callOrder).toEqual([...callOrder].sort((a, b) => a - b));
  });
});
