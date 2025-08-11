
import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTimes } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Loading from "../../Components/Loading";

const Alert = ({ type, message, onClose }) => {
  const alertStyles = {
    success: "bg-green-100 border-green-500 text-green-700",
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

const MyTasks = () => {
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: "pending",
  });
  const navigate = useNavigate();

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
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues?assignedTo=${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // console.log(response);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch issues: ${text}`);
      }

      let data = await response.json();
      if (!Array.isArray(data)) {
        data = data.issues || [];
      }

      setIssues(data);

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
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditIssue = (issue) => {
    setSelectedIssue(issue);
    setFormData({
      status: issue.status || "pending",
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues/${selectedIssue._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: formData.status }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(data.message || "Failed to update issue");
      }

      if (!data.issue) throw new Error("Invalid response: issue data missing");
      setIssues((prevIssues) =>
        prevIssues.map((i) => (i._id === selectedIssue._id ? data.issue : i))
      );
      setIsModalOpen(false);
      setFormData({ status: "pending" });
      showAlert("success", "Issue status updated successfully!");

      if (Date.now() - start < 2000) {
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
      }
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="relative container mx-auto p-6 bg-gray-100 min-h-screen">
      <div
        className={`bg-white shadow-md rounded-lg ${
          isLoading || isSubmitting ? "blur-sm" : ""
        }`}
      >
        <div className="bg-primary text-white p-4 rounded-t-lg">
          <h1 className="text-2xl font-bold">My Tasks</h1>
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
              <h2 className="text-lg font-semibold">My Issues</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">User Name</th>
                  <th className="p-3 text-left">Branch</th>
                  <th className="p-3 text-left">Department</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Priority</th>
                  <th className="p-3 text-left">Description</th>

                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="6" className="p-3 text-center">
                      No issues found.
                    </td>
                  </tr>
                )}
                {issues.map((issue) => (
                  <tr key={issue._id}>
                    <td className="p-3">{issue.userName || "N/A"}</td>
                    <td className="p-3">{issue.branch?.branchName || "N/A"}</td>
                    <td className="p-3">
                      {issue.department?.departmentName || "N/A"}
                    </td>
                    <td className="p-3">{issue.status || "N/A"}</td>
                    <td className="p-3">{issue.priority || "N/A"}</td>
                    <td className="p-3">{issue.description?.title || "N/A"}</td>

                    <td className="p-3 flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewIssue(issue)}
                        className="text-orange-600 hover:text-orange-800 disabled:opacity-50"
                        title="View"
                        disabled={isSubmitting}
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEditIssue(issue)}
                        className="text-orange-600 hover:text-orange-800 disabled:opacity-50"
                        title="Edit"
                        disabled={isSubmitting}
                      >
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(isLoading || isSubmitting) && <Loading fullscreen />}

      {isModalOpen && selectedIssue && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
        >
          <div className="bg-white rounded-lg p-6 w-[32rem] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? "Edit Issue" : "View Issue"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FaTimes />
              </button>
            </div>
            {isEditing ? (
              <form onSubmit={handleUpdateIssue}>
                <div className="mb-4">
                  <label
                    htmlFor="modalUserName"
                    className="block text-sm font-medium mb-1"
                    style={{
                      backgroundColor: "white",
                      width: "fit-content",
                      position: "relative",
                      top: "13px",
                      marginLeft: "14px",
                      paddingLeft: "4px",
                      paddingRight: "4px",
                      zIndex: "20",
                    }}
                  >
                    User Name
                  </label>
                  <input
                    type="text"
                    id="modalUserName"
                    value={selectedIssue.userName || "N/A"}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="modalBranch"
                    className="block text-sm font-medium mb-1"
                    style={{
                      backgroundColor: "white",
                      width: "fit-content",
                      position: "relative",
                      top: "13px",
                      marginLeft: "14px",
                      paddingLeft: "4px",
                      paddingRight: "4px",
                      zIndex: "20",
                    }}
                  >
                    Branch
                  </label>
                  <input
                    type="text"
                    id="modalBranch"
                    value={selectedIssue.branch?.branchName || "N/A"}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="modalDepartment"
                    className="block text-sm font-medium mb-1"
                    style={{
                      backgroundColor: "white",
                      width: "fit-content",
                      position: "relative",
                      top: "13px",
                      marginLeft: "14px",
                      paddingLeft: "4px",
                      paddingRight: "4px",
                      zIndex: "20",
                    }}
                  >
                    Department
                  </label>
                  <input
                    type="text"
                    id="modalDepartment"
                    value={selectedIssue.department?.departmentName || "N/A"}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="modalStatus"
                    className="block text-sm font-medium mb-1"
                    style={{
                      backgroundColor: "white",
                      width: "fit-content",
                      position: "relative",
                      top: "13px",
                      marginLeft: "14px",
                      paddingLeft: "4px",
                      paddingRight: "4px",
                      zIndex: "20",
                    }}
                  >
                    Status
                  </label>
                  <div className="relative">
                    <select
                      id="modalStatus"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <IoChevronDown className="text-gray-400" size={16} />
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="modalPriority"
                    className="block text-sm font-medium mb-1"
                    style={{
                      backgroundColor: "white",
                      width: "fit-content",
                      position: "relative",
                      top: "13px",
                      marginLeft: "14px",
                      paddingLeft: "4px",
                      paddingRight: "4px",
                      zIndex: "20",
                    }}
                  >
                    Priority
                  </label>
                  <input
                    type="text"
                    id="modalPriority"
                    value={selectedIssue.priority || "N/A"}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="submit"
                    className="bg-primary text-white px-4 py-2 rounded-md disabled:opacity-50"
                    disabled={isLoading || isSubmitting}
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className="mb-2">
                  <strong>User Name:</strong> {selectedIssue.userName || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Description:</strong>{" "}
                  {selectedIssue.description?.title || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Branch:</strong>{" "}
                  {selectedIssue.branch?.branchName || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Department:</strong>{" "}
                  {selectedIssue.department?.departmentName || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Status:</strong> {selectedIssue.status || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Priority:</strong> {selectedIssue.priority || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Created At:</strong>{" "}
                  {new Date(selectedIssue.createdAt).toLocaleDateString()}
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
