import { useState, useEffect, useRef } from "react";
import { IoChevronDown } from "react-icons/io5";
import { FaEdit, FaTrash, FaPlusCircle, FaTimes, FaStar } from "react-icons/fa";
import Loading from "../../Components/Loading";
import { FaEye, FaStarHalfStroke } from "react-icons/fa6";
import toast from "react-hot-toast";

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
  const [selectedDescription, setSelectedDescription] = useState("");
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState({});
  const [dropdowns, setDropdowns] = useState({
    branches: [],
    departments: [],
    users: [],
    filteredUsers: [],
    descriptions: [],
  });

  const [issues, setIssues] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const hasFetched = useRef(false);

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
      // console.log("User data from localStorage:", userData);

      if (userData) {
        const parsedUser = JSON.parse(userData);
        // console.log("User data:", parsedUser);

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
          if (!token)
            throw new Error("No authentication token found. Please log in.");

          // Fetch dropdowns (branches, departments, users)
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
            throw new Error(
              `Failed to fetch dropdown data: ${dropdownResponse.status} ${dropdownResponse.statusText}`
            );
          }
          const dropdownData = await dropdownResponse.json();
          console.log("Dropdown data:", dropdownData);

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

          if (userData) {
            const parsedUser = JSON.parse(userData);
            const issuesResponse = await fetch(
              `${import.meta.env.VITE_BACKEND_URL}/api/issues`,
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
          console.error(err);
          toast.error(err.message);
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
    if (
      name === "branch" ||
      name === "department" ||
      name === "assignedTo" ||
      name === "priority" ||
      name === "status"
    ) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDescriptionSelect = (description) => {
    if (description === "custom") {
      // Uncheck all predefined when custom is selected
      setSelectedDescription({ title: "custom" });
      setFormData((prev) => ({ ...prev, description: "" }));
    } else if (description) {
      setSelectedDescription(description);

      setFormData((prev) => ({
        ...prev,
        description: description._id,
      }));
    }

    setIsDescriptionOpen(false);
  };

  const handleCustomDescriptionChange = (e) => {
    setFormData({ ...formData, description: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachment: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    setIsFormOpen(false);
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

      // console.log("====================================");
      // console.log(Object.fromEntries(formDataToSend));
      // console.log("====================================");

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/issues`,
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
      setSelectedDescription("");
      const attachmentInput = document.getElementById("attachment");
      if (attachmentInput) {
        attachmentInput.value = null;
      }

      if (Date.now() - start < 2000)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
      toast.success("Issue submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to submit issue. Please try again.");
    } finally {
      setIsLoading(false);
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
      description: issue.description?.title,
      priority: issue.priority || "Medium",
      attachment: null,
      status: issue.status,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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
        `${import.meta.env.VITE_BACKEND_URL}/api/issues/${selectedIssue._id}`,
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
      setSelectedDescription("");

      const modalAttachment = document.getElementById("modalAttachment");
      if (modalAttachment) {
        modalAttachment.value = "";
      }

      if (Date.now() - start < 2000)
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 - (Date.now() - start))
        );
      toast.success("Issue updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update issue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIssue = async (issue) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    setIsLoading(true);
    const start = Date.now();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

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
      toast.success("Issue deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete issue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getAttachmentUrl = (attachment) => {
    if (!attachment) return null;
    if (attachment.startsWith("http")) return attachment;
    return `${import.meta.env.VITE_BACKEND_URL}/${attachment}`;
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
          ${isLoading ? "blur-sm" : ""}
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
          <div className="bg-white shadow rounded-lg overflow-auto no-scrollbar">
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
                      {truncateDescription(issue.description?.title)}
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
                <div className="mt-4 relative">
                  <label
                    htmlFor="addDescription"
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
                    Add Description
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-orange-500 flex justify-between items-center"
                      onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                    >
                      <span>
                        {selectedDescription
                          ? selectedDescription.title
                          : "Select Descriptions"}
                      </span>
                      <IoChevronDown className="text-gray-400" size={16} />
                    </button>
                    {isDescriptionOpen && (
                      <ul className="absolute w-full bg-white border border-gray-200 rounded-md mt-1 z-50 max-h-40 overflow-y-auto shadow-lg backdrop-blur-0 bg-opacity-100">
                        <li className="px-4 py-2 text-gray-800 font-semibold">
                          Predefined Descriptions
                        </li>
                        {dropdowns.descriptions.map((desc) => (
                          <div key={desc._id}>
                            <li
                              className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                              onClick={() => handleDescriptionSelect(desc)}
                            >
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={
                                    selectedDescription?._id === desc._id
                                  }
                                  onChange={() => {}}
                                  className="mr-2 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span>{desc?.title}</span>
                              </div>
                              <button
                                type="button"
                                className="text-orange-600 hover:text-orange-800 ml-2 flex items-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsDetailsOpen((prev) => ({
                                    ...prev,
                                    [desc._id]: !prev[desc._id],
                                  }));
                                }}
                              >
                                <IoChevronDown
                                  className="ml-1 text-gray-500"
                                  size={14}
                                />
                              </button>
                            </li>
                            {isDetailsOpen[desc._id] && (
                              <li className="px-6 py-2 text-white bg-primary rounded-b-md">
                                Details: {desc.description?.title} (Timeline:{" "}
                                {desc.timeline} {desc.timeUnit})
                              </li>
                            )}
                          </div>
                        ))}
                        <li
                          className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                          onClick={() => handleDescriptionSelect("custom")}
                        >
                          <div className="flex items-center w-full">
                            <input
                              type="checkbox"
                              checked={selectedDescription?.title?.includes(
                                "custom"
                              )}
                              onChange={() => {}}
                              className="mr-2 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <span>Add Custom Description</span>
                          </div>
                        </li>
                      </ul>
                    )}

                    {selectedDescription.title?.includes("custom") && (
                      <li className="px-6 py-4  text-white rounded-b-md border-t">
                        <textarea
                          id="description"
                          name="description"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200 text-black placeholder-gray-500"
                          rows="4"
                          value={formData.description}
                          onChange={handleCustomDescriptionChange}
                          placeholder="Enter custom issue description"
                          required
                        ></textarea>
                      </li>
                    )}
                  </div>
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
                    disabled={
                      isLoading ||
                      (!formData.description &&
                        !selectedDescription.title?.includes("custom"))
                    }
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
                      setSelectedDescription("");
                      setIsDetailsOpen({});
                      setIsDescriptionOpen(false);
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
      </div>

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <Loading />
        </div>
      )}

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
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Update"}
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
                  <strong>Description:</strong>{" "}
                  {selectedIssue.description?.title}
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
