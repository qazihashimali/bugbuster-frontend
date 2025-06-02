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

  const isAuthPage = location.pathname === "/";
  const token = localStorage.getItem("token");
  if (!token) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col sm:flex-row">
      {/* Sidebar */}
      {!isAuthPage && (
        <Sidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onLogout={handleLogout}
          className={`fixed sm:static inset-y-0 left-0 z-50 w-64 sm:w-64 bg-white transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } sm:translate-x-0 transition-transform duration-300 ease-in-out`}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full sm:w-[75%] mx-auto">
        {!isAuthPage && <Navbar />}

        <main className="flex-1 overflow-y-auto bg-gray-100">
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
        </main>

        {!isAuthPage && <Footer />}
      </div>
    </div>
  );
}

export default App;
