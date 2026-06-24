import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import DashboardLayout from "./components/layout/DashboardLayout";

const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Passengers = lazy(() => import("./pages/passengers/Passengers"));
const Drivers = lazy(() => import("./pages/drivers/Drivers"));
const TrackUsers = lazy(() => import("./pages/track-users/TrackUsers"));
const Rides = lazy(() => import("./pages/rides/Rides"));
const VehicleType = lazy(
  () => import("./pages/vehicles/vehicle-type/VehicleType"),
);
const UserVehicle = lazy(
  () => import("./pages/vehicles/user-vehicle/UserVehicle"),
);
const ManageDocuments = lazy(() => import("./pages/financial/Managedocuments"));
const ReviewRatings = lazy(
  () => import("./pages/management/reviews-ratings/ReviewRatings"),
);
const PushNotification = lazy(
  () => import("./pages/marketing/PushNotification"),
);
const Pages = lazy(() => import("./pages/settings/Pages"));
const SiteSetting = lazy(() => import("./pages/settings/SiteSettings"));
const Localization = lazy(() => import("./pages/settings/Localization"));
const EarningsReport = lazy(
  () => import("./pages/vehicles/earnings-report/EarningsReport"),
);
const Statements = lazy(
  () => import("./pages/financial/Statements"),
);
const AerialView = lazy(
  () => import("./pages/management/aeriel-view/AerielView"),
);
import Login from "./pages/login/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <svg
          className="w-8 h-8 text-teal-600 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <div>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route
              index
              element={
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="/passengers"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Passengers />
                </Suspense>
              }
            />
            <Route
              path="/drivers"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Drivers />
                </Suspense>
              }
            />
            <Route
              path="/track-users"
              element={
                <Suspense fallback={<PageLoader />}>
                  <TrackUsers />
                </Suspense>
              }
            />
            <Route
              path="/rides"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Rides />
                </Suspense>
              }
            />
            <Route
              path="/vehicle-types"
              element={
                <Suspense fallback={<PageLoader />}>
                  <VehicleType />
                </Suspense>
              }
            />
            <Route
              path="/user-vehicles"
              element={
                <Suspense fallback={<PageLoader />}>
                  <UserVehicle />
                </Suspense>
              }
            />
            <Route
              path="/manage-documents"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ManageDocuments />
                </Suspense>
              }
            />
            <Route
              path="/review-ratings"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ReviewRatings />
                </Suspense>
              }
            />
            <Route
              path="/notifications"
              element={
                <Suspense fallback={<PageLoader />}>
                  <PushNotification />
                </Suspense>
              }
            />
            <Route
              path="/pages"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Pages />
                </Suspense>
              }
            />
            <Route
              path="/site-settings"
              element={
                <Suspense fallback={<PageLoader />}>
                  <SiteSetting />
                </Suspense>
              }
            />
            <Route
              path="/localization"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Localization />
                </Suspense>
              }
            />
            <Route
              path="/earning-reports"
              element={
                <Suspense fallback={<PageLoader />}>
                  <EarningsReport />
                </Suspense>
              }
            />
            <Route
              path="/statements"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Statements />
                </Suspense>
              }
            />
            <Route
              path="/aerial-view"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AerialView />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
