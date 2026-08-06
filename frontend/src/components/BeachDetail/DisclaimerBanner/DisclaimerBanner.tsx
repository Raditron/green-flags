import { getDisclaimerBannerStyles } from "./styles/DisclaimerBanner.styles";

export function DisclaimerBanner() {
  const styles = getDisclaimerBannerStyles();

  return (
    <p role="note" style={styles.banner}>
      Unofficial estimate — not the lifeguard's flag
    </p>
  );
}
