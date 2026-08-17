// Mirrors the role of frontend/src/test/setup.ts. jest-expo's preset already configures the
// React Native test environment; @testing-library/react-native's matchers (toBeOnTheScreen, etc.)
// are auto-extended onto `expect` as of v12.4+, so nothing else is needed here yet.
//
// AsyncStorage is mocked via the `moduleNameMapper` entry in package.json's "jest" config
// (pointing at the library's own `jest/async-storage-mock`) rather than here, since it needs to
// apply before any module under test imports it. Add further project-wide test setup (e.g.
// mocking Firebase) here as later tickets need it.
