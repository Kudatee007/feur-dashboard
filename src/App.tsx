import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Passengers from "./pages/passengers/Passengers";
import Drivers from "./pages/drivers/Drivers";
import TrackUsers from "./pages/track-users/TrackUsers";

function App() {
  return (
    <div>
     <Routes>
      <Route element={<DashboardLayout />}>  {/* no children prop here */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/passengers" element={<Passengers />} />
          <Route path="/drivers" element={<Drivers />} />
           <Route path="/track-users" element={<TrackUsers />} />
      </Route>
    </Routes>
    </div>
  );
}

export default App;
