import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable, Text } from "react-native";
import { Dashboard } from "../components/Dashboard/Dashboard";
import { BeachList } from "../components/BeachList/BeachList";
import { SavedBeaches } from "../components/SavedBeaches/SavedBeaches";
import { BeachDetail } from "../components/BeachDetail/BeachDetail";
import type { RootStackParamList, TabParamList } from "./interfaces";

const Tab = createBottomTabNavigator<TabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

/**
 * Bottom tab navigator mirroring frontend's three top-level routes (`/`, `/beaches`, `/saved` —
 * see `frontend/src/App.tsx`). Screen order matches the header nav order in
 * `frontend/src/components/Layout/Layout.tsx` (All beaches, Your beaches, Today) as closely as a
 * tab bar's left-to-right convention allows, keeping Today first since it's the app's landing tab.
 */
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Today" component={Dashboard} />
      <Tab.Screen name="Beaches" component={BeachList} />
      <Tab.Screen name="Saved" component={SavedBeaches} />
    </Tab.Navigator>
  );
}

/**
 * Root stack: the tab navigator, with Beach Detail pushed on top — mirrors frontend's
 * `/beaches/:beachId` route being reachable from the Beaches tab while `Layout`'s chrome
 * (header/nav) stays mounted around every screen.
 */
export function RootNavigator() {
  return (
    <NavigationContainer>
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
