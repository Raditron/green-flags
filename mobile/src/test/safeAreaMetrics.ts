/**
 * Fixed `SafeAreaProvider` metrics for tests. `react-native-safe-area-context` has no native
 * module under Jest, so `initialWindowMetrics` is `null` — passing that as `initialMetrics` leaves
 * `SafeAreaProvider` waiting forever for an onLayout measurement that never arrives in the test
 * renderer, and it never renders its children. Any test wrapping a component that calls
 * `useSafeAreaInsets()` (directly or via a child) needs this. Shared across test files (see
 * ThemeToggle.test.tsx, RootNavigator.test.tsx, AccountControl.test.tsx,
 * EmailVerificationBanner.test.tsx) rather than each redefining the same literal.
 */
export const TEST_SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 320, height: 640 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
