import styles from "./styles/DisclaimerBanner.module.css";

export function DisclaimerBanner() {
  return (
    <p role="note" className={styles.banner}>
      Unofficial estimate — not the lifeguard's flag
    </p>
  );
}
