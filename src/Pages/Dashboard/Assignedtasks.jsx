
import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import Loading from "../../Components/Loading";

const Assignedtasks = () => {
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    description: "",
    status: "pending",
    priority: "Medium",
  });

  const statusDisplay = {
    pending: "Pending",
    "in-progress": "In Progress",
    resolved: "Resolved",
  };

  const fetchIssues = async () => {
    setIsLoading(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      if (!token || !user?._id) {
        throw new Error(
          "No authentication token or user ID found. Please log in again."
        );
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues?createdBy=${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error(
          "Response status:",
          response.status,
          "Response text:",
          text
        );
        throw new Error(
          `Failed to fetch issues: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const filteredIssues = Array.isArray(data) ? data : data.issues || [];
      setIssues(filteredIssues);
      
      if (Date.now() - start < 2000)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditIssue = (issue) => {
    setSelectedIssue(issue);
    setFormData({
      userName: issue.userName,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      if (!token) throw new Error("No authentication token found");

      if (
        user._id !== selectedIssue.createdBy._id.toString() &&
        user.email !== "Admin@gmail.com"
      ) {
        throw new Error("Unauthorized to update this issue");
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues/${selectedIssue._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update issue");

      if (!data.issue) throw new Error("Invalid response: issue data missing");
      setIssues(
        issues.map((i) => (i._id === selectedIssue._id ? data.issue : i))
      );
      setIsModalOpen(false);
      setFormData({
        userName: "",
        description: "",
        status: "pending",
        priority: "Medium",
      });
      if (Date.now() - start < 2000)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIssue = async (issue) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    setError("");
    setIsSubmitting(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      if (!token) throw new Error("No authentication token found");

      if (
        user._id !== issue.createdBy._id.toString() &&
        user.email !== "Admin@gmail.com"
      ) {
        throw new Error("Unauthorized to delete this issue");
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues/${issue._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to delete issue");

      setIssues(issues.filter((i) => i._id !== issue._id));
      if (Date.now() - start < 2000)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const truncateDescription = (description) => {
    if (!description) return "";
    const words = description.trim().split(" ");
    if (words.length <= 2) return description;
    return `${words.slice(0, 2).join(" ")}...`;
  };

  return (
    <div
      className="relative container mx-auto p-3 sm:p-4 lg:p-6 bg-gray-100 min-h-screen"
      aria-busy={isLoading || isSubmitting}
    >
      <div
        className={`bg-white shadow-md rounded-lg ${
          isLoading || isSubmitting ? "blur-sm" : ""
        }`}
      >
        <div className="bg-primary text-white p-3 sm:p-4 rounded-t-lg">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
            Tasks Assigned to Others
          </h1>
        </div>

        {error && (
          <div className="p-3 sm:p-4 text-red-600 text-sm sm:text-base">
            {error}
          </div>
        )}

        <div className="p-3 sm:p-4 lg:p-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-primary text-white p-3">
              <h2 className="text-base sm:text-lg font-semibold">
                Issue Details
              </h2>
            </div>

            {/* Desktop Table View with Scrollbar */}
            <div className="hidden lg:block overflow-x-auto">
              <div className="min-w-[1000px]">
                <table className="w-full table-auto">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left text-sm font-medium">
                        Title
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        Description
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        Branch
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        Department
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        Status
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        Priority
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        Assigned To
                      </th>
                      <th className="p-3 text-center text-sm font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => (
                      <tr
                        key={issue._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="p-3 text-sm">{issue.userName}</td>
                        <td className="p-3 text-sm">
                          {truncateDescription(issue.description)}
                        </td>
                        <td className="p-3 text-sm">
                          {issue.branch?.branchName || "N/A"}
                        </td>
                        <td className="p-3 text-sm">
                          {issue.department?.departmentName || "N/A"}
                        </td>
                        <td className="p-3 text-sm">
                          {statusDisplay[issue.status] || issue.status}
                        </td>
                        <td className="p-3 text-sm">{issue.priority}</td>
                        <td className="p-3 text-sm">
                          {issue.assignedTo?.name || "N/A"}
                        </td>
                        <td className="p-3 flex justify-center space-x-2">
                          <button
                            onClick={() => handleViewIssue(issue)}
                            className="text-orange-600 hover:text-orange-800 p-1"
                          >
                            <FaEye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditIssue(issue)}
                            className="text-orange-600 hover:text-orange-800 p-1"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteIssue(issue)}
                            className="text-orange-600 hover:text-orange-800 p-1"
                          >
                            <FaTrash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {isLoading && (
                <div className="p-4 text-gray-600 text-center">Loading...</div>
              )}
              {!isLoading && issues.length === 0 && (
                <div className="p-4 text-gray-600 text-center">
                  No tasks available
                </div>
              )}
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden">
              {issues.map((issue) => (
                <div
                  key={issue._id}
                  className="border-b border-gray-200 p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base text-gray-900">
                        {issue.userName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {truncateDescription(issue.description)}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-3">
                      <button
                        onClick={() => handleViewIssue(issue)}
                        className="text-orange-600 hover:text-orange-800 p-2"
                      >
                        <FaEye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditIssue(issue)}
                        className="text-orange-600 hover:text-orange-800 p-2"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteIssue(issue)}
                        className="text-orange-600 hover:text-orange-800 p-2"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Branch:</span>
                      <span className="ml-2 text-gray-600">
                        {issue.branch?.branchName || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Department:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {issue.department?.departmentName || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className="ml-2 text-gray-600">
                        {statusDisplay[issue.status] || issue.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Priority:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {issue.priority}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-medium text-gray-700">
                        Assigned To:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {issue.assignedTo?.name || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {(isLoading || isSubmitting) && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Loading />
        </div>
      )}

      {isModalOpen && selectedIssue && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
        >
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md max-h-[90vh] sm:max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">
                {isEditing ? "Edit Issue" : "View Issue"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-gray-800 p-1"
              >
                <FaTimes size={20} />
              </button>
            </div>
            {isEditing ? (
              <div className="overflow-y-auto flex-1 pr-2">
                <form onSubmit={handleUpdateIssue} className="space-y-4">
                  <div>
                    <label
                      htmlFor="userName"
                      className="block text-sm font-medium mb-1"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      id="userName"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      rows="4"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium mb-1"
                    >
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="priority"
                      className="block text-sm font-medium mb-1"
                    >
                      Priority
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-6 pt-4 border-t">
                    <button
                      type="submit"
                      className="bg-primary text-white px-4 py-2 rounded-md text-sm order-1 sm:order-2"
                      disabled={isLoading || isSubmitting}
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm order-2 sm:order-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="overflow-y-auto flex-1">
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Title:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedIssue.userName}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Description:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {selectedIssue.description || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Branch:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedIssue.branch?.branchName || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Department:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {selectedIssue.department?.departmentName || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="ml-2 text-gray-600">
                      {statusDisplay[selectedIssue.status] ||
                        selectedIssue.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Priority:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedIssue.priority}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Assigned To:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {selectedIssue.assignedTo?.name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Created By:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {selectedIssue.createdBy?.name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Created At:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {new Date(selectedIssue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end mt-6 pt-4 border-t">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignedtasks;
