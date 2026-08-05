import { Route, Routes } from "react-router-dom";
import { BeachList } from "./components/BeachList/BeachList";
import { SystemStatus } from "./components/SystemStatus/SystemStatus";
import { BeachDetail } from "./components/BeachDetail/BeachDetail";
import styles from "./App.module.css";

function App() {
  return (
    <main className={styles.app}>
      <h1>Green Flags</h1>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <BeachList />
              <SystemStatus />
            </>
          }
        />
        <Route path="/beaches/:beachId" element={<BeachDetail />} />
      </Routes>
    </main>
  );
}

export default App;
