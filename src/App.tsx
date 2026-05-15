import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Passengers from "./pages/passengers/Passengers";
import Drivers from "./pages/drivers/Drivers";
import TrackUsers from "./pages/track-users/TrackUsers";
import Rides from "./pages/rides/Rides";
import VehicleType from "./pages/vehicles/vehicle-type/VehicleType";
import UserVehicle from "./pages/vehicles/user-vehicle/UserVehicle";
import ManageDocuments from "./pages/financial/Managedocuments";
import ReviewRatings from "./pages/management/reviews-ratings/ReviewRatings";
import PushNotification from "./pages/marketing/PushNotification";
import Pages from "./pages/settings/Pages";
import SiteSetting from "./pages/settings/SiteSettings";
import Localization from "./pages/settings/Localization";
import EarningsReport from "./pages/vehicles/earnings-report/EarningsReport";
import Statements from "./pages/financial/statements/Statements";

function App() {
  return (
    <div>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/passengers" element={<Passengers />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/track-users" element={<TrackUsers />} />
          <Route path="/rides" element={<Rides />} />
          <Route path="/vehicle-types" element={<VehicleType />} />
          <Route path="/user-vehicles" element={<UserVehicle />} />
          <Route path="/manage-documents" element={<ManageDocuments />} />
          <Route path="/review-ratings" element={<ReviewRatings />} />
          <Route path="/notifications" element={<PushNotification />} />
          <Route path="/pages" element={<Pages />} />
          <Route path="/site-settings" element={<SiteSetting />} />
          <Route path="/localization" element={<Localization />} />
          <Route path="/earning-reports" element={<EarningsReport />} />
           <Route path="/statements" element={<Statements />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
