import { SystemStatus } from "./components/SystemStatus/SystemStatus";
import styles from "./App.module.css";

function App() {
  return (
    <main className={styles.app}>
      <h1>Green Flags</h1>
      <p>Project scaffolding check — frontend ↔ backend ↔ database.</p>
      <SystemStatus />
    </main>
  );
}

export default App;
