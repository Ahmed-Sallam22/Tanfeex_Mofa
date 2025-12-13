import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { TanfeezLoader } from "../components/ui";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleProtectedRoute from "../components/RoleProtectedRoute";

// Lazy load all pages for better code splitting and reduced initial bundle size
const SignIn = lazy(() => import("../pages/auth/SignIn"));
const AppLayout = lazy(() => import("../components/layout/AppLayout"));
const Home = lazy(() => import("../pages/dashboard/Home"));
const DashboardDetails = lazy(
  () => import("../pages/dashboard/DashboardDetails")
);
const Transfer = lazy(() => import("@/pages/dashboard/Transfer"));
const TransferDetails = lazy(() => import("@/pages/dashboard/TransferDetails"));
const TransferPDFView = lazy(() => import("@/pages/dashboard/TransferPDFView"));
const Reservations = lazy(() => import("@/pages/dashboard/Reservations"));
const ReservationsDetails = lazy(
  () => import("@/pages/dashboard/ReservationsDetails")
);
const FundRequests = lazy(() => import("@/pages/dashboard/FundRequests"));
const FundRequestsDetails = lazy(
  () => import("@/pages/dashboard/FundRequestsDetails")
);
const FundAdjustments = lazy(() => import("@/pages/dashboard/FundAdjustments"));
const FundAdjustmentsDetails = lazy(
  () => import("@/pages/dashboard/FundAdjustmentsDetails")
);
const PendingTransfer = lazy(() => import("@/pages/dashboard/PendingTransfer"));
const PendingTransferDetails = lazy(
  () => import("@/pages/dashboard/PendingTransferDetails")
);
const PendingAdjustments = lazy(
  () => import("@/pages/dashboard/PendingAdjustments")
);
const PendingAdjustmentsDetails = lazy(
  () => import("@/pages/dashboard/PendingAdjustmentsDetails")
);
const PendingReservations = lazy(
  () => import("@/pages/dashboard/PendingReservations")
);
const PendingReservationsDetails = lazy(
  () => import("@/pages/dashboard/PendingReservationsDetails")
);
const PendingRequests = lazy(() => import("@/pages/dashboard/PendingRequests"));
const PendingRequestsDetails = lazy(
  () => import("@/pages/dashboard/PendingRequestsDetails")
);
const Users = lazy(() => import("@/pages/dashboard/Users"));
const Reports = lazy(() => import("@/pages/dashboard/Reports"));
const AddWorkFlow = lazy(() => import("@/pages/dashboard/AddWorkFlow"));
const WorkFlow = lazy(() => import("@/pages/dashboard/WorkFlow"));
const Chat = lazy(() => import("@/pages/dashboard/Chat"));
const InvoiceDetails = lazy(() => import("@/pages/dashboard/InvoiceDetails"));
const UploadInvoice = lazy(() => import("@/pages/dashboard/UploadInvoice"));
const SegmentConfiguration = lazy(
  () => import("@/pages/dashboard/SegmentConfiguration")
);
const AnalyticalReport = lazy(() => import("@/pages/reports/AnalyticalReport"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<TanfeezLoader />}>
      <Routes>
        <Route
          path="/auth/sign-in"
          element={
            <ProtectedRoute requireAuth={false}>
              <SignIn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route
            path="dashboard-details/:type"
            element={<DashboardDetails />}
          />
          <Route
            path="chat/:id"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          {/* Level 1: Transfer, Transfer Details, Fund Requests, Fund Request Details, Adjustments, Adjustment Details */}
          <Route
            path="transfer"
            element={
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[1]}
              >
                <Transfer />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="transfer/:id"
            element={
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[1]}
              >
                <TransferDetails />
              </RoleProtectedRoute>
            }
          />

          <Route
            path="reservations"
            element={
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[1]}
              >
                <Reservations />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="reservations/:id"
            element={
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[1]}
              >
                <ReservationsDetails />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="fund-requests"
            element={
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[1]}
              >
                <FundRequests />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="FundRequests/:id"
            element={
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[1]}
              >
                <FundRequestsDetails />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="FundAdjustments"
            element={
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[1]}
              >
                <FundAdjustments />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="FundAdjustments/:id"
            element={
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[1]}
              >
                <FundAdjustmentsDetails />
              </RoleProtectedRoute>
            }
          />

          {/* Level 2, 3, 4: All pending pages and pending details */}
          <Route
            path="PendingTransfer"
            element={
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[2, 3, 4]}
              >
                <PendingTransfer />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="PendingTransfer/:id"
            element={
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[2, 3, 4]}
              >
                <PendingTransferDetails />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="PendingAdjustments"
            element={
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[2, 3, 4]}
              >
                <PendingAdjustments />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="PendingAdjustments/:id"
            element={
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[2, 3, 4]}
              >
                <PendingAdjustmentsDetails />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="pending-reservations"
            element={
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[2, 3, 4]}
              >
                <PendingReservations />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="pending-reservations/:id"
            element={
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[2, 3, 4]}
              >
                <PendingReservationsDetails />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="PendingRequests"
            element={
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[2, 3, 4]}
              >
                <PendingRequests />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="PendingRequests/:id"
            element={
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[2, 3, 4]}
              >
                <PendingRequestsDetails />
              </RoleProtectedRoute>
            }
          />

          {/* Level 4 + Super Admin: Envelope page */}
          {/* <Route
            path="envelope"
            element={
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[4]}
              >
                <Envelope />
              </RoleProtectedRoute>
            }
          /> */}

          {/* Super Admin only: Management pages */}
          {/* <Route
            path="projects-overview"
            element={
              <RoleProtectedRoute allowedRoles={["superadmin"]}>
                <ProjectsOverview />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="accounts-projects"
            element={
              <RoleProtectedRoute allowedRoles={["superadmin"]}>
                <AccountsProjects />
              </RoleProtectedRoute>
            }
          /> */}
          <Route
            path="reports"
            element={
              <RoleProtectedRoute allowedRoles={["superadmin"]}>
                <Reports />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="analytical-report"
            element={
              <RoleProtectedRoute allowedRoles={["superadmin"]}>
                <AnalyticalReport />
              </RoleProtectedRoute>
            }
          />
          {/* <Route
            path="Document_I/O"
            element={
              <RoleProtectedRoute allowedRoles={["superadmin"]}>
                <DocumentIO />
              </RoleProtectedRoute>
            }
          /> */}
          <Route
            path="Document_I/O/:id"
            element={
              <RoleProtectedRoute allowedRoles={["superadmin"]}>
                <InvoiceDetails />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="Document_I/O/upload"
            element={
              <RoleProtectedRoute allowedRoles={["superadmin"]}>
                <UploadInvoice />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="WorkFlow"
            element={
              <RoleProtectedRoute allowedRoles={["superadmin"]}>
                <WorkFlow />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="AddWorkFlow"
            element={
              <RoleProtectedRoute allowedRoles={["superadmin"]}>
                <AddWorkFlow />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="EditWorkFlow/:id"
            element={
              <RoleProtectedRoute allowedRoles={["superadmin"]}>
                <AddWorkFlow />
              </RoleProtectedRoute>
            }
          />

          {/* Super Admin only routes */}
          <Route
            path="users"
            element={
              <RoleProtectedRoute allowedRoles={["superadmin"]}>
                <Users />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="segment-configuration"
            element={
              <RoleProtectedRoute allowedRoles={["superadmin"]}>
                <SegmentConfiguration />
              </RoleProtectedRoute>
            }
          />

          {/* <Route path="profile" element={<Profile />} /> */}
          {/* <Route path="settings" element={<Settings />} /> */}
        </Route>

        {/* PDF View Route - Outside AppLayout (no navbar/sidebar) */}
        <Route
          path="/app/transfer-pdf"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[1]}
              >
                <TransferPDFView />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/app" />} />
        <Route path="*" element={<Navigate to="/app" />} />
      </Routes>
    </Suspense>
  );
}
