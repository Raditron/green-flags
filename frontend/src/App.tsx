import { Route, Routes } from "react-router-dom";
import { BeachList } from "./components/BeachList/BeachList";
import { SystemStatus } from "./components/SystemStatus/SystemStatus";
import { BeachDetail } from "./components/BeachDetail/BeachDetail";
import { AuthStatus } from "./components/Auth/AuthStatus";
import { getAppStyles } from "./App.styles";

function App() {
  const styles = getAppStyles();

  return (
    <main style={styles.app}>
      <h1>Green Flags</h1>
      <AuthStatus />
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
