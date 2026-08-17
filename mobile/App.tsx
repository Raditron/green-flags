import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { ThemeProvider } from "./src/theme/ThemeContext";
import { ThemeToggle } from "./src/theme/ThemeToggle";
import { ToastProvider } from "./src/toast/ToastContext";

// ThemeProvider wraps everything (RootNavigator and ThemeToggle both call useTheme()).
// ThemeToggle renders as a floating overlay above RootNavigator — see its own doc comment for
// why — so it needs to sit as a sibling of it, inside the same SafeAreaProvider (both position
// themselves off useSafeAreaInsets()).
export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <ToastProvider>
          <RootNavigator />
          <ThemeToggle />
        </ToastProvider>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
