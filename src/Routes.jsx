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

const appRoutes = [
  { path: "/", element: <Auth /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/issue-desk", element: <IssueDesk /> },
  { path: "/branch", element: <Branch /> },
  { path: "/department", element: <Department /> },
  { path: "/block", element: <Block /> },
  { path: "/my-tasks", element: <Mytasks /> },
  { path: "/assigned-tasks", element: <Assignedtasks /> },
  { path: "/users", element: <Users /> },
  { path: "/deleted-logs", element: <DeletedLogs /> },
  { path: "/feedback", element: <Feedback /> },
  { path: "/reviews", element: <Reviews /> },
  { path: "/add-descriptions", element: <AddDescriptions /> },
  { path: "/companies", element: <Company /> },

];

export default appRoutes;
