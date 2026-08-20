import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BeachDetailRouteParams } from "../../components/BeachDetail/interfaces";

/**
 * The Beaches, Today, Saved bottom tabs — mirrors frontend's `/`, `/beaches`, `/saved` routes
 * (see `frontend/src/App.tsx`).
 */
export type TabParamList = {
  Today: undefined;
  Beaches: undefined;
  Saved: undefined;
};

/**
 * The root stack: the tab navigator itself, plus Beach Detail pushed on top of it — mirrors
 * frontend's `/beaches/:beachId` route, reachable from the Beaches tab.
 */
export type RootStackParamList = {
  MainTabs: undefined;
  BeachDetail: BeachDetailRouteParams;
};

export type BeachesTabScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Beaches">,
  NativeStackScreenProps<RootStackParamList>
>;

/** The Saved tab (#100) — same composite shape as BeachesTabScreenProps, so tapping a card in the
 * Saved grid can push Beach Detail the same way a Beaches tab card does. */
export type SavedTabScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Saved">,
  NativeStackScreenProps<RootStackParamList>
>;

export type BeachDetailScreenProps = NativeStackScreenProps<RootStackParamList, "BeachDetail">;
