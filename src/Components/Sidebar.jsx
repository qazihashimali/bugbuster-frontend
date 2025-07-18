import React, { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaBuilding,
  FaProjectDiagram,
  FaQuestionCircle,
  FaSignOutAlt,
  FaRegArrowAltCircleLeft,
  FaRegArrowAltCircleRight,
  FaTasks,
  FaUsers,
  FaCommentMedical,
  FaCommentDots,
} from "react-icons/fa";
import {
  MdDashboard,
  MdDeleteSweep,
  MdDescription,
  MdFeedback,
  MdReviews,
} from "react-icons/md";
import { LuBlocks, LuGitBranchPlus } from "react-icons/lu";
import { SiGoogletasks } from "react-icons/si";
import { useNavigate, useLocation } from "react-router-dom";
import { RiBug2Fill } from "react-icons/ri";
import { BsFillBugFill } from "react-icons/bs";
import { TiThList } from "react-icons/ti";

const Sidebar = ({ isOpen, setIsOpen, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeRoute, setActiveRoute] = useState(location.pathname);
  const [userRole, setUserRole] = useState(null);

  // Load user data from localStorage on component mount
  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setUserRole(user.roles); // ["Admin", "EndUser"] or ["SuperAdmin"]
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  // Define all menu items
  const allMenuItems = [
    {
      name: "Dashboard",
      icon: <MdDashboard />,
      route: "/dashboard",
      allowedRoles: ["SuperAdmin", "Admin", "EndUser", "ServiceProvider"], // All roles can access
    },
    {
      name: "Branch",
      icon: <LuGitBranchPlus />,
      route: "/branch",
      allowedRoles: ["Admin", "SuperAdmin"], // Only Admin can access
    },
    {
      name: "Department",
      icon: <FaBuilding />,
      route: "/department",
      allowedRoles: ["Admin", "SuperAdmin"], // Only Admin can access
    },
    // {
    //   name: "Block",
    //   icon: <LuBlocks />,
    //   route: "/block",
    //   allowedRoles: ["Admin", "SuperAdmin"], // Only Admin can access
    // },
    {
      name: "Issue Desk",
      icon: <BsFillBugFill />,
      route: "/issue-desk",
      allowedRoles: ["Admin", "EndUser", "ServiceProvider", "SuperAdmin"], // All roles can access
    },
    {
      name: "Feedback",
      icon: <FaCommentMedical />,
      route: "/feedback",
      allowedRoles: ["Admin", "EndUser", "ServiceProvider", "SuperAdmin"], // All roles can access
    },
    {
      name: "Reviews",
      icon: <FaCommentDots />,
      route: "/reviews",
      allowedRoles: ["Admin", "SuperAdmin"], // All roles can access
    },
    {
      name: "My Tasks",
      icon: <TiThList />,
      route: "/my-tasks",
      allowedRoles: ["Admin", "EndUser", "ServiceProvider", "SuperAdmin"], // All roles can access
    },
    {
      name: "Assigned Tasks",
      icon: <SiGoogletasks />,
      route: "/assigned-tasks",
      allowedRoles: ["Admin", "EndUser", "ServiceProvider", "SuperAdmin"], // All roles can access
    },
    {
      name: "Users",
      icon: <FaUsers />,
      route: "/users",
      allowedRoles: ["SuperAdmin"], // All roles can access
    },
    {
      name: "Deleted Logs",
      icon: <MdDeleteSweep />,
      route: "/deleted-logs",
      allowedRoles: ["SuperAdmin"], // All roles can access
    },
    // {
    //   name: "Add Descriptions",
    //   icon: <MdDescription />,
    //   route: "/add-descriptions",
    //   allowedRoles: ["SuperAdmin"], // All roles can access
    // },
    {
      name: "Logout",
      icon: <FaSignOutAlt />,
      route: "/logout",
      allowedRoles: ["Admin", "EndUser", "ServiceProvider", "SuperAdmin"], // All roles can access
    },
    
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(
    (item) =>
      !userRole || // If user role not loaded yet, show all items temporarily
      item.allowedRoles.some((role) => userRole.includes(role))
  );

  const handleNavigation = (route) => {
    if (route === "/logout") {
      if (onLogout) {
        onLogout();
      }
      navigate("/", { replace: true });
    } else {
      setActiveRoute(route);
      navigate(route);
    }
  };

  useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location.pathname]);
  

  return (
    <>
      <div
        className={`fixed h-full text-white min-h-screen transition-all ease-in-out duration-300 shadow-lg ${
          isOpen ? "w-64" : "w-16"
        } flex flex-col bg-primary`}
      >
        <div
          className={`flex items-center ${
            isOpen ? "justify-between" : "justify-center"
          } p-4 cursor-pointer rounded-lg mx-2 transition-colors duration-200`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen && (
            <img
              src="logo (2).png"
              className="w-20 h-10 align-center ml-10"
              alt="logo"
            />
          )}
          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            {isOpen ? (
              <FaRegArrowAltCircleLeft className="w-8 h-8" />
            ) : (
              <FaRegArrowAltCircleRight className="w-8 h-8" />
            )}
          </div>
        </div>

        <nav className="flex-1 mt-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center p-3 mx-2 my-1 rounded-lg cursor-pointer transition-colors duration-200 
                ${
                  activeRoute === item.route
                    ? "bg-white text-primary"
                    : "text-white menu-item hover:bg-white/10"
                }`}
              onClick={() => handleNavigation(item.route)}
            >
              <span
                className={`text-lg flex-shrink-0 mr-3 
                ${activeRoute === item.route ? "text-primary" : ""}`}
              >
                {item.icon}
              </span>
              {isOpen && <span className="font-medium">{item.name}</span>}
            </div>
          ))}
        </nav>
      </div>
      <div
        className={`transition-all duration-300 ${isOpen ? "ml-64" : "ml-16"}`}
      ></div>
    </>
  );
};

export default Sidebar;
