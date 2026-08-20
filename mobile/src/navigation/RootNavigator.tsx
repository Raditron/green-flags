import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import type { Theme as NavigationTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Pressable } from "react-native";
import { Dashboard } from "../components/Dashboard/Dashboard";
import { BeachList } from "../components/BeachList/BeachList";
import { SavedBeaches } from "../components/SavedBeaches/SavedBeaches";
import { BeachDetail } from "../components/BeachDetail/BeachDetail";
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
 * Unlike frontend, which hides its "Your beaches" header link entirely while signed out
 * (`frontend/src/components/Layout/Layout.tsx`'s `!loading && user` gate), the Saved tab is always
 * present — #100's mobile-specific acceptance criterion (see #91's story 29) wants a signed-out
 * visitor who reaches it to see a clear sign-in prompt, not a tab that mysteriously doesn't exist.
 * SavedBeaches itself (`components/SavedBeaches/SavedBeaches.tsx`) owns that gating — this
 * navigator no longer reads `user`/`loading` at all.
 *
 * Each tab supplies its own `tabBarIcon` (FontAwesome6, same icon system as the rest of mobile —
 * see AreaSelect.tsx's precedent) so the bar shows real icons instead of React Navigation's own
 * "tofu" placeholder glyph. Frontend has no equivalent nav to crib icon choices from (its nav is
 * text-only pills), so these are picked fresh: `calendar-day` for Today (today's date, the landing
 * tab), `water` for Beaches (matches the sea/beach subject matter), `star` for Saved (matches
 * frontend's SaveBeachButton.tsx's `FaStar`/`FaRegStar`).
 */
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Today"
        component={Dashboard}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome6 name="calendar-day" solid size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Beaches"
        component={BeachList}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome6 name="water" solid size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedBeaches}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome6 name="star" solid size={size} color={color} />,
        }}
      />
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
          options={({ navigation, route }) => ({
            // Seeds from the route param BeachList already knows (see BeachList's
            // navigation.navigate call), so the header never flashes a generic title before
            // BeachDetail's own `setOptions` effect (which also covers a name-less deep link,
            // once fetchBeach resolves) runs.
            title: route.params.name ?? "Beach Detail",
            // native-stack's default back chrome is rendered by the native header (UINavigationController
            // / Fragment toolbar) and never enters the JS/RNTL element tree, so it isn't testable under
            // Jest. Supplying our own `headerLeft` keeps back navigation exercisable in tests and gives us
            // a consistent, cross-platform back affordance (incl. on web). FontAwesome6 `chevron-left`
            // matches the icon system used elsewhere in mobile (see MainTabs above).
            headerLeft: () => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() => navigation.goBack()}
                hitSlop={8}
                // Native-stack butts headerLeft directly against the title with no gap of its own,
                // so the chevron needs its own trailing space to keep it from crowding the beach name.
                style={{ paddingRight: 12 }}
              >
                <FontAwesome6 name="chevron-left" solid size={18} color={tokens.text} />
              </Pressable>
            ),
          })}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
