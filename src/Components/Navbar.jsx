import React, { useState, useEffect } from "react";
import {
  FaCog,
  FaBell,
  FaUserCircle,
  FaUserAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { RiColorFilterFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userName, setUserName] = useState("User"); // Default fallback name
  const navigate = useNavigate();

  // Retrieve user name from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.name) {
          setUserName(user.name);
        }
      } catch (err) {
        console.error('Failed to parse user data:', err);
      }
    }
  }, []);

  const notifications = [
    {
      id: 1,
      user: "Polly",
      avatar:
        "https://img.freepik.com/free-photo/waist-up-portrait-handsome-serious-unshaven-male-keeps-hands-together-dressed-dark-blue-shirt-has-talk-with-interlocutor-stands-against-white-wall-self-confident-man-freelancer_273609-16320.jpg",
      message: "Polly's license is expired",
      time: "6 mins ago",
      isOnline: true,
      hasAction: false,
    },
    {
      id: 2,
      user: "Charlie",
      avatar: "https://img.freepik.com/free-photo/artist-white_1368-3546.jpg",
      message: "Charlie's license is expired",
      time: "10 mins ago",
      isOnline: true,
      hasAction: false,
    },
    {
      id: 3,
      user: "Tom",
      avatar:
        "https://img.freepik.com/free-photo/portrait-friendly-looking-happy-attractive-male-model-with-moustache-beard-wearing-trendy-transparent-glasses-smiling-broadly-while-listening-interesting-story-waiting-mom-give-meal_176420-22400.jpg",
      message: "Tom send you Approval Request",
      time: "36 mins ago",
      isOnline: true,
      hasAction: true,
    },
    {
      id: 4,
      user: "Ketty",
      avatar: null,
      message: "Ketty's license is renewed",
      time: "36 mins ago",
      isOnline: false,
      hasAction: false,
    },
  ];

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showProfileDropdown) setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showNotifications) setShowNotifications(false);
  };

  const markAllAsRead = () => {
    console.log("Marked all as read");
  };

  const handleAccept = (id) => {
    console.log(`Accepted notification ${id}`);
  };

  const handleDecline = (id) => {
    console.log(`Declined notification ${id}`);
  };

  const viewAllNotifications = () => {
    console.log("View all notifications");
  };

  const handleProfileClick = () => {
    console.log("Navigate to profile");
  };

  const handleLogout = () => {
    console.log("Logout");
    navigate("/")
    
  };

  return (
    <div className="text-white p-4 flex justify-between items-center shadow-lg w-full bg-primary">
      {/* Left Side */}
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-semibold">
          Welcome, {userName} to BUGBUSTER
        </h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-6">
        {/* Icons Group */}
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
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </div>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
                <div className="px-4 py-3 text-gray-800 flex justify-between border-b border-gray-200">
                  <h3 className="font-semibold">Mention List</h3>
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="py-2">
                  <div className="flex border-b border-gray-200">
                    <button className="flex-1 px-2 py-2 text-gray-800 border-b-2 border-blue-500">
                      Inbox
                      <span className="bg-red-500 text-white rounded-full px-2 ml-1 text-xs">
                        3
                      </span>
                    </button>
                    <button className="flex-1 px-2 py-2 text-gray-600">
                      General
                      <span className="bg-red-500 text-white rounded-full px-2 ml-1 text-xs">
                        1
                      </span>
                    </button>
                    <button className="flex-1 px-2 py-2 text-gray-600">
                      Archived
                    </button>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start py-4 px-4 border-b border-gray-200 hover:bg-gray-50"
                      >
                        <div className="relative mr-3">
                          {notification.avatar ? (
                            <img
                              src={notification.avatar}
                              alt={notification.user}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-500">
                              {notification.user.charAt(0)}
                            </div>
                          )}
                          {notification.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {notification.message}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.time}
                          </p>
                          {notification.hasAction && (
                            <div className="flex mt-3 space-x-2">
                              <button
                                onClick={() => handleDecline(notification.id)}
                                className="px-4 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 text-sm"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleAccept(notification.id)}
                                className="px-4 py-1 bg-blue-900 text-white rounded-md hover:bg-blue-800 text-sm"
                              >
                                Accept
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
                      </div>
                    ))}
                  </div>

                  <div
                    className="text-center py-3 text-gray-700 hover:text-gray-900 cursor-pointer border-t border-gray-200"
                    onClick={viewAllNotifications}
                  >
                    <span>All Notifications →</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vertical Separator */}
        <div className="h-9 border-l border-white opacity-50"></div>

        {/* Profile Dropdown */}
        <div className="relative">
          <div
            className="cursor-pointer hover:text-blue-300 transition-colors duration-200"
            onClick={toggleProfileDropdown}
          >
            <FaUserCircle className="text-2xl" />
          </div>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20">
              <div className="py-1">
                <button
                  onClick={handleProfileClick}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FaUserAlt className="mr-3 text-gray-500" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <FaSignOutAlt className="mr-3 text-gray-500" />
                  <span>Logout</span>
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