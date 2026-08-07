import { getSignInPromptStyles } from "./styles/SignInPrompt.styles";

export function SignInPrompt({ onSignIn }: { onSignIn: () => void }) {
  const styles = getSignInPromptStyles();

  return (
    <div>
      <p style={styles.message}>Sign in to report the flag color.</p>
      <button type="button" style={styles.action} onClick={onSignIn}>
        Sign in
      </button>
    </div>
  );
}
