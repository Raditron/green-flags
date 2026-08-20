import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/auth/AuthContext";
import { EmailVerificationBanner } from "./src/auth/EmailVerificationBanner";
import { TopBar } from "./src/components/Layout/TopBar";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { SavedBeachesProvider } from "./src/saved/SavedBeachesContext";
import { ThemeProvider } from "./src/theme/ThemeContext";
import { ToastProvider } from "./src/toast/ToastContext";

// ThemeProvider wraps everything (most components below call useTheme()). AuthProvider wraps
// everything that reads useAuth() — EmailVerificationBanner and (via TopBar's AccountControl)
// AuthScreen/UserMenu. SavedBeachesProvider (#100) nests inside AuthProvider, since it reads
// useAuth() itself to key its saved-beach fetch off the signed-in visitor — it wraps RootNavigator
// (SaveBeachButton on Beach Detail, the Saved tab's grid) the same way ToastProvider does. TopBar
// renders in normal flex flow above EmailVerificationBanner/RootNavigator, mirroring frontend's
// Layout.tsx header/EmailVerificationBanner/main ordering — it used to be two chips (AccountControl,
// ThemeToggle) floating over RootNavigator with no chrome behind them; see TopBar's own doc comment
// for why that changed. RootNavigator is wrapped in its own flex:1 View to fill the remaining space
// beneath TopBar/EmailVerificationBanner.
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SavedBeachesProvider>
          <SafeAreaProvider>
            <ToastProvider>
              <View style={{ flex: 1 }}>
                <TopBar />
                <EmailVerificationBanner />
                <View style={{ flex: 1 }}>
                  <RootNavigator />
                </View>
              </View>
            </ToastProvider>
            <StatusBar style="auto" />
          </SafeAreaProvider>
        </SavedBeachesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
