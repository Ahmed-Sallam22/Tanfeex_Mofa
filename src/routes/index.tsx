import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { TanfeezLoader } from "../components/ui";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleProtectedRoute from "../components/RoleProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import AccessDenied from "@/pages/AccessDenied";
import NotFound from "@/pages/NotFound";

// Lazy load auth pages
import SignIn from "../pages/auth/SignIn";

// Lazy load dashboard pages
const Home = lazy(() => import("../pages/dashboard/Home"));
const DashboardDetails = lazy(
  () => import("../pages/dashboard/DashboardDetails")
);

// Transfer pages
const Transfer = lazy(() => import("@/pages/dashboard/Transfer"));
const TransferDetails = lazy(() => import("@/pages/dashboard/TransferDetails"));
const PendingTransfer = lazy(() => import("@/pages/dashboard/PendingTransfer"));
const PendingTransferDetails = lazy(
  () => import("@/pages/dashboard/PendingTransferDetails")
);

// Reservations pages
const Reservations = lazy(() => import("@/pages/dashboard/Reservations"));
const ReservationsDetails = lazy(
  () => import("@/pages/dashboard/ReservationsDetails")
);
const PendingReservations = lazy(
  () => import("@/pages/dashboard/PendingReservations")
);
const PendingReservationsDetails = lazy(
  () => import("@/pages/dashboard/PendingReservationsDetails")
);

// Fund Request pages
const FundRequests = lazy(() => import("@/pages/dashboard/FundRequests"));
const FundRequestsDetails = lazy(
  () => import("@/pages/dashboard/FundRequestsDetails")
);
const PendingRequests = lazy(() => import("@/pages/dashboard/PendingRequests"));
const PendingRequestsDetails = lazy(
  () => import("@/pages/dashboard/PendingRequestsDetails")
);

// Fund Adjustments pages
const FundAdjustments = lazy(() => import("@/pages/dashboard/FundAdjustments"));
const FundAdjustmentsDetails = lazy(
  () => import("@/pages/dashboard/FundAdjustmentsDetails")
);
const PendingAdjustments = lazy(
  () => import("@/pages/dashboard/PendingAdjustments")
);
const PendingAdjustmentsDetails = lazy(
  () => import("@/pages/dashboard/PendingAdjustmentsDetails")
);

// Other dashboard pages
const Users = lazy(() => import("@/pages/dashboard/Users"));
const Reports = lazy(() => import("@/pages/dashboard/Reports"));
const AddWorkFlow = lazy(() => import("@/pages/dashboard/AddWorkFlow"));
const WorkFlow = lazy(() => import("@/pages/dashboard/WorkFlow"));
const WorkflowAssignments = lazy(
  () => import("@/pages/dashboard/WorkflowAssignments")
);
const Chat = lazy(() => import("@/pages/dashboard/Chat"));
const InvoiceDetails = lazy(() => import("@/pages/dashboard/InvoiceDetails"));
const UploadInvoice = lazy(() => import("@/pages/dashboard/UploadInvoice"));
const SegmentConfiguration = lazy(
  () => import("@/pages/dashboard/SegmentConfiguration")
);
const SecurityGroups = lazy(() => import("@/pages/dashboard/SecurityGroups"));
const Assumption = lazy(() => import("@/pages/dashboard/Assumption"));
const AssumptionBuilder = lazy(
  () => import("@/pages/dashboard/AssumptionBuilder")
);
const TableViewPDF = lazy(() => import("@/pages/dashboard/TableViewPDF"));

// Report pages
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
          {/* Access Denied Route - inside AppLayout */}
          <Route path="access-denied" element={<AccessDenied />} />

          {/* Not Found Route - inside AppLayout */}
          <Route path="not-found" element={<NotFound />} />

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
          <Route
            path="WorkflowAssignments"
            element={
              <RoleProtectedRoute allowedRoles={["superadmin"]}>
                <WorkflowAssignments />
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
          <Route
            path="security-groups"
            element={
              <RoleProtectedRoute allowedRoles={["superadmin"]}>
                <SecurityGroups />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="Assumption"
            element={
              <RoleProtectedRoute allowedRoles={["superadmin"]}>
                <Assumption />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="AssumptionBuilder"
            element={
              <RoleProtectedRoute allowedRoles={["superadmin"]}>
                <AssumptionBuilder />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="AssumptionBuilder/:id"
            element={
              <RoleProtectedRoute allowedRoles={["superadmin"]}>
                <AssumptionBuilder />
              </RoleProtectedRoute>
            }
          />

          {/* <Route path="profile" element={<Profile />} /> */}
          {/* <Route path="settings" element={<Settings />} /> */}
        </Route>

        {/* PDF View Route - Outside AppLayout (no navbar/sidebar) */}
        {/* <Route
          path="/app/transfer-pdf"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["superadmin"]} allowedLevels={[1]}>
                <TransferPDFView />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/app/table-view-pdf"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute
                allowedRoles={["superadmin"]}
                allowedLevels={[1]}
              >
                <TableViewPDF />
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
