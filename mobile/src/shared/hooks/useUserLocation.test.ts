import { renderHook, waitFor } from "@testing-library/react-native";
import * as Location from "expo-location";
import { useUserLocation } from "./useUserLocation";

jest.mock("expo-location", () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

describe("useUserLocation", () => {
  afterEach(() => {
    jest.mocked(Location.requestForegroundPermissionsAsync).mockReset();
    jest.mocked(Location.getCurrentPositionAsync).mockReset();
  });

  it("starts in loading before permission resolves", async () => {
    jest.mocked(Location.requestForegroundPermissionsAsync).mockReturnValue(new Promise(() => {}));

    const { result } = await renderHook(() => useUserLocation());

    expect(result.current).toEqual({ status: "loading" });
  });

  it("resolves to success with coordinates once permission is granted and a fix is found", async () => {
    jest
      .mocked(Location.requestForegroundPermissionsAsync)
      .mockResolvedValue({ status: "granted" } as Location.LocationPermissionResponse);
    jest.mocked(Location.getCurrentPositionAsync).mockResolvedValue({
      coords: { latitude: 43.2, longitude: 27.9 },
    } as Location.LocationObject);

    const { result } = await renderHook(() => useUserLocation());

    await waitFor(() =>
      expect(result.current).toEqual({ status: "success", coords: { lat: 43.2, long: 27.9 } }),
    );
  });

  it("falls back to unavailable when permission is denied — no crash, no coords", async () => {
    jest
      .mocked(Location.requestForegroundPermissionsAsync)
      .mockResolvedValue({ status: "denied" } as Location.LocationPermissionResponse);

    const { result } = await renderHook(() => useUserLocation());

    await waitFor(() => expect(result.current).toEqual({ status: "unavailable" }));
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it("falls back to unavailable when granted but the position fetch rejects", async () => {
    jest
      .mocked(Location.requestForegroundPermissionsAsync)
      .mockResolvedValue({ status: "granted" } as Location.LocationPermissionResponse);
    jest.mocked(Location.getCurrentPositionAsync).mockRejectedValue(new Error("position unavailable"));

    const { result } = await renderHook(() => useUserLocation());

    await waitFor(() => expect(result.current).toEqual({ status: "unavailable" }));
  });

  it("falls back to unavailable when the permission request itself throws", async () => {
    jest.mocked(Location.requestForegroundPermissionsAsync).mockRejectedValue(new Error("unsupported"));

    const { result } = await renderHook(() => useUserLocation());

    await waitFor(() => expect(result.current).toEqual({ status: "unavailable" }));
  });
});
