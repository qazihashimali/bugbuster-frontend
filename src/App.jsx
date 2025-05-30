import React, { useState } from "react";
import "./index.css";
import Sidebar from "./Components/Sidebar";
import Navbar from "./Components/Navbar";
import Dashboard from "./Pages/Dashboard/Dashboard";
import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./Components/Footer";
import IssueDesk from "./Pages/IssueDesk";
import Branch from "./Pages/Dashboard/Branch";
import Department from "./Pages/Dashboard/Department";
import Auth from "./Pages/Login";
import Block from "./Pages/Dashboard/Block";
import Mytasks from "./Pages/Dashboard/Mytasks";
import Assignedtasks from "./Pages/Dashboard/Assignedtasks";
import Users from "./Pages/Users";
import DeletedLogs from "./Pages/DeletedLogs";
import Feedback from "./Pages/Dashboard/Feedback";
import Reviews from "./Pages/Dashboard/Reviews";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
  };

  // Check if current route is the login/signup page
  const isAuthPage = location.pathname === "/";
  const token = localStorage.getItem("token");
  if (!token) {
    return <Auth />;
  }
  
  return (
    <div className="min-h-screen w-screen flex">
      {/* Conditional Sidebar Rendering */}
      {!isAuthPage && (
        <Sidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onLogout={handleLogout}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${!isAuthPage ? "" : "w-full"}`}>
        {!isAuthPage && <Navbar />}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/issue-desk" element={<IssueDesk />} />
            <Route path="/branch" element={<Branch />} />
            <Route path="/department" element={<Department />} />
            <Route path="/block" element={<Block />} />
            <Route path="/my-tasks" element={<Mytasks />} />
            <Route path="/assigned-tasks" element={<Assignedtasks />} />
            <Route path="/users" element={<Users />} />
            <Route path="/deleted-logs" element={<DeletedLogs />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/reviews" element={<Reviews />} />





          </Routes>
        </div>

        {!isAuthPage && <Footer />}
      </div>
    </div>
  );
}

export default App;
