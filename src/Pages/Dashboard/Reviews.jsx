import React, { useState, useEffect } from "react";
import { FaEye, FaTimes } from "react-icons/fa";
import { FaStar, FaStarHalfStroke } from "react-icons/fa6";
import Loading from "../../Components/Loading";

const Alert = ({ type, message, onClose }) => {
  const alertStyles = {
    success: "bg-blue-100 border-blue-500 text-blue-700", // Updated to match Feedback component
    error: "bg-red-100 border-red-500 text-red-700",
  };

  return (
    <div
      className={`border-l-4 p-4 mb-4 flex justify-between items-center ${alertStyles[type]}`}
    >
      <p>{message}</p>
      <button onClick={onClose} className="text-gray-700 hover:text-gray-900">
        <FaTimes />
      </button>
    </div>
  );
};

const Reviews = () => {
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const showAlert = (type, message) => {
    if (type === "success") {
      setSuccess(message);
      setError("");
    } else {
      setError(message);
      setSuccess("");
    }
    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 5000);
  };

  const renderStars = (rating) => {
    if (rating === null || rating === undefined || rating === 0) {
      return (
        <div className="flex justify-center p-2 rounded-md">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar key={star} className="w-4 h-4 text-gray-300 mx-1" />
          ))}
        </div>
      );
    }
    return (
      <div className="flex justify-center p-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const starValue = star;
          if (rating >= starValue) {
            return (
              <FaStar key={starValue} className="w-4 h-4 text-[#FFD700] mx-1" />
            );
          } else if (rating >= starValue - 0.5) {
            return (
              <FaStarHalfStroke
                key={starValue}
                className="w-4 h-4 text-[#FFD700] mx-1"
              />
            );
          } else {
            return (
              <FaStar key={starValue} className="w-4 h-4 text-gray-300 mx-1" />
            );
          }
        })}
      </div>
    );
  };

  const fetchIssues = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const userData = localStorage.getItem("user");
      if (!userData) throw new Error("No user data found");

      const user = JSON.parse(userData);
      const isAdmin =
        user.roles?.includes("Admin") || user.roles?.includes("SuperAdmin");

      // Conditionally set the API endpoint based on user role
      const endpoint = isAdmin
        ? "https://bug-buster-backend.vercel.app/api/feedback"
        : `https://bug-buster-backend.vercel.app/api/feedback?user=${user._id}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch feedback: ${text}`);
      }

      const data = await response.json();
      setIssues(Array.isArray(data) ? data : []);

      if (Date.now() - start < 2000) {
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
      }
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  return (
    <div className="relative container mx-auto p-6 bg-gray-100 min-h-screen">
      <div
        className={`bg-white shadow-md rounded-lg ${
          isLoading ? "blur-sm" : ""
        }`}
      >
        <div className="bg-primary text-white p-4 rounded-t-lg">
          <h1 className="text-2xl font-bold">Reviews</h1>
        </div>

        {(error || success) && (
          <div className="p-6">
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError("")}
              />
            )}
            {success && (
              <Alert
                type="success"
                message={success}
                onClose={() => setSuccess("")}
              />
            )}
          </div>
        )}

        <div className="p-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-primary text-white p-3">
              <h2 className="text-lg font-semibold">Details</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">User Name</th>
                  <th className="p-3 text-left">Branch</th>
                  <th className="p-3 text-left">Department</th>
                  <th className="p-3 text-left">Feedback To</th>
                  <th className="p-3 text-left">Feedback</th>
                  <th className="p-3 text-left">Rating</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="7" className="p-3 text-center">
                      No feedback found.
                    </td>
                  </tr>
                )}
                {issues.map((issue) => (
                  <tr key={issue._id}>
                    <td className="p-3">{issue.userName || "N/A"}</td>
                    <td className="p-3">
                      {issue.branch
                        ? `${issue.branch.branchName} (${issue.branch.branchCode})`
                        : "N/A"}
                    </td>
                    <td className="p-3">
                      {issue.department
                        ? `${issue.department.departmentName} (${issue.department.departmentCode})`
                        : "N/A"}
                    </td>
                    <td className="p-3">
                      {issue.feedbackTo
                        ? `${issue.feedbackTo.name} (${issue.feedbackTo.email})`
                        : "N/A"}
                    </td>
                    <td className="p-3 max-w-xs truncate">
                      {issue.feedback || "N/A"}
                    </td>
                    <td className="p-3">{renderStars(issue.rating)}</td>
                    <td className="p-3 flex justify-center">
                      <button
                        onClick={() => handleViewIssue(issue)}
                        className="text-orange-600 hover:text-orange-800"
                        title="View"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isLoading && <Loading fullscreen />}

      {isModalOpen && selectedIssue && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
        >
          <div className="bg-white rounded-lg p-6 w-[32rem] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">View Feedback</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FaTimes />
              </button>
            </div>
            <div>
              <p className="mb-2">
                <strong>User Name:</strong> {selectedIssue.userName || "N/A"}
              </p>
              <p className="mb-2">
                <strong>Feedback:</strong> {selectedIssue.feedback || "N/A"}
              </p>
              <p className="mb-2">
                <strong>Feedback To:</strong>{" "}
                {selectedIssue.feedbackTo
                  ? `${selectedIssue.feedbackTo.name} (${selectedIssue.feedbackTo.email})`
                  : "N/A"}
              </p>
              <p className="mb-2">
                <strong>Branch:</strong>{" "}
                {selectedIssue.branch
                  ? `${selectedIssue.branch.branchName} (${selectedIssue.branch.branchCode})`
                  : "N/A"}
              </p>
              <p className="mb-2">
                <strong>Department:</strong>{" "}
                {selectedIssue.department
                  ? `${selectedIssue.department.departmentName} (${selectedIssue.department.departmentCode})`
                  : "N/A"}
              </p>
              <p className="mb-2">
                <strong>Rating:</strong> {renderStars(selectedIssue.rating)}
              </p>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;