import { BeachList } from "./components/BeachList/BeachList";
import { SystemStatus } from "./components/SystemStatus/SystemStatus";
import styles from "./App.module.css";

function App() {
  return (
    <main className={styles.app}>
      <h1>Green Flags</h1>
      <BeachList />
      <SystemStatus />
    </main>
  );
}

export default App;
