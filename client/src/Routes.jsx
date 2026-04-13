import Dashboard from "./Pages/Dashboard/Dashboard";
import IssueDesk from "./Pages/Dashboard/IssueDesk";
import Branch from "./Pages/Dashboard/Branch";
import Department from "./Pages/Dashboard/Department";
import Block from "./Pages/Dashboard/Block";
import Mytasks from "./Pages/Dashboard/Mytasks";
import Assignedtasks from "./Pages/Dashboard/Assignedtasks";
import Users from "./Pages/Dashboard/Users";
import DeletedLogs from "./Pages/Dashboard/DeletedLogs";
import Feedback from "./Pages/Dashboard/Feedback";
import Reviews from "./Pages/Dashboard/Reviews";
import AddDescriptions from "./Pages/Dashboard/AddDescriptions";
import Auth from "./Pages/Login";
import Company from "./Pages/Dashboard/Company";
import MyTeam from "./Pages/Dashboard/MyTeam";
import AddDailyTasks from "./Pages/Dashboard/AddDailyTasks";
import ViewDailyTasks from "./Pages/Dashboard/ViewDailyTasks";
import ProtectedRoute from "./ProtectedRoute";
import { ROLES } from "./Configs/Roles";

const appRoutes = [
  { path: "/", element: <Auth /> },

  {
    path: "/dashboard",
    element: (
      <ProtectedRoute
        allowedRoles={[
          ROLES.SUPER_ADMIN,
          ROLES.ADMIN,
          ROLES.END_USER,
          ROLES.SERVICE_PROVIDER,
        ]}
      >
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/issue-desk",
    element: (
      <ProtectedRoute
        allowedRoles={[
          ROLES.SUPER_ADMIN,
          ROLES.ADMIN,
          ROLES.END_USER,
          ROLES.SERVICE_PROVIDER,
        ]}
      >
        <IssueDesk />
      </ProtectedRoute>
    ),
  },
  {
    path: "/branch",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
        <Branch />
      </ProtectedRoute>
    ),
  },
  {
    path: "/department",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
        <Department />
      </ProtectedRoute>
    ),
  },
  {
    path: "/block",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
        <Block />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-tasks",
    element: (
      <ProtectedRoute
        allowedRoles={[
          ROLES.SUPER_ADMIN,
          ROLES.ADMIN,
          ROLES.END_USER,
          ROLES.SERVICE_PROVIDER,
        ]}
      >
        <Mytasks />
      </ProtectedRoute>
    ),
  },
  {
    path: "/assigned-tasks",
    element: (
      <ProtectedRoute
        allowedRoles={[
          ROLES.SUPER_ADMIN,
          ROLES.ADMIN,
          ROLES.END_USER,
          ROLES.SERVICE_PROVIDER,
        ]}
      >
        <Assignedtasks />
      </ProtectedRoute>
    ),
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
        <Users />
      </ProtectedRoute>
    ),
  },
  {
    path: "/deleted-logs",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
        <DeletedLogs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/feedback",
    element: (
      <ProtectedRoute
        allowedRoles={[
          ROLES.SUPER_ADMIN,
          ROLES.ADMIN,
          ROLES.END_USER,
          ROLES.SERVICE_PROVIDER,
        ]}
      >
        <Feedback />
      </ProtectedRoute>
    ),
  },
  {
    path: "/reviews",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
        <Reviews />
      </ProtectedRoute>
    ),
  },
  {
    path: "/add-descriptions",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
        <AddDescriptions />
      </ProtectedRoute>
    ),
  },
  {
    path: "/companies",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
        <Company />
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-team",
    element: (
      <ProtectedRoute
        allowedRoles={[
          ROLES.SUPER_ADMIN,
          ROLES.ADMIN,
          ROLES.END_USER,
          ROLES.SERVICE_PROVIDER,
        ]}
      >
        <MyTeam />
      </ProtectedRoute>
    ),
  },
  {
    path: "/add-tasks",
    element: (
      <ProtectedRoute
        allowedRoles={[
          ROLES.SUPER_ADMIN,
          ROLES.ADMIN,
          ROLES.END_USER,
          ROLES.SERVICE_PROVIDER,
        ]}
      >
        <AddDailyTasks />
      </ProtectedRoute>
    ),
  },
  {
    path: "/view-tasks",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
        <ViewDailyTasks />
      </ProtectedRoute>
    ),
  },
];

export default appRoutes;
