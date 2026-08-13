import type { CSSProperties } from "react";

type AuthModalStyleKey =
  | "backdrop"
  | "modal"
  | "close"
  | "kicker"
  | "kickerIcon"
  | "title"
  | "subtitle"
  | "segment"
  | "form"
  | "field"
  | "label"
  | "inputWrapper"
  | "eyeButton"
  | "errorBanner"
  | "errorIcon"
  | "errorText"
  | "submit";

// Revolut-style layered card: the modal itself sits on `--surface` (the app's usual elevated-panel
// tone — see ReportFlagPanel/Toast/UserMenu) while the inputs recess a shade further into `--bg`,
// so the two rounded surfaces read as "card" and "inset field" rather than a flat form. `mounted`
// drives a one-shot scale/fade-in on open (set true a tick after first render — see AuthModal.tsx);
// there's no matching exit animation since the modal unmounts immediately on close.
export function getAuthModalStyles({
  submitting,
  mounted,
  isCloseHovered,
  isSubmitHovered,
}: {
  submitting: boolean;
  mounted: boolean;
  isCloseHovered: boolean;
  isSubmitHovered: boolean;
}): Record<AuthModalStyleKey, CSSProperties> {
  const submitRaised = isSubmitHovered && !submitting;

  return {
    backdrop: {
      position: "fixed",
      inset: 0,
      background: "rgba(4, 10, 20, 0.6)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      zIndex: 10,
      opacity: mounted ? 1 : 0,
      transition: "opacity 0.2s ease",
    },
    modal: {
      position: "relative",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 28,
      boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
      padding: "34px 30px 28px",
      width: 380,
      maxWidth: "calc(100vw - 32px)",
      textAlign: "left",
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0) scale(1)" : "translateY(10px) scale(0.97)",
      transition: "opacity 0.22s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
    },
    close: {
      position: "absolute",
      top: 14,
      right: 14,
      width: 32,
      height: 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      borderRadius: "50%",
      background: isCloseHovered ? "var(--border)" : "transparent",
      fontSize: 18,
      lineHeight: 1,
      color: "var(--text)",
      cursor: "pointer",
      transition: "background 0.12s ease",
    },
    kicker: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      margin: "0 0 10px",
      color: "var(--flag-green)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
    kickerIcon: {
      width: 11,
      height: 11,
    },
    title: {
      margin: "0 0 6px",
      color: "var(--text-h)",
      fontSize: 25,
      fontWeight: 800,
      letterSpacing: "-0.02em",
      lineHeight: 1.2,
    },
    subtitle: {
      margin: "0 0 22px",
      color: "var(--text)",
      fontSize: 14,
      opacity: 0.8,
      lineHeight: 1.4,
    },
    // Pill-shaped tab switcher, Revolut/fintech-app style — replaces a plain text link as the
    // primary way to flip between login and signup so the two modes read as equal, adjacent
    // choices rather than one being the "main" form and the other an afterthought footnote.
    segment: {
      display: "flex",
      gap: 4,
      padding: 4,
      borderRadius: 999,
      background: "var(--bg)",
      border: "1px solid var(--border)",
      marginBottom: 24,
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: 14,
    },
    field: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },
    label: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--text-h)",
    },
    inputWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },
    eyeButton: {
      position: "absolute",
      right: 8,
      width: 30,
      height: 30,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      borderRadius: 8,
      background: "transparent",
      color: "var(--text)",
      opacity: 0.65,
      cursor: "pointer",
      transition: "opacity 0.12s ease",
    },
    errorBanner: {
      display: "flex",
      alignItems: "flex-start",
      gap: 8,
      padding: "10px 12px",
      borderRadius: 12,
      background: "color-mix(in srgb, var(--error) 12%, transparent)",
      border: "1px solid color-mix(in srgb, var(--error) 35%, transparent)",
    },
    errorIcon: {
      flexShrink: 0,
      width: 14,
      height: 14,
      marginTop: 2,
      color: "var(--error)",
    },
    errorText: {
      margin: 0,
      color: "var(--error)",
      fontSize: 13,
      lineHeight: 1.4,
    },
    submit: {
      border: "none",
      borderRadius: 999,
      background: submitRaised
        ? "color-mix(in srgb, var(--flag-green) 88%, black)"
        : "var(--flag-green)",
      color: "white",
      padding: "14px",
      font: "inherit",
      fontSize: 15.5,
      fontWeight: 700,
      cursor: submitting ? "default" : "pointer",
      marginTop: 6,
      opacity: submitting ? 0.75 : 1,
      boxShadow: submitRaised
        ? "0 10px 22px color-mix(in srgb, var(--flag-green) 45%, transparent)"
        : "0 2px 8px color-mix(in srgb, var(--flag-green) 22%, transparent)",
      transform: submitRaised ? "translateY(-1px)" : "translateY(0)",
      transition: "background 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease",
    },
  };
}

// Active tab is lifted onto the card surface with a soft shadow so it reads as "selected", the
// same way the app's other selected-row treatments (AreaSelect, TimePicker) fill with a flat tint
// — a raised pill fits the segmented-control shape better than a flat fill would.
export function getAuthSegmentTabStyle({ active }: { active: boolean }): CSSProperties {
  return {
    flex: 1,
    border: "none",
    borderRadius: 999,
    padding: "9px 0",
    font: "inherit",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    color: active ? "var(--text-h)" : "var(--text)",
    background: active ? "var(--surface)" : "transparent",
    boxShadow: active ? "0 2px 8px rgba(0, 0, 0, 0.12)" : "none",
    opacity: active ? 1 : 0.75,
    transition: "background 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease",
  };
}

// Focus ring uses the same flag-green the submit button and active tab already carry, so the one
// accent color ties the whole card's interactive states together instead of introducing a new hue.
export function getAuthInputStyle({
  focused,
  hasTrailingIcon,
}: {
  focused: boolean;
  hasTrailingIcon: boolean;
}): CSSProperties {
  return {
    width: "100%",
    border: `1.5px solid ${focused ? "var(--flag-green)" : "var(--border)"}`,
    borderRadius: 999,
    padding: hasTrailingIcon ? "13px 46px 13px 20px" : "13px 20px",
    font: "inherit",
    fontSize: 15,
    background: "var(--bg)",
    color: "var(--text-h)",
    outline: "none",
    boxShadow: focused
      ? "0 0 0 4px color-mix(in srgb, var(--flag-green) 18%, transparent)"
      : "none",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  };
}
