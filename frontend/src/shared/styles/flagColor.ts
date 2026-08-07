export function flagColorVar(flagColor: string | undefined): string {
  switch (flagColor) {
    case "green":
      return "var(--flag-green)";
    case "yellow":
      return "var(--flag-yellow)";
    case "red":
      return "var(--flag-red)";
    default:
      return "var(--border)";
  }
}

// First-draft copy, not approved safety/legal language. Returns undefined
// when there's no flag prediction to report on.
export function getFlagStatusText(flagColor: string | undefined): string | undefined {
  switch (flagColor) {
    case "green":
      return "Green flag · safe to swim";
    case "yellow":
      return "Yellow flag · caution advised";
    case "red":
      return "Red flag · no swimming";
    default:
      return undefined;
  }
}
