import React, { useState, useEffect } from "react";
import { FaEye, FaEdit } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Loading from "../../Components/Loading";
import toast from "react-hot-toast";

const MyTasks = () => {
  const [issues, setIssues] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: "pending",
  });
  const [dropdowns, setDropdowns] = useState({
    branches: [],
    departments: [],
    users: [],
    filteredUsers: [],
    descriptions: [],
  });

  const navigate = useNavigate();

  const fetchIssues = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) toast.error("No authentication token found");

      const userData = localStorage.getItem("user");
      if (!userData) toast.error("No user data found");

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

      if (!response.ok) {
        const text = await response.text();
        toast.error(text);
      }

      let data = await response.json();
      if (!Array.isArray(data)) {
        data = data.issues || [];
      }

      setIssues(data);
      //console.log(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const loadInitialData = async () => {
    const userData = localStorage.getItem("user");

    if (userData) {
      const parsedUser = JSON.parse(userData);

      setFormData((prev) => ({ ...prev, userName: parsedUser.name }));
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const dropdownResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues/dropdowns`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!dropdownResponse.ok) {
        const text = await dropdownResponse.text();
        console.error(
          "Dropdowns response status:",
          dropdownResponse.status,
          "Response text:",
          text
        );
        toast.error(
          `Failed to fetch dropdown data: ${dropdownResponse.status} ${dropdownResponse.statusText}`
        );
      }

      const dropdownData = await dropdownResponse.json();

      setDropdowns({
        branches: Array.isArray(dropdownData.branches)
          ? dropdownData.branches
          : [],
        departments: Array.isArray(dropdownData.departments)
          ? dropdownData.departments
          : [],
        users: Array.isArray(dropdownData.users) ? dropdownData.users : [],
        filteredUsers: Array.isArray(dropdownData.users)
          ? dropdownData.users
          : [],
        descriptions: Array.isArray(dropdownData.descriptions)
          ? dropdownData.descriptions
          : [],
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
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
      assignedTo: issue.furtherAssignedTo?.[0]?._id || "",
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) toast.error("No authentication token found");

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues/${selectedIssue._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            furtherAssignedTo: [formData.assignedTo],
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          toast.error("Session expired. Please log in again.");
        }
        toast.error(data.message || "Failed to update issue");
      }

      if (!data.issue) toast.error("No issue data returned");
      setIssues((prevIssues) =>
        prevIssues.map((i) => (i._id === selectedIssue._id ? data.issue : i))
      );
      setIsModalOpen(false);
      setFormData({ status: "pending" });
      toast.success("Issue updated successfully");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
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
          isLoading ? "blur-sm" : ""
        }`}
      >
        <div className="bg-primary text-white p-4 rounded-t-lg">
          <h1 className="text-2xl font-bold">Tasks Assigned to Me</h1>
        </div>

        <div className="p-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-primary text-white p-3">
              <h2 className="text-lg font-semibold">My Issues</h2>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <div className="min-w-[1000px]">
                <table className="w-full table-auto">
                  <thead className="bg-gray-100 truncate">
                    <tr>
                      <th className="p-3 text-left text-sm font-medium">
                        Assigned By
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
                        Further Assigned To
                      </th>
                      <th className="p-3 text-left text-sm font-medium">
                        Description
                      </th>

                      <th className="p-3 text-center text-sm font-medium">
                        Actions
                      </th>
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
                        <td className="p-3 text-sm">
                          {issue?.userName || "N/A"}
                        </td>
                        <td className="p-3 text-sm">
                          {issue.branch?.branchName || "N/A"}
                        </td>
                        <td className="p-3">
                          {issue.department?.departmentName || "N/A"}
                        </td>
                        <td className="p-3 text-sm">
                          {issue?.status || "N/A"}
                        </td>
                        <td className="p-3 text-sm">
                          {issue?.priority || "N/A"}
                        </td>
                        <td className="p-3 text-sm">
                          <td className="p-3 text-sm">
                            {issue?.furtherAssignedTo?.length > 0
                              ? issue.furtherAssignedTo
                                  .map((u) => u.name)
                                  .join(", ")
                              : "N/A"}
                          </td>
                        </td>

                        <td className="p-3 text-sm">
                          {issue.description?.title || "N/A"}
                        </td>

                        <td className="p-3 flex justify-center space-x-2">
                          <button
                            onClick={() => handleViewIssue(issue)}
                            className="text-orange-600 cursor-pointer hover:text-orange-800 disabled:opacity-50"
                            title="View"
                            disabled={isLoading}
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleEditIssue(issue)}
                            className="text-orange-600 cursor-pointer hover:text-orange-800 disabled:opacity-50"
                            title="Edit"
                            disabled={isLoading}
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
        </div>
      </div>

      {isLoading && <Loading />}

      {isModalOpen && selectedIssue && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[32rem] max-h-[80vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? "Edit Issue" : "View Issue"}
              </h2>
            </div>
            {isEditing ? (
              <form onSubmit={handleUpdateIssue}>
                <div className="mb-4">
                  <label
                    htmlFor="modalUserName"
                    className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
                  >
                    Assigned By
                  </label>
                  <input
                    type="text"
                    id="modalUserName"
                    value={selectedIssue.userName || "N/A"}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="modalBranch"
                    className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
                  >
                    Branch
                  </label>
                  <input
                    type="text"
                    id="modalBranch"
                    value={selectedIssue.branch?.branchName || "N/A"}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="modalDepartment"
                    className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
                  >
                    Department
                  </label>
                  <input
                    type="text"
                    id="modalDepartment"
                    value={selectedIssue.department?.departmentName || "N/A"}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="modalDepartment"
                    className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
                  >
                    Status
                  </label>
                  <input
                    type="text"
                    id="modalDepartment"
                    value={selectedIssue.status || "N/A"}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="furtherAssign"
                    className="block text-sm font-medium mb-1 bg-white w-fit relative top-[13px] ml-[14px] px-1 z-20"
                  >
                    Further Assign
                  </label>

                  <div className="relative">
                    <select
                      id="furtherAssign"
                      name="assignedTo"
                      value={formData.assignedTo || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select User</option>

                      {dropdowns.users
                        .find((u) => u?._id === selectedIssue?.assignedTo?._id)
                        ?.reportHim?.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                    </select>

                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <IoChevronDown className="text-gray-400" size={16} />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="modalPriority"
                    className="block text-sm font-medium  mb-1 bg-white w-fit relative top-[13px]  ml-[14px] px-1 z-20"
                  >
                    Priority
                  </label>
                  <input
                    type="text"
                    id="modalPriority"
                    value={selectedIssue.priority || "N/A"}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-black cursor-pointer text-white px-4 py-2 rounded-md "
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary cursor-pointer text-white px-4 py-2 rounded-md disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Update
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p className="mb-2">
                  <strong>Assigned By:</strong>{" "}
                  {selectedIssue.userName || "N/A"}
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
                    className="bg-black text-white px-4 py-2 rounded-md cursor-pointer"
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
