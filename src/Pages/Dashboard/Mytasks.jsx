import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Loading from "../../Components/Loading";

const MyTasks = () => {
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchIssues = async () => {
    setIsLoading(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const userData = localStorage.getItem("user");
      if (!userData) throw new Error("No user data found");

      const user = JSON.parse(userData);
      const response = await fetch("https://bug-buster-backend.vercel.app/api/issues", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch issues: ${text}`);
      }

      let data = await response.json();
      if (!Array.isArray(data)) {
        data = data.issues || [];
      }
      const userIssues = data.filter((issue) => issue.createdBy === user._id);
      setIssues(userIssues);

      if (Date.now() - start < 2000) {
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleDeleteIssue = async (issue) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    setError("");
    setIsSubmitting(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `https://bug-buster-backend.vercel.app/api/issues/${issue._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(data.message || "Failed to delete issue");
      }

      setIssues(issues.filter((i) => i._id !== issue._id));
      if (Date.now() - start < 2000) {
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
      }
      setError("Issue deleted successfully and logged!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
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

        {error && <div className="p-4 text-red-600">{error}</div>}

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
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue._id}>
                    <td className="p-3">{issue.userName}</td>
                    <td className="p-3">
                      {issue.branch?.branchName || "N/A"}
                    </td>
                    <td className="p-3">
                      {issue.department?.departmentName || "N/A"}
                    </td>
                    <td className="p-3">{issue.status}</td>
                    <td className="p-3">{issue.priority}</td>
                    <td className="p-3 flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewIssue(issue)}
                        className="text-orange-600 hover:text-orange-800"
                        title="View"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEditIssue(issue)}
                        className="text-orange-600 hover:text-orange-800"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteIssue(issue)}
                        className="text-orange-600 hover:text-orange-800"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(isLoading || isSubmitting) && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Loading />
        </div>
      )}
    </div>
  );

  // Placeholder for other functions
  function handleViewIssue(issue) {
    // Implement view logic
    console.log("View issue:", issue);
  }

  function handleEditIssue(issue) {
    // Implement edit logic
    console.log("Edit issue:", issue);
  }
};

export default MyTasks;