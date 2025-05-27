import React, { useState, useEffect } from "react";
import { FaEye, FaTimes, FaUndo } from "react-icons/fa";
import Loading from "../Components/Loading";

const DeletedLogs = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch("https://bugbuster-backend.vercel.app/api/logs/deleted", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Response status:", response.status, "Response text:", text);
        throw new Error(`Failed to fetch deleted logs: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setLogs(data);
      if (Date.now() - start < 2000)
        await new Promise((resolve) => setTimeout(resolve, 2000 - (Date.now() - start)));
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to fetch deleted logs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreLog = async (log) => {
    if (!window.confirm(`Are you sure you want to restore this ${log.entityType}?`)) return;

    setIsLoading(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`https://bugbuster-backend.vercel.app/api/logs/restore/${log._id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to restore item');

      setLogs(logs.filter((l) => l._id !== log._id));
      if (Date.now() - start < 2000)
        await new Promise((resolve) => setTimeout(resolve, 2000 - (Date.now() - start)));
    } catch (err) {
      console.error("Restore error:", err);
      setError(err.message || "Failed to restore item");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleViewLog = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  // Map entityType to user-friendly "Deleted From" value
  const getDeletedFrom = (entityType) => {
    switch (entityType) {
      case 'User': return 'Users';
      case 'Issue': return 'Issues';
      case 'Branch': return 'Branches';
      case 'Department': return 'Departments';
      case 'Block': return 'Blocks';
      default: return entityType;
    }
  };

  // Format details for table display
  const getDetails = (log) => {
    switch (log.entityType) {
      case 'User':
        return `User: ${log.entityDetails.name} (${log.entityDetails.email})`;
      case 'Issue':
        return `Issue: ${log.entityDetails.userName} (${log.entityDetails.status})`;
      case 'Branch':
        return `Branch: ${log.entityDetails.branchName} (${log.entityDetails.branchCode})`;
      case 'Department':
        return `Department: ${log.entityDetails.departmentName} (${log.entityDetails.departmentCode})`;
      case 'Block':
        return `Block: ${log.entityDetails.blockName} (${log.entityDetails.blockCode})`;
      default:
        return `Unknown: ${JSON.stringify(log.entityDetails)}`;
    }
  };

  // Format timestamp consistently
  const formatTimestamp = (timestamp) => {
    return timestamp ? new Date(timestamp).toLocaleString() : 'N/A';
  };

  return (
    <div className="relative container mx-auto p-6 bg-gray-100 min-h-screen" aria-busy={isLoading}>
      <div className={`bg-white shadow-md rounded-lg ${isLoading ? "blur-sm" : ""}`}>
        <div className="bg-primary text-white p-4 rounded-t-lg">
          <h1 className="text-2xl font-bold">Deleted Logs</h1>
        </div>

        {error && <div className="p-4 text-red-600">{error}</div>}

        <div className="p-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-primary text-white p-3">
              <h2 className="text-lg font-semibold">Deleted Items</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Details</th>
                  <th className="p-3 text-left">Deleted From</th>
                  <th className="p-3 text-left">Deleted By</th>
                  <th className="p-3 text-left">Deleted At</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="">
                    <td className="p-3">{getDetails(log)}</td>
                    <td className="p-3">{getDeletedFrom(log.entityType)}</td>
                    <td className="p-3">{log.deletedBy.name} ({log.deletedBy.email})</td>
                    <td className="p-3">{formatTimestamp(log.deletedAt)}</td>
                    <td className="p-3 flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewLog(log)}
                        className="text-orange-600 hover:text-orange-800"
                        title="View"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleRestoreLog(log)}
                        className="text-green-600 hover:text-green-800"
                        title="Restore"
                      >
                        <FaUndo />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Loading />
        </div>
      )}

      {isModalOpen && selectedLog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">View Deleted Log</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FaTimes />
              </button>
            </div>
            <div>
              <p className="mb-2"><strong>Details:</strong> {getDetails(selectedLog)}</p>
              <p className="mb-2"><strong>Deleted From:</strong> {getDeletedFrom(selectedLog.entityType)}</p>
              <p className="mb-2">
                <strong>Deleted By:</strong> {selectedLog.deletedBy.name} ({selectedLog.deletedBy.email})
              </p>
              <p className="mb-2"><strong>Deleted At:</strong> {formatTimestamp(selectedLog.deletedAt)}</p>
              <p className="mb-2"><strong>Additional Information:</strong></p>
              {selectedLog.entityType === "User" ? (
                <div className="ml-4 space-y-2">
                  <p><strong>Name:</strong> {selectedLog.entityDetails.name || "N/A"}</p>
                  <p><strong>Email:</strong> {selectedLog.entityDetails.email || "N/A"}</p>
                  <p>
                    <strong>Roles:</strong>{" "}
                    {selectedLog.entityDetails.roles?.length > 0
                      ? selectedLog.entityDetails.roles.join(", ")
                      : "N/A"}
                  </p>
                  <p><strong>Phone:</strong> {selectedLog.entityDetails.phone || "N/A"}</p>
                  <p>
                    <strong>Block:</strong>{" "}
                    {selectedLog.entityDetails.block
                      ? `(${selectedLog.entityDetails.block.blockCode}) ${selectedLog.entityDetails.block.blockName}`
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Branch:</strong>{" "}
                    {selectedLog.entityDetails.branch
                      ? `(${selectedLog.entityDetails.branch.branchCode}) ${selectedLog.entityDetails.branch.branchName}`
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Department:</strong>{" "}
                    {selectedLog.entityDetails.department
                      ? `(${selectedLog.entityDetails.department.departmentCode}) ${selectedLog.entityDetails.department.departmentName}`
                      : "N/A"}
                  </p>
                </div>
              ) : selectedLog.entityType === "Issue" ? (
                <div className="ml-4 space-y-2">
                  <p><strong>User Name:</strong> {selectedLog.entityDetails.userName || "N/A"}</p>
                  <p><strong>Description:</strong> {selectedLog.entityDetails.description || "N/A"}</p>
                  <p><strong>Status:</strong> {selectedLog.entityDetails.status || "N/A"}</p>
                  <p><strong>Priority:</strong> {selectedLog.entityDetails.priority || "N/A"}</p>
                  <p>
                    <strong>Branch:</strong>{" "}
                    {selectedLog.entityDetails.branch
                      ? `(${selectedLog.entityDetails.branch.branchCode}) ${selectedLog.entityDetails.branch.branchName}`
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Department:</strong>{" "}
                    {selectedLog.entityDetails.department
                      ? `(${selectedLog.entityDetails.department.departmentCode}) ${selectedLog.entityDetails.department.departmentName}`
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Assigned To:</strong>{" "}
                    {selectedLog.entityDetails.assignedTo
                      ? `${selectedLog.entityDetails.assignedTo.name} (${selectedLog.entityDetails.assignedTo.email})`
                      : "N/A"}
                  </p>
                  <p><strong>Attachment:</strong> {selectedLog.entityDetails.attachment ? "Yes" : "None"}</p>
                  <p><strong>Rating:</strong> {selectedLog.entityDetails.rating || "N/A"}</p>
                  <p><strong>Created At:</strong> {formatTimestamp(selectedLog.entityDetails.createdAt)}</p>
                  <p><strong>Updated At:</strong> {formatTimestamp(selectedLog.entityDetails.updatedAt)}</p>
                </div>
              ) : selectedLog.entityType === "Branch" ? (
                <div className="ml-4 space-y-2">
                  <p><strong>Code:</strong> {selectedLog.entityDetails.branchCode || "N/A"}</p>
                  <p><strong>Name:</strong> {selectedLog.entityDetails.branchName || "N/A"}</p>
                  <p><strong>Created At:</strong> {formatTimestamp(selectedLog.entityDetails.createdAt)}</p>
                  <p><strong>Updated At:</strong> {formatTimestamp(selectedLog.entityDetails.updatedAt)}</p>
                </div>
              ) : selectedLog.entityType === "Department" ? (
                <div className="ml-4 space-y-2">
                  <p><strong>Code:</strong> {selectedLog.entityDetails.departmentCode || "N/A"}</p>
                  <p><strong>Name:</strong> {selectedLog.entityDetails.departmentName || "N/A"}</p>
                  <p><strong>Created At:</strong> {formatTimestamp(selectedLog.entityDetails.createdAt)}</p>
                  <p><strong>Updated At:</strong> {formatTimestamp(selectedLog.entityDetails.updatedAt)}</p>
                </div>
              ) : selectedLog.entityType === "Block" ? (
                <div className="ml-4 space-y-2">
                  <p><strong>Code:</strong> {selectedLog.entityDetails.blockCode || "N/A"}</p>
                  <p><strong>Name:</strong> {selectedLog.entityDetails.blockName || "N/A"}</p>
                  <p><strong>Created At:</strong> {formatTimestamp(selectedLog.entityDetails.createdAt)}</p>
                  <p><strong>Updated At:</strong> {formatTimestamp(selectedLog.entityDetails.updatedAt)}</p>
                </div>
              ) : (
                <div className="ml-4 space-y-2">
                  <p><strong>Raw Data:</strong> {JSON.stringify(selectedLog.entityDetails)}</p>
                </div>
              )}
              <p className="mb-2"><strong>Reason:</strong> {selectedLog.reason || "N/A"}</p>
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

export default DeletedLogs;