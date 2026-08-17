import { fireEvent } from "@testing-library/react-native";

/**
 * RNTL v14's `fireEvent.press` is async under the hood (it always wraps in an async function
 * internally, even for a synchronous callback) — every call site must be awaited, or the next
 * statement runs before the state update/effect flush it triggered has actually landed, causing
 * "overlapping act() calls" warnings and silently dropped state updates. Shared across test files
 * (see ToastContext.test.tsx, RootNavigator.test.tsx) rather than each redefining it locally.
 *
 * Typed off `fireEvent.press` itself (rather than importing `ReactTestInstance` from
 * `react-test-renderer` directly) since this package doesn't otherwise depend on that module's
 * types.
 */
export async function press(element: Parameters<typeof fireEvent.press>[0]) {
  await fireEvent.press(element);
}
