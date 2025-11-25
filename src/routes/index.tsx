import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { TanfeezLoader } from "../components/ui";
import ProtectedRoute from "../components/ProtectedRoute";
import RoleProtectedRoute from "../components/RoleProtectedRoute";
import Transfer from "@/pages/dashboard/Transfer";
import TransferDetails from "@/pages/dashboard/TransferDetails";
import FundRequests from "@/pages/dashboard/FundRequests";
import FundRequestsDetails from "@/pages/dashboard/FundRequestsDetails";
import FundAdjustments from "@/pages/dashboard/FundAdjustments";
import FundAdjustmentsDetails from "@/pages/dashboard/FundAdjustmentsDetails";
import PendingTransfer from "@/pages/dashboard/PendingTransfer";
import PendingTransferDetails from "@/pages/dashboard/PendingTransferDetails";
import PendingAdjustments from "@/pages/dashboard/PendingAdjustments";
import PendingAdjustmentsDetails from "@/pages/dashboard/PendingAdjustmentsDetails";
import PendingRequests from "@/pages/dashboard/PendingRequests";
import PendingRequestsDetails from "@/pages/dashboard/PendingRequestsDetails";
// import ProjectsOverview from "@/pages/dashboard/ProjectsOverview";F
// import AccountsProjects from "@/pages/dashboard/AccountsProjects";
import Users from "@/pages/dashboard/Users";
import Reports from "@/pages/dashboard/Reports";
import AddWorkFlow from "@/pages/dashboard/AddWorkFlow";
import WorkFlow from "@/pages/dashboard/WorkFlow";
// import Envelope from "@/pages/dashboard/Envelope";
import Chat from "@/pages/dashboard/Chat";
// import DocumentIO from "@/pages/dashboard/DocumentIO";
import InvoiceDetails from "@/pages/dashboard/InvoiceDetails";
import UploadInvoice from "@/pages/dashboard/UploadInvoice";
import SegmentConfiguration from "@/pages/dashboard/SegmentConfiguration";

const SignIn = lazy(() => import("../pages/auth/SignIn"));
const AppLayout = lazy(() => import("../components/layout/AppLayout"));
const Home = lazy(() => import("../pages/dashboard/Home"));
const DashboardDetails = lazy(
  () => import("../pages/dashboard/DashboardDetails")
);

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

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/app" />} />
        <Route path="*" element={<Navigate to="/app" />} />
      </Routes>
    </Suspense>
  );
}
