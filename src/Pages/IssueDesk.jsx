import { useState, useEffect, useRef } from "react";
import { IoChevronDown } from "react-icons/io5";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPlusCircle,
  FaTimes,
  FaStar,
} from "react-icons/fa";
import Loading from "../Components/Loading";
import { FaStarHalfStroke } from "react-icons/fa6";

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

export default function IssueDesk() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    userName: "",
    branch: "",
    department: "",
    assignedTo: "",
    description: "",
    priority: "Medium",
    attachment: null,
    status: "pending",
  });
  const [dropdowns, setDropdowns] = useState({
    branches: [],
    departments: [],
    users: [],
    filteredUsers: [],
  });

  const [issues, setIssues] = useState([]);
  const [alert, setAlert] = useState({ type: "", message: "", show: false });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const hasFetched = useRef(false);

  const showAlert = (type, message) => {
    setAlert({ type, message, show: true });
    setTimeout(() => setAlert({ type: "", message: "", show: false }), 5000);
  };

  const renderStars = (rating) => {
    if (!rating || rating === 0) return "N/A";
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = rating >= star;
          const isHalf = rating >= star - 0.5 && rating < star;
          return (
            <span key={star}>
              {isFull ? (
                <FaStar className="w-4 h-4 text-yellow-400" />
              ) : isHalf ? (
                <FaStarHalfStroke className="w-4 h-4 text-yellow-400" />
              ) : (
                <FaStar className="w-4 h-4 text-gray-300" />
              )}
            </span>
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setUserRole(parsedUser.role || null);
        setFormData((prev) => ({ ...prev, userName: parsedUser.name }));
      }

      if (!hasFetched.current) {
        hasFetched.current = true;
        setIsLoading(true);
        const start = Date.now();
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No authentication token found");

          const dropdownResponse = await fetch(
            "https://bug-buster-backend.vercel.app/api/issues/dropdowns",
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
            throw new Error(
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
          });

          if (userData) {
            const parsedUser = JSON.parse(userData);
            const issuesResponse = await fetch(
              "https://bug-buster-backend.vercel.app/api/issues",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (!issuesResponse.ok) {
              const text = await issuesResponse.text();
              console.error(
                "Issues response status:",
                issuesResponse.status,
                "Response text:",
                text
              );
              throw new Error(
                `Failed to fetch issues: ${issuesResponse.status} ${issuesResponse.statusText}`
              );
            }
            let issuesData = await issuesResponse.json();
            if (!Array.isArray(issuesData)) {
              issuesData = issuesData.issues || [];
            }
            if (parsedUser.email !== "Admin@gmail.com") {
              issuesData = issuesData.filter(
                (issue) => issue.userName === parsedUser.name
              );
            }
            setIssues(issuesData);
          }

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
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.branch && formData.department) {
      const filtered = dropdowns.users.filter(
        (user) =>
          user.branch === formData.branch &&
          user.department === formData.department
      );
      setDropdowns((prev) => ({ ...prev, filteredUsers: filtered }));
    } else {
      setDropdowns((prev) => ({ ...prev, filteredUsers: prev.users }));
    }
  }, [formData.branch, formData.department, dropdowns.users]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachment: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "", show: false });
    setIsFormOpen(false);
    setIsSubmitting(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const formDataToSend = new FormData();
      formDataToSend.append("userName", formData.userName);
      formDataToSend.append("branch", formData.branch);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("assignedTo", formData.assignedTo);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("priority", formData.priority);
      formDataToSend.append("status", formData.status);
      if (formData.attachment) {
        formDataToSend.append("attachment", formData.attachment);
      }

      const response = await fetch(
        "https://bug-buster-backend.vercel.app/api/issues",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to submit issue");

      if (!data.issue) throw new Error("Invalid response: issue data missing");
      setIssues([data.issue, ...issues]);
      setFormData({
        userName: user?.name || "",
        branch: "",
        department: "",
        assignedTo: "",
        description: "",
        priority: "Medium",
        attachment: null,
        status: "pending",
      });
      const attachmentInput = document.getElementById("attachment");
      if (attachmentInput) {
        attachmentInput.value = null;
      }

      if (Date.now() - start < 2000)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
      showAlert("success", "Issue submitted successfully!");
    } catch (err) {
      console.error(err);
      showAlert("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditIssue = (issue) => {
    setSelectedIssue(issue);
    setFormData({
      userName: issue.userName,
      branch: issue.branch ? issue.branch._id : "",
      department: issue.department ? issue.department._id : "",
      assignedTo: issue.assignedTo ? issue.assignedTo._id : "",
      description: issue.description,
      priority: issue.priority || "Medium",
      attachment: null,
      status: issue.status,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    setAlert({ type: "", message: "", show: false });
    setIsSubmitting(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const formDataToSend = new FormData();
      formDataToSend.append("userName", formData.userName);
      formDataToSend.append("branch", formData.branch);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("assignedTo", formData.assignedTo);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("priority", formData.priority);
      formDataToSend.append("status", formData.status);
      if (formData.attachment) {
        formDataToSend.append("attachment", formData.attachment);
      }

      const response = await fetch(
        `https://bug-buster-backend.vercel.app/api/issues/${selectedIssue._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
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
        userName: user?.name || "",
        branch: "",
        department: "",
        assignedTo: "",
        description: "",
        priority: "Medium",
        attachment: null,
        status: "pending",
      });

      const modalAttachment = document.getElementById("modalAttachment");
      if (modalAttachment) {
        modalAttachment.value = "";
      }

      if (Date.now() - start < 2000)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
      showAlert("success", "Issue updated successfully!");
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIssue = async (issue) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    setAlert({ type: "", message: "", show: false });
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
      if (!response.ok)
        throw new Error(data.message || "Failed to delete issue");

      setIssues(issues.filter((i) => i._id !== issue._id));
      if (Date.now() - start < 2000)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
      showAlert("success", "Issue deleted successfully!");
    } catch (err) {
      showAlert("error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAttachmentUrl = (attachment) => {
    if (!attachment) return null;
    if (attachment.startsWith("http")) return attachment;
    return `https://bug-buster-backend.vercel.app/${attachment}`;
  };

  const truncateDescription = (description) => {
    if (!description) return "";
    const words = description.trim().split(" ");
    if (words.length <= 2) return description;
    return `${words.slice(0, 2).join(" ")}...`;
  };

  const isAuthorized = (issue) => {
    if (!user || !issue.createdBy) return false;
    return userRole === "Admin" || issue.createdBy._id === user._id;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen mx-auto">
      <div
        className={`bg-white shadow-md rounded-lg 
          ${isLoading || isSubmitting ? "blur-sm" : ""}
        `}
      >
        <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
          <h1 className="text-2xl font-bold">Issue Desk</h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-white text-primary px-4 py-1 rounded-md hover:bg-gray-100 flex items-center"
          >
            <FaPlusCircle className="mr-2" />
            Add Issue
          </button>
        </div>

        <div className="p-6">
          <div className="bg-primary text-white p-3">
            <h2 className="text-lg font-semibold">Details</h2>
          </div>
          <div className="bg-white shadow rounded-lg overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Assigned By</th>
                  <th className="p-3 text-left">Branch</th>
                  <th className="p-3 text-left">Department</th>
                  <th className="p-3 text-left">Assigned To</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Priority</th>
                  <th className="p-3 text-left">Attachment</th>
                  <th className="p-3 text-left">Rating</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue._id} className="">
                    <td className="p-3">{issue.userName}</td>
                    <td className="p-3">
                      {issue.branch
                        ? `(${issue.branch.branchCode}) ${issue.branch.branchName}`
                        : "N/A"}
                    </td>
                    <td className="p-3">
                      {issue.department
                        ? `(${issue.department.departmentCode}) ${issue.department.departmentName}`
                        : "N/A"}
                    </td>
                    <td className="p-3">
                      {issue.assignedTo
                        ? `${issue.assignedTo.name} (${issue.assignedTo.email})`
                        : "N/A"}
                    </td>
                    <td className="p-3">
                      {truncateDescription(issue.description)}
                    </td>
                    <td className="p-3">{issue.status}</td>
                    <td className="p-3">{issue.priority}</td>
                    <td className="p-3">
                      {issue.attachment ? (
                        <a
                          href={getAttachmentUrl(issue.attachment)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Download
                        </a>
                      ) : (
                        "None"
                      )}
                    </td>
                    <td className="p-3">{renderStars(issue.rating)}</td>
                    <td className="">
                      <div className="p-3 flex justify-center my-auto space-x-2">
                        <button
                          onClick={() => handleViewIssue(issue)}
                          className="text-orange-600 hover:text-orange-800"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        {isAuthorized(issue) && (
                          <>
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
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isFormOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
          >
            <div className="bg-white rounded-lg p-6 w-[60rem] h-[40rem] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New Issue</h2>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="userName"
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
                      id="userName"
                      name="userName"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={formData.userName}
                      onChange={handleInputChange}
                      placeholder="Enter user name"
                      disabled
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="branch"
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
                    <div className="relative">
                      <select
                        id="branch"
                        name="branch"
                        className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={formData.branch}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Branch</option>
                        {dropdowns.branches.map((branch) => (
                          <option key={branch._id} value={branch._id}>
                            {branch.branchName} ({branch.branchCode})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <IoChevronDown className="text-gray-400" size={16} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="department"
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
                    <div className="relative">
                      <select
                        id="department"
                        name="department"
                        className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Department</option>
                        {dropdowns.departments.map((department) => (
                          <option key={department._id} value={department._id}>
                            {department.departmentName} (
                            {department.departmentCode})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <IoChevronDown className="text-gray-400" size={16} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="assignedTo"
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
                      Assigned To
                    </label>
                    <div className="relative">
                      <select
                        id="assignedTo"
                        name="assignedTo"
                        className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={formData.assignedTo}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select User</option>
                        {dropdowns.filteredUsers.map((user) => (
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
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="description"
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
                      marginBottom: "0px",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter issue description"
                    required
                  ></textarea>
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="priority"
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
                  <div className="relative">
                    <select
                      id="priority"
                      name="priority"
                      className="w-full px-3 py-2 border rounded-md appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={formData.priority}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <IoChevronDown className="text-gray-400" size={16} />
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="attachment"
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
                    Attachment
                  </label>
                  <div className="flex items-center px-3 py-2 border rounded-md">
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("attachment").click()
                      }
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
                    >
                      Choose File
                    </button>
                    <input
                      id="attachment"
                      type="file"
                      name="attachment"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                    />
                    <span className="ml-3 text-gray-500 text-sm">
                      {formData.attachment
                        ? formData.attachment.name
                        : "No file chosen"}
                    </span>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="submit"
                    className="bg-primary text-white px-4 py-2 rounded-md flex items-center"
                    disabled={isLoading || isSubmitting}
                  >
                    <FaPlusCircle className="mr-2" /> Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        userName: user?.name || "",
                        branch: "",
                        department: "",
                        assignedTo: "",
                        description: "",
                        priority: "Medium",
                        attachment: null,
                        status: "pending",
                      });
                      const attachment = document.getElementById("attachment");
                      if (attachment) {
                        attachment.value = "";
                      }
                      setIsFormOpen(false);
                    }}
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {alert.show && (
          <div className="p-6">
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ type: "", message: "", show: false })}
            />
          </div>
        )}
      </div>

      {(isLoading || isSubmitting) && <Loading fullscreen />}

      {isModalOpen && selectedIssue && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
        >
          <div className="bg-white rounded-lg p-6 w-[32rem] h-[32rem] overflow-y-auto">
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
                  >
                    User Name
                  </label>
                  <input
                    type="text"
                    id="modalUserName"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="modalBranch"
                    className="block text-sm font-medium mb-1"
                  >
                    Branch
                  </label>
                  <select
                    id="modalBranch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select Branch</option>
                    {dropdowns.branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.branchName} ({branch.branchCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="modalDepartment"
                    className="block text-sm font-medium mb-1"
                  >
                    Department
                  </label>
                  <select
                    id="modalDepartment"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select Department</option>
                    {dropdowns.departments.map((department) => (
                      <option key={department._id} value={department._id}>
                        {department.departmentName} ({department.departmentCode}
                        )
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="modalAssignedTo"
                    className="block text-sm font-medium mb-1"
                  >
                    Assigned To
                  </label>
                  <select
                    id="modalAssignedTo"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select User</option>
                    {dropdowns.filteredUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="modalDescription"
                    className="block text-sm font-medium mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="modalDescription"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows="4"
                    required
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="modalPriority"
                    className="block text-sm font-medium mb-1"
                  >
                    Priority
                  </label>
                  <select
                    id="modalPriority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="modalStatus"
                    className="block text-sm font-medium mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="modalStatus"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="modalAttachment"
                    className="block text-sm font-medium mb-1"
                  >
                    Attachment
                  </label>
                  <div className="flex items-center px-3 py-2 border rounded-md">
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("modalAttachment").click()
                      }
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
                    >
                      Choose File
                    </button>
                    <input
                      id="modalAttachment"
                      type="file"
                      name="attachment"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                    />
                    <span className="ml-3 text-gray-500 text-sm">
                      {formData.attachment
                        ? formData.attachment.name
                        : "No file chosen"}
                    </span>
                  </div>
                  {selectedIssue.attachment && (
                    <p className="mt-2 text-sm text-gray-600">
                      Current:{" "}
                      <a
                        href={getAttachmentUrl(selectedIssue.attachment)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Download current attachment
                      </a>
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="submit"
                    className="bg-primary text-white px-4 py-2 rounded-md"
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
                  <strong>User Name:</strong> {selectedIssue.userName}
                </p>
                <p className="mb-2">
                  <strong>Branch:</strong>{" "}
                  {selectedIssue.branch
                    ? `(${selectedIssue.branch.branchCode}) ${selectedIssue.branch.branchName}`
                    : "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Department:</strong>{" "}
                  {selectedIssue.department
                    ? `(${selectedIssue.department.departmentCode}) ${selectedIssue.department.departmentName}`
                    : "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Assigned To:</strong>{" "}
                  {selectedIssue.assignedTo
                    ? `${selectedIssue.assignedTo.name} (${selectedIssue.assignedTo.email})`
                    : "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Description:</strong> {selectedIssue.description}
                </p>
                <p className="mb-2">
                  <strong>Priority:</strong> {selectedIssue.priority}
                </p>
                <p className="mb-2">
                  <strong>Status:</strong> {selectedIssue.status}
                </p>
                <p className="mb-2">
                  <strong>Rating:</strong> {renderStars(selectedIssue.rating)}
                </p>
                <p className="mb-2">
                  <strong>Attachment:</strong>{" "}
                  {selectedIssue.attachment ? (
                    <a
                      href={getAttachmentUrl(selectedIssue.attachment)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Download
                    </a>
                  ) : (
                    "None"
                  )}
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
}
