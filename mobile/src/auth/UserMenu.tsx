import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { avatarInitial } from "../shared/avatarInitial";
import { BORDER_RADIUS } from "../theme/tokens";
import type { ThemeTokens } from "../theme/tokens";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "./AuthContext";
import type { UserMenuProps } from "./interfaces";

/**
 * RN port of frontend's Layout/UserMenu/UserMenu.tsx. Unlike ThemeToggle, this doesn't position
 * itself on screen — like frontend's `container` (`position: relative`, positioned by its parent
 * header layout), it's a plain chip + dropdown; AccountControl (the root floating control, like
 * ThemeToggle) is what fixes it to a screen corner. The dismissible dropdown uses RN's `<Modal
 * transparent>` with a full-screen backdrop `Pressable` to close on outside-tap, standing in for
 * frontend's DOM-only `useDismissibleMenu` hook (no direct RN equivalent).
 */
export function UserMenu({ email, displayName }: UserMenuProps) {
  const { logOut } = useAuth();
  const { tokens } = useTheme();
  const [open, setOpen] = useState(false);
  const styles = getUserMenuStyles(tokens);
  const initial = avatarInitial(displayName, email);

  function handleLogOut() {
    setOpen(false);
    void logOut();
  }

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Account menu"
        accessibilityState={{ expanded: open }}
        style={styles.chip}
      >
        <Text style={styles.chipText}>{initial}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
          accessibilityLabel="Close account menu"
        >
          <View style={styles.menu}>
            <Pressable onPress={handleLogOut} accessibilityRole="menuitem" style={styles.menuItem}>
              <Text style={styles.menuItemText}>Log out</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function getUserMenuStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    chip: {
      width: 36,
      height: 36,
      borderRadius: 999,
      backgroundColor: tokens.iconChip,
      alignItems: "center",
      justifyContent: "center",
    },
    chipText: {
      color: tokens.iconChipFg,
      fontSize: 15,
      fontWeight: "700",
    },
    backdrop: {
      flex: 1,
      alignItems: "flex-end",
      paddingTop: 64,
      paddingRight: 16,
    },
    menu: {
      minWidth: 140,
      borderRadius: BORDER_RADIUS,
      borderWidth: 1,
      borderColor: tokens.border,
      backgroundColor: tokens.surface,
      overflow: "hidden",
    },
    menuItem: {
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    menuItemText: {
      color: tokens.text,
      fontSize: 14,
    },
  });
}
