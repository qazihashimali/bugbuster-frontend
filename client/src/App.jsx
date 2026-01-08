import React, { useState } from "react";
import "./index.css";
import Sidebar from "./Components/Sidebar";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Auth from "./Pages/Login";
import { Route, Routes, useLocation } from "react-router-dom";
import appRoutes from "./Routes";
import { Toaster } from "react-hot-toast";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const isAuthPage = location.pathname === "/";
  const token = localStorage.getItem("token");
  if (!token) {
    return (
      <>
        <Toaster position="top-right" />
        <Auth />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen  w-full flex flex-col sm:flex-row">
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

        <div className="flex-1 flex flex-col w-full sm:w-[75%] mx-auto">
          {!isAuthPage && <Navbar />}

          <main className="flex-1 overflow-y-auto bg-gray-100">
            <Routes>
              {appRoutes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}
            </Routes>
          </main>

          {!isAuthPage && <Footer />}
        </div>
      </div>
    </>
  );
}

export default App;
