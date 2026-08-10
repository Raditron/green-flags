import { Route, Routes } from "react-router-dom";
import { BeachList } from "./components/BeachList/BeachList";
import { SystemStatus } from "./components/SystemStatus/SystemStatus";
import { BeachDetail } from "./components/BeachDetail/BeachDetail";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { Layout } from "./components/Layout/Layout";
import { BeachListCardPreview } from "./components/BeachList/BeachListCard/__preview";
import { BeachDetailPreview } from "./components/BeachDetail/__preview";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/beaches"
          element={
            <>
              <BeachList />
              <SystemStatus />
            </>
          }
        />
        <Route path="/beaches/:beachId" element={<BeachDetail />} />
        <Route path="/dev/preview" element={<BeachListCardPreview />} />
        <Route path="/dev/preview-detail" element={<BeachDetailPreview />} />
      </Routes>
    </Layout>
  );
}

export default App;
