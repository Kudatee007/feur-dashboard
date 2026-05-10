import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Passengers from "./pages/passengers/Passengers";
import Drivers from "./pages/drivers/Drivers";
import TrackUsers from "./pages/track-users/TrackUsers";
import Rides from "./pages/rides/Rides";
import VehicleType from "./pages/vehicles/vehicle-type/VehicleType";
import UserVehicle from "./pages/vehicles/user-vehicle/UserVehicle";
import ManageDocuments from "./pages/financial/ManageDocument";

function App() {
  return (
    <div>
      <Routes>
        <Route element={<DashboardLayout />}>
          {" "}
          {/* no children prop here */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/passengers" element={<Passengers />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/track-users" element={<TrackUsers />} />
          <Route path="/rides" element={<Rides />} />
          <Route path="/vehicle-types" element={<VehicleType />} />
          <Route path="/user-vehicles" element={<UserVehicle />} />
          <Route path="/manage-documents" element={<ManageDocuments />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
