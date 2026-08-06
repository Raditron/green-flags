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
