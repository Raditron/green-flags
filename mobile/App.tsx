import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AccountControl } from "./src/auth/AccountControl";
import { AuthProvider } from "./src/auth/AuthContext";
import { EmailVerificationBanner } from "./src/auth/EmailVerificationBanner";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { ThemeProvider } from "./src/theme/ThemeContext";
import { ThemeToggle } from "./src/theme/ThemeToggle";
import { ToastProvider } from "./src/toast/ToastContext";

// ThemeProvider wraps everything (most components below call useTheme()). AuthProvider wraps
// everything that reads useAuth() — EmailVerificationBanner, AccountControl, and (via
// AccountControl) AuthScreen/UserMenu. ThemeToggle/AccountControl render as floating overlays
// above RootNavigator — see their own doc comments for why — so they sit as siblings of it,
// inside the same SafeAreaProvider (both position themselves off useSafeAreaInsets()).
// EmailVerificationBanner instead renders in normal flex flow above RootNavigator, not as a
// floating chip, so RootNavigator is wrapped in its own flex:1 View to still fill the remaining
// space beneath it.
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <ToastProvider>
            <View style={{ flex: 1 }}>
              <EmailVerificationBanner />
              <View style={{ flex: 1 }}>
                <RootNavigator />
              </View>
            </View>
            <AccountControl />
            <ThemeToggle />
          </ToastProvider>
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
