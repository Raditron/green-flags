// Mirrors the role of frontend/src/test/setup.ts. jest-expo's preset already configures the
// React Native test environment; @testing-library/react-native's matchers (toBeOnTheScreen, etc.)
// are auto-extended onto `expect` as of v12.4+, so nothing else is needed here yet. Add
// project-wide test setup (e.g. mocking AsyncStorage, Firebase) here as later tickets need it.
