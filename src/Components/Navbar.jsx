import React, { useState, useEffect } from "react";
import { FaCog, FaBell, FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userData, setUserData] = useState({
    name: "User",
    email: "",
    roles: [],
    _id: "",
  });
  const [averageRating, setAverageRating] = useState(null);

  const API_BASE_URL = "https://bug-buster-backend.vercel.app";

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
          console.error("Error fetching average rating:", err);
          setAverageRating("N/A");
        }
      };
      fetchAverageRating();
    }
  }, [userData._id]);

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
    if (showProfileModal) setShowProfileModal(false);
  };

  const toggleProfileModal = () => {
    setShowProfileModal(!showProfileModal);
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

        <div className="h-9 border-l border-white opacity-50"></div>

        <div className="relative">
          <div
            className="cursor-pointer hover:text-blue-300 transition-colors duration-200"
            onClick={toggleProfileModal}
          >
            <FaUserCircle className="text-2xl" />
          </div>

          {showProfileModal && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl overflow-hidden border border-white z-20 text-gray-800">
              <div className="p-3 flex items-center bg-primary">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">
                  {userData.name.charAt(0)}
                </div>
                <div className="ml-2">
                  <div className="font-semibold text-base text-white">
                    {userData.name}
                  </div>
                  <div className="text-xs text-white/80">
                    {userData.roles.join(", ") || "No roles"}
                  </div>
                  <div className="text-xs text-white/80 truncate">
                    {userData.email}
                  </div>
                  <div className="text-xs text-white/80 flex items-center">
                    <span className="mr-1">Rating:</span>
                    {[...Array(5)].map((_, i) => {
                      const rating =
                        averageRating === "N/A" ? 0 : parseFloat(averageRating);
                      return (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(rating)
                              ? "text-yellow-400"
                              : i < rating && rating % 1 >= 0.5
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill={
                            i < Math.floor(rating) ||
                            (i < rating && rating % 1 >= 0.5)
                              ? "currentColor"
                              : "none"
                          }
                          stroke={
                            i < rating &&
                            rating % 1 >= 0.5 &&
                            i === Math.floor(rating)
                              ? "currentColor"
                              : "none"
                          }
                          viewBox="0 0 20 20"
                        >
                          {i < rating &&
                          rating % 1 >= 0.5 &&
                          i === Math.floor(rating) ? (
                            <path d="M10 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.357-2.44a1 1 0 00-.588-.176V2.927z" />
                          ) : (
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.357-2.44a1 1 0 00-1.175 0l-3.357 2.44c-.784.57-1.84-.197-1.54-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.73 9.397c-.784-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.97z" />
                          )}
                        </svg>
                      );
                    })}

                    <div className="text-xs text-white/80 ml-2">
                      (<span>{averageRating}</span>)
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 h-[74px] flex items-center justify-center ">
                <button className="w-60 bg-primary text-white hover:bg-primary/80 py-2 px-4 text-base font-medium transition duration-200 rounded-3xl mb-4">
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
