import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import type { Theme as NavigationTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable, Text } from "react-native";
import { Dashboard } from "../components/Dashboard/Dashboard";
import { BeachList } from "../components/BeachList/BeachList";
import { SavedBeaches } from "../components/SavedBeaches/SavedBeaches";
import { BeachDetail } from "../components/BeachDetail/BeachDetail";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../theme/ThemeContext";
import type { ThemeTokens } from "../theme/tokens";
import type { RootStackParamList, TabParamList } from "./interfaces";

const Tab = createBottomTabNavigator<TabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

/**
 * Bottom tab navigator mirroring frontend's three top-level routes (`/`, `/beaches`, `/saved` —
 * see `frontend/src/App.tsx`). Screen order matches the header nav order in
 * `frontend/src/components/Layout/Layout.tsx` (All beaches, Your beaches, Today) as closely as a
 * tab bar's left-to-right convention allows, keeping Today first since it's the app's landing tab.
 *
 * The Saved tab is hidden while signed out, mirroring frontend's `Layout` gating "Your beaches"
 * behind `!loading && user` (`frontend/src/components/Layout/Layout.tsx`) — there's no saved-beach
 * list to show for a user we can't identify. Held back during the initial `loading` beat too, so
 * the tab doesn't flash in and then disappear once the signed-out state resolves.
 */
function MainTabs() {
  const { user, loading } = useAuth();

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Today" component={Dashboard} />
      <Tab.Screen name="Beaches" component={BeachList} />
      {!loading && user && <Tab.Screen name="Saved" component={SavedBeaches} />}
    </Tab.Navigator>
  );
}

/**
 * Recolors React Navigation's own chrome (header/tab-bar backgrounds, active tint, etc. — none of
 * which our screens render themselves) with our tokens, so the "every screen updates live" part
 * of #93's acceptance criteria covers navigator-owned UI too, not just page content. `fonts` has
 * no token equivalent (design tokens only cover color/radius) so it carries over from the base
 * theme unchanged.
 */
function toNavigationTheme(theme: "light" | "dark", tokens: ThemeTokens): NavigationTheme {
  const base = theme === "dark" ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark: theme === "dark",
    colors: {
      ...base.colors,
      primary: tokens.info,
      background: tokens.bg,
      card: tokens.surface,
      text: tokens.text,
      border: tokens.border,
      notification: tokens.error,
    },
  };
}

/**
 * Root stack: the tab navigator, with Beach Detail pushed on top — mirrors frontend's
 * `/beaches/:beachId` route being reachable from the Beaches tab while `Layout`'s chrome
 * (header/nav) stays mounted around every screen.
 */
export function RootNavigator() {
  const { theme, tokens } = useTheme();

  return (
    <NavigationContainer theme={toNavigationTheme(theme, tokens)}>
      <RootStack.Navigator>
        <RootStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <RootStack.Screen
          name="BeachDetail"
          component={BeachDetail}
          options={({ navigation }) => ({
            title: "Beach Detail",
            // native-stack's default back chrome is rendered by the native header (UINavigationController
            // / Fragment toolbar) and never enters the JS/RNTL element tree, so it isn't testable under
            // Jest. Supplying our own `headerLeft` keeps back navigation exercisable in tests and gives us
            // a consistent, cross-platform back affordance (incl. on web).
            headerLeft: () => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() => navigation.goBack()}
                hitSlop={8}
              >
                <Text>Back</Text>
              </Pressable>
            ),
          })}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
