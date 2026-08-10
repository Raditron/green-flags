import { FaTriangleExclamation } from "react-icons/fa6";
import { getUnguardedNoticeStyles } from "./styles/UnguardedNotice.styles";

// Rendered under Verdict's flag-color panel (see Timeline.tsx) only for unguarded
// beaches — the flag reading above answers "what are conditions doing", this answers
// "is anyone watching", which matters just as much for an unguarded beach.
export function UnguardedNotice() {
  const styles = getUnguardedNoticeStyles();

  return (
    <div style={styles.panel} role="status">
      <FaTriangleExclamation style={styles.icon} aria-hidden="true" />
      <div style={styles.textCol}>
        <span style={styles.headline}>Caution: unguarded beach</span>
        <span style={styles.sentence}>
          No lifeguard is on duty here — swim at your own risk and keep a close eye on
          conditions.
        </span>
      </div>
    </div>
  );
}
