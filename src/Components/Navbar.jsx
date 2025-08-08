import React, { useState, useEffect, useRef } from "react";
import { FaCog, FaBell, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userData, setUserData] = useState({
    name: "User",
    email: "",
    roles: [],
    _id: "",
    company: "",
  });
  const [averageRating, setAverageRating] = useState(null);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const fetchApiLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userData._id) {
        setError("Missing token or user ID");
        return;
      }
      const response = await fetch(
        `${API_BASE_URL}/api/issues/${userData._id}/activities`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Response: ${errorText}`
        );
      }
      const data = await response.json();
      console.log(data);
      setNotifications(data.logs || []);
      setUnreadCount(data.unreadCount || 0);
      setError(null);
    } catch (error) {
      console.error("Error fetching API logs:", error);
      setError(error.message);
      setNotifications([]);
    }
  };

  useEffect(() => {
    if (userData._id) {
      fetchApiLogs();
      const interval = setInterval(() => {
        fetchApiLogs();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [userData._id]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUserData({
      name: "User",
      email: "",
      roles: [],
      _id: "",
    });
    setShowProfileModal(false);
    navigate("/");
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user) {
          setUserData({
            name: user.name || "User",
            email: user.email || "",
            roles: user.roles || [],
            _id: user._id || "",
            company: user.company || "",
          });
        }
      } catch (err) {
        console.error("Failed to parse user data:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (userData._id) {
      const fetchAverageRating = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(
            `${API_BASE_URL}/api/issues/ratings/${userData._id}/average`,
            {
              headers: {
                Authorization: token ? `Bearer ${token}` : undefined,
                "Content-Type": "application/json",
              },
            }
          );
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Non-JSON response received:", text);
            throw new Error("Response is not JSON");
          }
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          setAverageRating(data.averageRating || "N/A");
        } catch (err) {
          console.log("Error fetching average rating:", err);
          setAverageRating("N/A");
        }
      };
      fetchAverageRating();
    }
  }, [userData._id]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showProfileModal) setShowProfileModal(false);
  };

  const toggleProfileModal = () => {
    setShowProfileModal(!showProfileModal);
    if (showNotifications) setShowNotifications(false);
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userData._id) {
        setError("Missing token or user ID");
        return;
      }
      const response = await fetch(
        `${API_BASE_URL}/api/issues/activities/mark-all-as-read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Response: ${errorText}`
        );
      }
      fetchApiLogs();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      setError(error.message);
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} mins ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return `${diffInDays} days ago`;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="text-white p-4 flex justify-between items-center shadow-lg w-full bg-primary">
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-semibold">
          Welcome, {userData.name} to BUGBUSTER
        </h1>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-6">
          <div className="cursor-pointer hover:text-blue-300 transition-colors duration-200">
            <FaCog className="text-xl" />
          </div>

          <div className="relative">
            <div
              className="cursor-pointer hover:text-blue-300 transition-colors duration-200"
              onClick={toggleNotifications}
            >
              <FaBell className="text-xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>

            {showNotifications && (
              <div
                ref={notificationRef}
                className="absolute right-0 mt-3 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20"
              >
                <div className="px-4 py-3 text-gray-800 flex justify-between border-b border-gray-200">
                  <h3 className="font-semibold">Activity Feed</h3>
                  <button
                    onClick={markAllAsRead}
                    className="text-sm cursor-pointer text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="py-2">
                  <div className="flex border-b border-gray-200">
                    <button className="flex-1 px-2 py-2 text-gray-800 border-b-2 border-blue-500">
                      Activities
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white rounded-full px-2 ml-1 text-xs">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {error && (
                      <div className="px-4 py-2 text-red-600 text-sm">
                        Error: {error}
                      </div>
                    )}

                    {notifications.length === 0 && !error ? (
                      <div className="px-4 py-8 text-center text-gray-500">
                        No notifications available
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`flex items-start py-4 px-4 border-b border-gray-200 hover:bg-gray-50 ${
                            notification?.read?.includes(userData._id)
                              ? "opacity-70"
                              : ""
                          }`}
                        >
                          <div className="relative mr-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                              {notification.performedBy?.name?.charAt(0) || "U"}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <span className="font-medium text-gray-800 text-sm">
                                {notification.performedBy?.name ||
                                  "Unknown User"}
                              </span>
                              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {notification.action}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTime(notification.performedAt)}
                            </p>
                          </div>
                          {!notification?.read?.includes(userData._id) && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="h-9 border-l border-white opacity-50"></div>

        <div className="relative">
          <div
            className="cursor-pointer hover:text-blue-300 transition-colors duration-200"
            onClick={toggleProfileModal}
          >
            <FaUserCircle className="text-2xl" />
          </div>

          {showProfileModal && (
            <div
              ref={profileRef}
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl overflow-hidden border border-white z-20 text-gray-800"
            >
              <div className="p-3 flex items-center bg-primary">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">
                  {userData.name.charAt(0)}
                </div>
                <div className="ml-2">
                  <div className="font-semibold text-base text-white">
                    {userData.name}
                  </div>
                  <div className="text-xs text-white/80">
                   <span className="font-bold text-white">Company:</span> {userData.company}
                  </div>
                  <div className="text-xs text-white/80">
                    <span className="font-bold text-white">Roles:</span> {userData.roles.join(", ") || "No roles"}
                  </div>
                  <div className="text-xs text-white/80 truncate">
                    <span className="font-bold text-white">Email:</span> {userData.email}
                  </div>
                  <div className="text-xs text-white/80 flex items-center">
                    <span className="font-bold text-white mr-1">Rating:</span>
                    <div className="flex items-center space-x-[2px]">
                      {[...Array(5)].map((_, i) => {
                        const rating =
                          averageRating === "N/A"
                            ? 0
                            : parseFloat(averageRating);
                        const fillPercent =
                          i + 1 <= rating
                            ? 100
                            : i < rating
                            ? (rating - i) * 100
                            : 0;

                        return (
                          <div key={i} className="relative w-3 h-3">
                            {/* Gray base star */}
                            <svg
                              className="absolute top-0 left-0 w-full h-full text-gray-300"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 
              1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.357 
              2.44a1 1 0 00-.364 1.118l1.287 
              3.97c.3.921-.755 1.688-1.54 
              1.118l-3.357-2.44a1 1 0 00-1.175 
              0l-3.357 2.44c-.784.57-1.84-.197-1.54-1.118l1.287-3.97a1 
              1 0 00-.364-1.118L2.73 
              9.397c-.784-.57-.38-1.81.588-1.81h4.15a1 1 
              0 00.95-.69l1.286-3.97z"
                              />
                            </svg>

                            {/* Yellow clipped star */}
                            <svg
                              className="absolute top-0 left-0 w-full h-full text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              style={{
                                clipPath: `inset(0 ${100 - fillPercent}% 0 0)`,
                              }}
                            >
                              <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 
              1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.357 
              2.44a1 1 0 00-.364 1.118l1.287 
              3.97c.3.921-.755 1.688-1.54 
              1.118l-3.357-2.44a1 1 0 00-1.175 
              0l-3.357 2.44c-.784.57-1.84-.197-1.54-1.118l1.287-3.97a1 
              1 0 00-.364-1.118L2.73 
              9.397c-.784-.57-.38-1.81.588-1.81h4.15a1 1 
              0 00.95-.69l1.286-3.97z"
                              />
                            </svg>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-xs text-white/80 ml-2">
                      (<span>{averageRating}</span>)
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 h-[74px] flex items-center justify-center">
                <button
                  onClick={handleLogout}
                  className="w-60 bg-primary text-white py-2 px-4 text-base font-medium transition duration-200 rounded-3xl mb-4 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
